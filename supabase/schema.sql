create extension if not exists "pgcrypto";

do $$
begin
  if not exists (select 1 from pg_type where typname = 'attendance_status') then
    create type attendance_status as enum ('Present', 'Absent', 'Tardy');
  end if;
  if not exists (select 1 from pg_type where typname = 'fee_status') then
    create type fee_status as enum ('Paid', 'Pending');
  end if;
end $$;

create or replace function public.current_role()
returns text
language sql
stable
as $$
  select coalesce(
    auth.jwt() -> 'app_metadata' ->> 'role',
    auth.jwt() -> 'user_metadata' ->> 'role',
    'Unknown'
  );
$$;

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  grade_level text not null,
  parent_contact text,
  auth_user_id uuid,
  created_at timestamptz not null default now()
);

alter table public.students
  add column if not exists auth_user_id uuid;

create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  date date not null,
  status attendance_status not null,
  created_at timestamptz not null default now(),
  unique (student_id, date)
);

create table if not exists public.fees (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  amount numeric(10, 2) not null,
  status fee_status not null default 'Pending',
  due_date date not null,
  created_at timestamptz not null default now()
);

create index if not exists attendance_date_idx on public.attendance (date);
create index if not exists fees_status_idx on public.fees (status);
create index if not exists students_auth_user_idx on public.students (auth_user_id);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'fees_amount_positive'
  ) then
    alter table public.fees
      add constraint fees_amount_positive check (amount > 0) not valid;
  end if;
  if not exists (
    select 1
    from pg_constraint
    where conname = 'fees_due_date_not_past'
  ) then
    alter table public.fees
      add constraint fees_due_date_not_past check (due_date >= current_date) not valid;
  end if;
end $$;
create unique index if not exists students_auth_user_unique
  on public.students (auth_user_id)
  where auth_user_id is not null;

alter table public.students enable row level security;
alter table public.attendance enable row level security;
alter table public.fees enable row level security;

drop policy if exists "students_select_staff" on public.students;
drop policy if exists "students_select_self" on public.students;
drop policy if exists "students_admin_write" on public.students;
drop policy if exists "attendance_select_staff" on public.attendance;
drop policy if exists "attendance_select_self" on public.attendance;
drop policy if exists "attendance_insert_staff" on public.attendance;
drop policy if exists "attendance_update_staff" on public.attendance;
drop policy if exists "attendance_delete_admin" on public.attendance;
drop policy if exists "fees_select_staff" on public.fees;
drop policy if exists "fees_select_self" on public.fees;
drop policy if exists "fees_admin_write" on public.fees;

create policy "students_select_staff"
  on public.students
  for select
  using (public.current_role() in ('Admin', 'Teacher'));

create policy "students_select_self"
  on public.students
  for select
  using (
    public.current_role() = 'Student'
    and auth.uid() = auth_user_id
  );

create policy "students_admin_write"
  on public.students
  for all
  using (public.current_role() = 'Admin')
  with check (public.current_role() = 'Admin');

create policy "attendance_select_staff"
  on public.attendance
  for select
  using (public.current_role() in ('Admin', 'Teacher'));

create policy "attendance_select_self"
  on public.attendance
  for select
  using (
    public.current_role() = 'Student'
    and exists (
      select 1
      from public.students
      where public.students.id = public.attendance.student_id
        and public.students.auth_user_id = auth.uid()
    )
  );

create policy "attendance_insert_staff"
  on public.attendance
  for insert
  with check (public.current_role() in ('Admin', 'Teacher'));

create policy "attendance_update_staff"
  on public.attendance
  for update
  using (public.current_role() in ('Admin', 'Teacher'))
  with check (public.current_role() in ('Admin', 'Teacher'));

create policy "attendance_delete_admin"
  on public.attendance
  for delete
  using (public.current_role() = 'Admin');

create policy "fees_select_staff"
  on public.fees
  for select
  using (public.current_role() in ('Admin', 'Teacher'));

create policy "fees_select_self"
  on public.fees
  for select
  using (
    public.current_role() = 'Student'
    and exists (
      select 1
      from public.students
      where public.students.id = public.fees.student_id
        and public.students.auth_user_id = auth.uid()
    )
  );

create policy "fees_admin_write"
  on public.fees
  for all
  using (public.current_role() = 'Admin')
  with check (public.current_role() = 'Admin');
