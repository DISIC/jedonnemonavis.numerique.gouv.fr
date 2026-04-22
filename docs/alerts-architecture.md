# Alerting feature — architecture notes

Email alerts fired shortly after new reviews are submitted on a form, with a per-form opt-in per user, a global per-user kill-switch, and a debounce policy (5 min sliding window + 2 h hard cap).

This document answers the architectural questions that came up during implementation.

---

## 1. The flow — what happens when a citizen submits a review

1. **webapp-form saves the review** (unchanged). The existing tRPC mutation (`createReview` in `review/utils.ts` or `dynamicCreateReviewMutation` in `review/dynamic-create.ts`) inserts the `Review` + `Answer` rows into Postgres.

2. **Immediately after, webapp-form calls `onReviewCreated(prisma, form_id)` — fire-and-forget.** The `void` + try/catch means a failure never breaks the review submission.

3. **`onReviewCreated` makes a debounce decision** (`webapp-form/src/server/services/alerts/on-review-created.ts`). It reads from the DB:
   - `form.last_alert_sent_at` — the cursor (when the last alert email was sent for this form)
   - The oldest review on this form since that cursor

   Then applies the rule:
   - If `now - oldest >= form.alert_max_window_minutes ?? 120` → **hard cap reached**, enqueue with `delay: 0`
   - Otherwise → **sliding window**, enqueue with `delay: 5 minutes`

4. **Push to Redis as a BullMQ delayed job:**

   ```ts
   await formAlertQueue.remove(jobId); // drop any existing pending job
   await formAlertQueue.add('process', { form_id }, { jobId, delay });
   ```

   The `jobId` is a stable string `form-alert_<formId>`. Each new review first removes the currently-pending delayed job and re-adds a fresh one with a fresh 5 min delay → **automatic sliding window**, handled by BullMQ itself. No timer in application code, no polling.

5. **Redis holds the delayed job until the countdown elapses.**
   - No more reviews for 5 min → BullMQ fires the job.
   - Another review comes in → steps 3–4 repeat, pending job gets replaced, clock resets.

6. **The worker in webapp-backoffice consumes the fired job** (`src/workers/alert-worker.ts`). It calls `processFormAlertBatch(form_id)`, which:
   - Loads the form + product + entity; skips if `form.isDeleted`.
   - Counts reviews since cursor up to "now" via `countReviewsForBatch` (uses `Review.has_verbatim` for the `withComments` count — no Answer join needed).
   - Resolves recipients: `FormAlertSubscription.enabled = true` ∧ `User.alerts_enabled = true` ∧ access (site-wide admin OR `AccessRight` with `status != removed` OR `AdminEntityRight` on parent entity).
   - Renders + sends one email per recipient via `sendMail`, throttled 5 s every 10 sends (mirrors `trigger-send-notif-mails.ts`).
   - Inserts one `UserEvent { action: 'form_alert_sent', metadata: { total, withComments, batch_start, batch_end } }` per recipient.
   - Advances `form.last_alert_sent_at = now`.

---

## 2. Why does BullMQ live in webapp-form at all?

Only because of **steps 3–4** above — the producer side calls `queue.add(..., { delay })`. To instantiate a `Queue`, you need a Redis connection, which is why `redis.ts` and `queue.ts` exist in webapp-form. The **worker** (the consumer that does the actual work) stays in webapp-backoffice. Both apps point at the same Redis instance, which is how BullMQ coordinates them.

### Alternatives considered, and why they were rejected

**HTTP call to a backoffice OpenAPI endpoint.** webapp-form could `fetch` a protected backoffice endpoint after each review-create; that endpoint would do the debounce decision and enqueue. No BullMQ/Redis in webapp-form at all.

- Pros: single point of BullMQ/Redis usage, cleaner separation, matches the existing `/triggerMails` pattern.
- Cons: extra network hop per review, new auth surface, extra failure mode.

**Polling from the worker side.** A cron would tick every ~1 min on the backoffice; the handler would scan `Form` where `last_review_at > last_alert_sent_at` and apply the same debounce rule.

- Pros: no producer needed anywhere, no Redis client in webapp-form.
- Cons: loses sub-second reactivity (up to 1 min of polling lag), adds DB polling load, requires Clever Cloud cron to support a 1 min interval.

**PostgreSQL `LISTEN`/`NOTIFY`.** webapp-form issues `NOTIFY form_alert, '<form_id>'` using the existing DB connection; the backoffice worker `LISTEN`s and enqueues.

- Pros: no Redis client in webapp-form.
- Cons: unusual pattern for this codebase, harder to reason about failure modes, no retry on the notify channel.

The current design (producer-side BullMQ in webapp-form) was chosen for **reactivity**: the sliding-window timer is held in Redis, not in application polling, so emails fire exactly 5 min after the last review arrives. The debate is real — if operational simplicity of keeping BullMQ entirely in the backoffice becomes more valuable than sub-second reactivity, switching to the polling approach is a straightforward refactor.

