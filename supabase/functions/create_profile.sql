-- Function to create a profile with elevated permissions
create or replace function create_profile(
  p_id uuid,
  p_email text,
  p_user_id uuid
) returns void as $$
begin
  insert into profiles (
    id,
    email,
    user_id,
    created_at,
    updated_at
  ) values (
    p_id,
    p_email,
    p_user_id,
    now(),
    now()
  );
end;
$$ language plpgsql security definer;

-- Grant execute permission to authenticated users
grant execute on function create_profile to authenticated;