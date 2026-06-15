-- Add contact lock columns for claim/lock workflow

alter table public.contacts
  add column if not exists locked_by uuid references public.profiles(id) on delete set null,
  add column if not exists locked_at timestamptz;

-- Optional: index to speed lookups by locked_by
create index if not exists idx_contacts_locked_by on public.contacts(locked_by);