---

## 3. Why `redis.ts` and `queue.ts` are duplicated in both apps

The duplication isn't really duplication — it's two endpoints of a decoupled producer/consumer pipeline that share a small config.

```
  webapp-form                   webapp-backoffice
  (producer)                    (consumer / worker)
       │                                 ▲
       │ queue.add({form_id})            │ new Worker('form-alerts', processFn)
       │                                 │
       └────────►  REDIS  ◄──────────────┘
                  (queue name: 'form-alerts')
```

- webapp-form only ever **adds** jobs.
- webapp-backoffice only ever **consumes** them.
- Neither app imports a line of code from the other.

What they actually share — the **contract** — is tiny:

1. Same Redis instance (same `REDIS_URL`).
2. Same queue name string: `'form-alerts'`.
3. Same job payload shape: `{ form_id: number }`.

That's BullMQ's whole value prop: if those three agree, producer and consumer don't care where or what language the other side is written in.

### So why the files in both apps?

Because each side needs its own BullMQ handle to _talk to_ that shared Redis:

- The producer needs a `Queue` object → needs a Redis connection → `redis.ts` + `queue.ts`.
- The consumer needs a `Worker` object → also needs a Redis connection → same files on the other side.

Both are ~18 lines of Redis singleton + ~20 lines of Queue declaration. They look identical because they _are_ the same contract, re-declared per app.

### Why not factor it out?

| Option                                       | Verdict                                                                                                                          |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **Shared workspace package** (`@jdma/queue`) | Clean, but the monorepo doesn't have yarn workspaces set up for shared TS. Heavier than the duplication for a one-queue feature. |
| **Symlink** (like `prisma/schema.prisma`)    | Works, but symlinks for `.ts` files can confuse TypeScript / bundlers.                                                           |
| **Keep it duplicated** (current)             | Matches the existing project convention: schema is the only thing shared, everything else is re-declared per app.                |

**Drift risk:** the only way drift matters is if the queue name or payload shape changed on one side and not the other — producers would pile up jobs on an orphaned queue, or the consumer would fail to deserialize. Small risk in practice: one-line string + one-line type, changed rarely.

**Migration trigger:** if this grows to 3+ queues and you find yourself editing both trees every time, that's the moment to set up a shared workspace package.

---

## 4. Why not use BullMQ's `JobScheduler`?

Short answer: **`JobScheduler` is for recurring jobs (cron-like), which isn't what we need**. The delayed-job + stable-`jobId` pattern we use is the idiomatic BullMQ debounce.

### What `JobScheduler` is designed for

`upsertJobScheduler` (successor to the older `repeat` option) is for jobs that fire on a recurring schedule:

- `{ pattern: '0 8 * * 1' }` → every Monday at 8 AM
- `{ every: 60_000 }` → every 60 s forever
- `{ pattern: '…', limit: 5 }` → 5 times total, then stop

It's cron-inside-BullMQ. Right fit for: daily synthesis emails, nightly ES reindex, hourly cleanup.

### What we need: sliding-window debounce

- A review arrives → start a 5 min timer.
- Another review arrives before the timer fires → reset the timer.
- Timer fires → process the batch.

BullMQ doesn't have a first-class debounce primitive, but it has the building blocks:

| Need                                              | BullMQ feature                                          |
| ------------------------------------------------- | ------------------------------------------------------- |
| "Fire once, N ms from now"                        | `queue.add(name, data, { delay: N })`                   |
| "If another one arrives, replace the pending one" | Stable `jobId` + `queue.remove(jobId)` before re-adding |

### Could `JobScheduler` be force-fit?

Technically yes — `upsertJobScheduler('form-alert_123', { every: 5*60*1000, limit: 1 })` fires once after 5 min, and re-upserting resets. But:

1. **Semantics are wrong.** A "scheduler" implies "on a schedule"; `limit: 1` is a tell you're abusing the tool.
2. **More state in Redis.** Schedulers persist metadata alongside the job, cleaned up lazily. Plain delayed jobs disappear the moment they're consumed or removed.
3. **Worse ops visibility.** A scheduler shows up as "Repeatable" in Bull Board dashboards, looking like it should recur forever. A delayed job with `jobId: form-alert_42` tells on-call exactly what's pending.
4. **No power gained.**

### Verdict

- **Delayed jobs + stable `jobId`** → right tool for debounce. What we use.
- **JobScheduler** → right tool for "every Monday / every hour / every 5 min forever". Reserve for a future migration of the existing `/triggerMails` external cron to BullMQ-internal scheduling.

---

## 5. A TypeScript error that can surface after the Phase 1 schema change

After adding `User.alerts_enabled: Boolean @default(false)` to the Prisma model, the generated TypeScript `User` type gains a required `alerts_enabled: boolean`. The NextAuth ProConnect provider in `webapp-backoffice/src/pages/api/auth/[...nextauth].ts` has a `profile()` callback that returns a `User`-shaped literal object. Every field is listed explicitly, so the new one must be added:

