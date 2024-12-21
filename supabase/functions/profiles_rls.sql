-- Drop existing policies if any
drop policy if exists "Users can view their own profile" on profiles;
drop policy if exists "Users can update their own profile" on profiles;
drop policy if exists "Authenticated users can create their profile" on profiles;

-- Enable RLS on profiles table
alter table profiles enable row level security;

-- Policy for viewing profiles
create policy "Users can view their own profile"
on profiles for select
using (
  auth.uid() = id
  or 
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
    and profiles.role = 'admin'
  )
);

-- Policy for updating profiles
create policy "Users can update their own profile"
on profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

-- Policy for creating profiles
create policy "Authenticated users can create their profile"
on profiles for insert
with check (auth.uid() = id);

-- Grant necessary permissions
grant usage on schema public to authenticated;
grant all on profiles to authenticated;