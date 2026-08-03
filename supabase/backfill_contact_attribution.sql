-- Backfill contact attribution from activity history.
-- Run once in Supabase SQL editor (or migrations) so existing contacts
-- get created_by / assigned_to populated retroactively.

-- 1. Set created_by from the earliest activity logged against the contact
update public.contacts c
set created_by = a.created_by
from (
  select distinct on (contact_id) contact_id, created_by
  from public.activities
  where created_by is not null
  order by contact_id, created_at asc
) a
where c.created_by is null
  and a.contact_id = c.id;

-- 2. Default the owner (assigned_to) to the creator when unassigned
update public.contacts
set assigned_to = created_by
where assigned_to is null
  and created_by is not null;

-- Verify
select
  count(*) filter (where created_by is null)  as missing_created_by,
  count(*) filter (where assigned_to is null) as missing_assigned_to
from public.contacts;
