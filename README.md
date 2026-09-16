# IoT Innovation & Research Center Portal

Premium, responsive Next.js + Supabase portal foundation for a college IoT center.

## Included
- Premium landing page with responsive IoT visual system
- Student + Faculty authentication entry
- Role-aware protected navigation and Supabase RLS schema
- Student and Faculty dashboards with analytics
- Database schema for users, groups, announcements, daily updates, tasks, submissions, topics, projects, events, resources, gallery, notifications, comments, likes and settings
- Upload-ready Supabase Storage buckets
- Framer Motion interaction foundation
- Recharts analytics
- Light/dark theme control

## Run
1. `npm install`
2. Create a Supabase project.
3. Run `supabase/schema.sql` in the Supabase SQL Editor.
4. Copy `.env.example` to `.env.local` and fill in Supabase URL + anon key.
5. `npm run dev`

## Create demo users
Create users in Supabase Authentication, then update their rows in `profiles` to `student`, `faculty` or `admin`. The auth trigger creates profiles automatically.

## Production hardening
For production, add email verification, password reset flow, audit logs, rate limiting, malware scanning for uploaded files, image transformations, server-side search, pagination and backup/retention policies. The schema already separates content and roles so these can be added without redesigning the UI.
