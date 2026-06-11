-- Migration: create invitations table + RLS + accept_invite RPC
-- Sprint 1.1.2 — OTP Login & Invite Flow

create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id),
  email text not null,
  role text not null check (role in ('admin', 'operator', 'guest')),
  token text not null unique,
  expires_at timestamptz not null default now() + interval '7 days',
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  created_by uuid not null references auth.users(id)
);

-- Indexes
create index idx_invitations_token on public.invitations(token);
create index idx_invitations_tenant_id on public.invitations(tenant_id);

-- RLS
alter table public.invitations enable row level security;

create policy "invitations_select_admin"
  on public.invitations
  for select
  using (
    exists (
      select 1 from public.user_tenants
      where user_tenants.user_id = auth.uid()
        and user_tenants.tenant_id = invitations.tenant_id
        and user_tenants.role = 'admin'
        and user_tenants.status = 'active'
    )
  );

create policy "invitations_insert_admin"
  on public.invitations
  for insert
  with check (
    exists (
      select 1 from public.user_tenants
      where user_tenants.user_id = auth.uid()
        and user_tenants.tenant_id = invitations.tenant_id
        and user_tenants.role = 'admin'
        and user_tenants.status = 'active'
    )
  );

create policy "invitations_update_admin"
  on public.invitations
  for update
  using (
    exists (
      select 1 from public.user_tenants
      where user_tenants.user_id = auth.uid()
        and user_tenants.tenant_id = invitations.tenant_id
        and user_tenants.role = 'admin'
        and user_tenants.status = 'active'
    )
  );

create policy "invitations_delete_admin"
  on public.invitations
  for delete
  using (
    exists (
      select 1 from public.user_tenants
      where user_tenants.user_id = auth.uid()
        and user_tenants.tenant_id = invitations.tenant_id
        and user_tenants.role = 'admin'
        and user_tenants.status = 'active'
    )
  );

-- RPC: accept_invite
-- Security definer because it crosses tenant boundary (insert into user_tenants)
create or replace function public.accept_invite(invitation_token text)
returns void
language plpgsql
security definer
as $$
declare
  inv_record record;
begin
  select * into inv_record
  from public.invitations
  where token = invitation_token
    and accepted_at is null
    and expires_at > now()
  for update;

  if not found then
    raise exception 'INVITATION_INVALID_OR_EXPIRED';
  end if;

  insert into public.user_tenants (user_id, tenant_id, role, status)
  values (auth.uid(), inv_record.tenant_id, inv_record.role, 'active');

  update public.invitations
  set accepted_at = now()
  where token = invitation_token;
end;
$$;
