create or replace function public.grant_admin_for_team_email()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email_confirmed_at is not null
     and lower(new.email) in ('ludovic@formatrix.fr','contact@skills4mation.com') then
    insert into public.user_roles (user_id, role)
    values (new.id, 'admin')
    on conflict (user_id, role) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_grant_admin on auth.users;
create trigger on_auth_user_created_grant_admin
after insert on auth.users
for each row execute function public.grant_admin_for_team_email();

drop trigger if exists on_auth_user_confirmed_grant_admin on auth.users;
create trigger on_auth_user_confirmed_grant_admin
after update of email_confirmed_at on auth.users
for each row
when (old.email_confirmed_at is null and new.email_confirmed_at is not null)
execute function public.grant_admin_for_team_email();

insert into public.user_roles (user_id, role)
select u.id, 'admin'::app_role from auth.users u
where u.email_confirmed_at is not null
  and lower(u.email) in ('ludovic@formatrix.fr','contact@skills4mation.com')
on conflict (user_id, role) do nothing;