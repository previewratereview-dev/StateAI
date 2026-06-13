-- Create bookings table
create table if not exists public.bookings (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    name text not null,
    email text not null,
    company text,
    purpose text not null,
    meeting_date date not null,
    meeting_time text not null,
    duration integer not null, -- duration in minutes (e.g. 15, 30, 60)
    notes text,
    status text default 'pending' not null, -- pending, confirmed, completed, cancelled
    admin_notes text
);

-- Set up Row Level Security (RLS)
alter table public.bookings enable row level security;

-- Create policy to allow insert from anon/public role (meeting submission)
create policy "Allow anonymous insertion to bookings" on public.bookings
    for insert to anon, authenticated
    with check (true);

-- Create policy to allow selection only for authenticated users (CRM view)
create policy "Allow authenticated select bookings" on public.bookings
    for select to authenticated
    using (true);

-- Create policy to allow update only for authenticated users (CRM management)
create policy "Allow authenticated update bookings" on public.bookings
    for update to authenticated
    using (true);

-- Create policy to allow delete only for authenticated users (CRM management)
create policy "Allow authenticated delete bookings" on public.bookings
    for delete to authenticated
    using (true);