```ts
profile(profile) {
  return {
    // … existing fields
    notifications: false,
    notifications_frequency: 'daily',
    alerts_enabled: false,          // ← new field, required
    created_at: new Date(),
    updated_at: new Date(),
    proconnect_account: false
  };
}
```

Any other place in the codebase that builds a `User`-shaped object literal (seed scripts, test fixtures, other auth providers) will hit the same error. A quick `grep -rn "notifications_frequency:" webapp-backoffice/src webapp-backoffice/prisma` surfaces the candidates.

---

## 6. Strictly opt-in at launch

Guaranteed by defaults, no code needed:

- `User.alerts_enabled` defaults to `false` → every user starts with the global kill-switch off.
- `FormAlertSubscription` table is empty at deploy time → no one is subscribed to anything.

Post-deploy rollout check:

```sql
SELECT COUNT(*) FROM "FormAlertSubscription" WHERE enabled = true;
SELECT COUNT(*) FROM "User" WHERE alerts_enabled = true;
-- Both should be 0.
```

Once both gates are off, no alerts fire regardless of review activity.

---

## 7. Manual smoke test

No unit test suite is set up for this feature. The end-to-end flow is short enough to walk through manually.

### One-time setup

- `docker compose up -d` — brings up Postgres, Elasticsearch, Kibana, **Redis** (added by this feature).
- A MailHog instance listening on `localhost:1025` (SMTP) + `localhost:8025` (web UI). You can start one ad-hoc:
  ```bash
  docker run -d --name mailhog -p 1025:1025 -p 8025:8025 mailhog/mailhog
  ```
  (MailHog is already configured in `docker-compose.tests.yaml` if you prefer to use the full test stack.)
- Confirm `REDIS_URL=redis://localhost:6379` is set in both apps' `.env`.
- `webapp-backoffice/.env`: `NODEMAILER_HOST=localhost`, `NODEMAILER_PORT=1025`, `NODEMAILER_BASEURL=http://localhost:3000`.

### Start the three processes (three terminals)

```bash
# terminal 1 — backoffice API + UI
cd webapp-backoffice && yarn dev
# terminal 2 — alert worker
cd webapp-backoffice && yarn worker:dev
# terminal 3 — public form app
cd webapp-form && yarn dev
```

You should see `[alert-worker] Started (concurrency=5)` in terminal 2.

### Happy path

1. In the backoffice, sign in → user account → Notifications → toggle **"Recevoir des alertes…"** ON.
2. Open a form's settings tab → toggle **"Recevoir des alertes par email"** ON.
3. Submit one review on that form via the public form app (`http://localhost:3001/<form-id>`).
4. Watch terminal 2 — a job appears with `jobId=form-alert_<formId>`, `delay=5min`. You can cut the wait to ~10 s by temporarily lowering `DEBOUNCE_DELAY_MS` in `webapp-form/src/server/services/alerts/on-review-created.ts`.
5. After the delay elapses, the worker logs `Sent form … alert to 1 recipient(s)`.
6. MailHog UI (`http://localhost:8025`) shows the email. Subject: _Nouveaux avis sur le formulaire … du service …_. Body contains the counts and a CTA link to `?tab=reviews`.

### Things to verify (checklist)

- [ ] **Sliding window**: submit review → within 5 min submit another → the clock resets (pending job gets `remove`d and re-added; Bull Board / Redis inspect confirms one delayed job with the new fire time).
- [ ] **Hard cap**: set `form.alert_max_window_minutes = 1` in DB, submit a review, then keep submitting inside the 5 min window. After 1 min the next submission schedules with `delay: 0` → email fires.
- [ ] **`withComments` count**: submit two reviews — one with a verbatim (free-text answer), one without. Email body reads _"…dont 1 avec commentaire."_
- [ ] **Global kill-switch gate**: flip user's `alerts_enabled` OFF → submit review → no email, no `UserEvent` written.
- [ ] **Per-form subscription gate**: disable subscription on the form → submit review → no email.
- [ ] **Deleted form**: set `form.isDeleted = true` → submit review would fail anyway, but `processFormAlertBatch` logs _"Skipping form … (missing or deleted)"_ if a job was already in flight.
- [ ] **Access revocation**: remove the user's `AccessRight` (`status = 'removed'`) → subscription row stays, but email is skipped at send-time.
- [ ] **UserEvent audit**: after each successful send, one row in `UserEvent` with `action = 'form_alert_sent'` per recipient, metadata showing `total` / `withComments` / `batch_start` / `batch_end`.
- [ ] **Cursor advance**: `form.last_alert_sent_at` updates to the batch send time; next batch starts from there.
- [ ] **Worker restart resilience**: kill the `worker:dev` process while a job is pending, restart it — BullMQ picks the job back up from Redis.

### Preview the email template without a live flow

```bash
cd webapp-backoffice && yarn email:dev
```

Opens the react-email preview server at `localhost:3001` (or similar) with all templates including `jdma-alert-email`.
