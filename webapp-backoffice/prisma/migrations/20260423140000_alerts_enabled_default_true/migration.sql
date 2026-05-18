-- Flip User.alerts_enabled default: new users are opted into alerts by default.
-- Per-form subscriptions stay empty at rollout (opt-in via FormAlertSubscription row),
-- so this is safe — no alerts can fire until a user explicitly subscribes to a form.
ALTER TABLE "User" ALTER COLUMN "alerts_enabled" SET DEFAULT true;
UPDATE "User" SET "alerts_enabled" = true WHERE "alerts_enabled" = false;
