-- Tracks the free-once-per-visitor calculator use server-side, keyed by IP
-- address, so it can't be reset just by clearing localStorage or opening a
-- private window. Only the edge function (service role) ever touches this
-- table — no RLS policies are needed since clients never query it directly.
create table public.free_use_log (
  ip_address text not null,
  feature text not null,
  first_used_at timestamptz not null default now(),
  primary key (ip_address, feature)
);

alter table public.free_use_log enable row level security;
