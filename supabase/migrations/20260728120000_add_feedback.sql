-- Feedback submitted via the on-site "Leave feedback" widget. Write-only
-- from the client: anyone can insert their own feedback, but nobody can
-- read, update, or delete it through the API — only via the dashboard
-- (service role), where it can be reviewed and hand-picked into real
-- testimonials.
create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  rating smallint not null check (rating between 1 and 5),
  comment text not null,
  name text,
  role text,
  location text,
  email text,
  page_path text,
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.feedback enable row level security;

create policy "Anyone can submit feedback"
  on public.feedback for insert
  to anon, authenticated
  with check (true);
