-- Flip User.alerts_enabled default: new users are opted into alerts by default.
-- Per-form subscriptions stay empty at rollout (opt-in via FormAlertSubscription row).
ALTER TABLE "User" ALTER COLUMN "alerts_enabled" SET DEFAULT true;
