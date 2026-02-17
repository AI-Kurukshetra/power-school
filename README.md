# Bac PowerSchool

Production-ready School Management System (PowerSchool alternative) built with Next.js 15, Tailwind CSS, and Supabase.

## Features
1. Supabase Auth with Admin/Teacher roles stored in `auth.users`.
2. RLS-protected tables: `students`, `attendance`, `fees`.
3. Dashboard, Student List (attendance marking), Reports (fees + trends).
4. Collapsible sidebar with mobile-friendly navigation.
5. Vercel-ready environment variable setup.

## Local Setup
1. Install dependencies

```bash
npm install
```

2. Create `.env.local` from `.env.example` and add your Supabase keys.

```bash
cp .env.example .env.local
```

3. Run the Supabase schema
- Open the Supabase SQL editor and run `supabase/schema.sql`.

4. Start the dev server

```bash
npm run dev
```

Visit `http://localhost:3000`.

## Supabase Roles
Store roles on the user record so RLS can enforce access.

Example SQL to assign a role to a user (run as service role or in SQL editor):

```sql
update auth.users
set raw_app_meta_data =
  jsonb_set(coalesce(raw_app_meta_data, '{}'::jsonb), '{role}', '"Admin"', true)
where email = 'admin@school.org';
```

Use `"Teacher"` for teacher accounts.

## Student Accounts
If you want students to sign in, assign the `"Student"` role and link their user ID
to the matching student record:

```sql
update auth.users
set raw_app_meta_data =
  jsonb_set(coalesce(raw_app_meta_data, '{}'::jsonb), '{role}', '"Student"', true)
where email = 'student@school.org';
```

Then associate the student row:

```sql
update public.students
set auth_user_id = 'USER_UUID_FROM_AUTH_USERS'
where name = 'Student Name';
```

## Seed Demo Data
This project includes a seed script that inserts:
- 100 students
- 500 attendance records
- 100 fee records

Add your Supabase **service role** key to `.env.local`:

```env
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Then run:

```bash
npm run seed -- --reset
```

`--reset` clears existing students, attendance, and fees first.

## Deployment (Vercel)
1. Push the repo to GitHub.
2. Import into Vercel.
3. Add environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Build command: `npm run build`  
Output: Next.js default

## Project Structure
- `src/app/(protected)` — authenticated routes (dashboard, students, reports).
- `src/app/login` — login screen.
- `src/lib` — Supabase clients, auth, server actions, data fetching.
- `supabase/schema.sql` — tables + RLS policies.
