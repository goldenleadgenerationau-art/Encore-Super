-- Square cancels a subscription effective at the end of the current billing
-- period, not immediately — the row's `status` stays ACTIVE until Square's
-- webhook fires at the actual period end. This flag lets the UI say "won't
-- renew" in the meantime instead of looking like nothing happened.
alter table public.subscriptions
  add column cancel_at_period_end boolean not null default false;
