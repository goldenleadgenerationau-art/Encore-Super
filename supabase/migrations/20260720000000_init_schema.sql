-- Encore Super core schema: profiles, bands, band members, subscriptions.
-- Every table is scoped to the owning user via Row Level Security so one
-- musician's band roster and subscription status are never visible to another.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  has_full_access_override boolean not null default false,
  created_at timestamptz not null default now()
);

-- Auto-create a profile row whenever a new auth user signs up.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create table public.bands (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table public.band_members (
  id uuid primary key default gen_random_uuid(),
  band_id uuid not null references public.bands (id) on delete cascade,
  name text not null,
  super_fund_name text,
  usi text,
  member_number text,
  created_at timestamptz not null default now()
);

create index band_members_band_id_idx on public.band_members (band_id);

-- One row per user. Only the edge functions (service role, which bypasses
-- RLS) ever write to this table — a client can only ever read their own row.
create table public.subscriptions (
  user_id uuid primary key references auth.users (id) on delete cascade,
  square_customer_id text,
  square_subscription_id text,
  billing_interval text, -- 'monthly' or 'yearly'
  status text not null default 'NONE',
  current_period_end timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.bands enable row level security;
alter table public.band_members enable row level security;
alter table public.subscriptions enable row level security;

create policy "read own profile" on public.profiles
  for select using (id = auth.uid());

create policy "read own bands" on public.bands
  for select using (owner_id = auth.uid());
create policy "insert own bands" on public.bands
  for insert with check (owner_id = auth.uid());
create policy "update own bands" on public.bands
  for update using (owner_id = auth.uid());
create policy "delete own bands" on public.bands
  for delete using (owner_id = auth.uid());

create policy "read own band members" on public.band_members
  for select using (
    exists (select 1 from public.bands where bands.id = band_members.band_id and bands.owner_id = auth.uid())
  );
create policy "insert own band members" on public.band_members
  for insert with check (
    exists (select 1 from public.bands where bands.id = band_members.band_id and bands.owner_id = auth.uid())
  );
create policy "update own band members" on public.band_members
  for update using (
    exists (select 1 from public.bands where bands.id = band_members.band_id and bands.owner_id = auth.uid())
  );
create policy "delete own band members" on public.band_members
  for delete using (
    exists (select 1 from public.bands where bands.id = band_members.band_id and bands.owner_id = auth.uid())
  );

create policy "read own subscription" on public.subscriptions
  for select using (user_id = auth.uid());
