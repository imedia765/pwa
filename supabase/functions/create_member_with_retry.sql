create or replace function create_member_with_retry(
  p_member_number text,
  p_email text,
  p_full_name text
) returns table (
  email text,
  member_number text,
  profile_updated boolean,
  password_changed boolean
) language plpgsql security definer as $$
declare
  v_member record;
begin
  -- First try to get existing member
  select * into v_member from members 
  where member_number = p_member_number;
  
  if found then
    return query select 
      v_member.email,
      v_member.member_number,
      v_member.profile_updated,
      v_member.password_changed
    from members where id = v_member.id;
    return;
  end if;

  -- Try to create new member
  return query 
  insert into members (
    member_number,
    email,
    full_name,
    verified,
    profile_updated,
    password_changed,
    email_verified,
    status
  ) values (
    p_member_number,
    p_email,
    p_full_name,
    true,
    false,
    false,
    true,
    'active'
  )
  on conflict (member_number) do update 
    set member_number = excluded.member_number
  returning 
    email,
    member_number,
    profile_updated,
    password_changed;
end;
$$;