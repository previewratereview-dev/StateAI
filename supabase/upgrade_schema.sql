-- ─── Database Overhaul for SaaS Upgrade ─────────────────────────────────

-- 1. Extend profiles table
alter table public.profiles
  add column if not exists team text,
  add column if not exists status text default 'active' not null;

-- 2. Extend contacts table
alter table public.contacts
  add column if not exists last_activity_at timestamp with time zone default now();

-- 3. Create quotes table
create table if not exists public.quotes (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now() not null,
  deal_id uuid references public.deals(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete set null,
  title text not null,
  amount numeric not null,
  status text default 'draft' not null, -- draft, sent, accepted, declined
  created_by uuid references public.profiles(id) on delete set null
);

-- 4. Create invoices table
create table if not exists public.invoices (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now() not null,
  deal_id uuid references public.deals(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete set null,
  amount numeric not null,
  status text default 'draft' not null, -- draft, sent, paid, overdue
  created_by uuid references public.profiles(id) on delete set null
);

-- 5. Create audit_logs table
create table if not exists public.audit_logs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now() not null,
  user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  ip_address text,
  user_agent text,
  browser text,
  os text,
  device text,
  metadata jsonb default '{}'::jsonb
);

-- 6. Create daily_targets table
create table if not exists public.daily_targets (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now() not null,
  user_id uuid references public.profiles(id) on delete cascade,
  date date default current_date not null,
  calls_target integer default 30 not null,
  meetings_target integer default 5 not null,
  quotes_target integer default 3 not null,
  followups_target integer default 10 not null,
  revenue_target numeric default 5000 not null,
  calls_progress integer default 0 not null,
  meetings_progress integer default 0 not null,
  quotes_progress integer default 0 not null,
  followups_progress integer default 0 not null,
  revenue_progress numeric default 0 not null,
  constraint unique_user_date unique(user_id, date)
);

-- 7. Create notifications table
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now() not null,
  user_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  read boolean default false not null,
  type text default 'info' not null -- info, success, warning, error, alert
);

-- RLS Configuration for new tables
alter table public.quotes enable row level security;
alter table public.invoices enable row level security;
alter table public.audit_logs enable row level security;
alter table public.daily_targets enable row level security;
alter table public.notifications enable row level security;

-- Admin policies
create policy "Admins can do everything on quotes" on public.quotes for all to authenticated using (true);
create policy "Admins can do everything on invoices" on public.invoices for all to authenticated using (true);
create policy "Admins can do everything on audit_logs" on public.audit_logs for all to authenticated using (true);
create policy "Admins can do everything on daily_targets" on public.daily_targets for all to authenticated using (true);
create policy "Admins can do everything on notifications" on public.notifications for all to authenticated using (true);

-- Sales user policies
create policy "Sales users can manage owned quotes" on public.quotes for all to authenticated 
  using (created_by = auth.uid()) with check (created_by = auth.uid());
create policy "Sales users can manage owned invoices" on public.invoices for all to authenticated 
  using (created_by = auth.uid()) with check (created_by = auth.uid());
create policy "Sales users can read own targets" on public.daily_targets for select to authenticated 
  using (user_id = auth.uid());
create policy "Sales users can read own notifications" on public.notifications for select to authenticated 
  using (user_id = auth.uid());
create policy "Sales users can update own notifications" on public.notifications for update to authenticated 
  using (user_id = auth.uid());
