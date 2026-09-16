-- IoT Center production schema. Run in Supabase SQL Editor.
create extension if not exists pgcrypto;
create type public.user_role as enum ('student','faculty','admin');
create type public.task_status as enum ('pending','in_progress','submitted','reviewed','overdue');
create type public.project_stage as enum ('idea','research','design','development','testing','completed');
create table public.profiles (id uuid primary key references auth.users(id) on delete cascade, role public.user_role not null default 'student', full_name text not null, email text, avatar_url text, department text, year text, section text, designation text, bio text, skills text[] default '{}', interests text[] default '{}', github text, linkedin text, created_at timestamptz default now(), updated_at timestamptz default now());
create table public.groups (id uuid primary key default gen_random_uuid(), name text not null, description text, leader_id uuid references public.profiles(id), mentor_id uuid references public.profiles(id), category text, created_at timestamptz default now());
create table public.group_members (group_id uuid references public.groups(id) on delete cascade, user_id uuid references public.profiles(id) on delete cascade, joined_at timestamptz default now(), primary key(group_id,user_id));
create table public.announcements (id uuid primary key default gen_random_uuid(), title text not null, description text not null, image_url text, attachment_url text, priority text default 'normal', target_type text default 'all', target_group_id uuid references public.groups(id), posted_by uuid references public.profiles(id), created_at timestamptz default now());
create table public.daily_updates (id uuid primary key default gen_random_uuid(), title text not null, description text not null, images text[] default '{}', attachment_url text, link_url text, posted_by uuid references public.profiles(id), created_at timestamptz default now());
create table public.tasks (id uuid primary key default gen_random_uuid(), title text not null, description text, topic text, instructions text, assigned_by uuid references public.profiles(id), group_id uuid references public.groups(id), assigned_to uuid references public.profiles(id), start_date date, deadline date, priority text default 'normal', attachment_url text, reference_links text[] default '{}', marks numeric, submission_type text default 'multiple', created_at timestamptz default now());
create table public.task_submissions (id uuid primary key default gen_random_uuid(), task_id uuid references public.tasks(id) on delete cascade, student_id uuid references public.profiles(id), text_content text, file_urls text[] default '{}', link_url text, status public.task_status default 'submitted', feedback text, marks numeric, submitted_at timestamptz default now(), reviewed_at timestamptz);
create table public.topics (id uuid primary key default gen_random_uuid(), title text not null, category text, group_id uuid references public.groups(id), supervisor_id uuid references public.profiles(id), deadline date, status public.task_status default 'pending', description text, created_at timestamptz default now());
create table public.projects (id uuid primary key default gen_random_uuid(), title text not null, description text, image_url text, group_id uuid references public.groups(id), mentor_id uuid references public.profiles(id), technologies text[] default '{}', stage public.project_stage default 'idea', progress int default 0 check(progress between 0 and 100), github_url text, demo_url text, documentation_url text, featured boolean default false, created_at timestamptz default now());
create table public.events (id uuid primary key default gen_random_uuid(), title text not null, description text, image_url text, event_date date not null, event_time time, venue text, speaker text, registration_url text, created_by uuid references public.profiles(id), created_at timestamptz default now());
create table public.resources (id uuid primary key default gen_random_uuid(), title text not null, category text, description text, file_url text, external_url text, uploaded_by uuid references public.profiles(id), created_at timestamptz default now());
create table public.gallery (id uuid primary key default gen_random_uuid(), title text, image_url text not null, category text, uploaded_by uuid references public.profiles(id), created_at timestamptz default now());
create table public.notifications (id uuid primary key default gen_random_uuid(), user_id uuid references public.profiles(id) on delete cascade, title text not null, body text, link_url text, read boolean default false, created_at timestamptz default now());
create table public.comments (id uuid primary key default gen_random_uuid(), user_id uuid references public.profiles(id) on delete cascade, entity_type text not null, entity_id uuid not null, body text not null, created_at timestamptz default now());
create table public.likes (user_id uuid references public.profiles(id) on delete cascade, entity_type text not null, entity_id uuid not null, created_at timestamptz default now(), primary key(user_id,entity_type,entity_id));
create table public.settings (key text primary key, value jsonb not null default '{}', updated_at timestamptz default now());

alter table public.profiles enable row level security; alter table public.groups enable row level security; alter table public.group_members enable row level security; alter table public.announcements enable row level security; alter table public.daily_updates enable row level security; alter table public.tasks enable row level security; alter table public.task_submissions enable row level security; alter table public.topics enable row level security; alter table public.projects enable row level security; alter table public.events enable row level security; alter table public.resources enable row level security; alter table public.gallery enable row level security; alter table public.notifications enable row level security; alter table public.comments enable row level security; alter table public.likes enable row level security; alter table public.settings enable row level security;
create or replace function public.current_role() returns public.user_role language sql stable security definer set search_path=public as $$ select role from public.profiles where id=auth.uid() $$;
create policy "profiles read authenticated" on public.profiles for select to authenticated using (true);
create policy "own profile update" on public.profiles for update to authenticated using(id=auth.uid()) with check(id=auth.uid());
create policy "content read authenticated" on public.announcements for select to authenticated using(true);
create policy "updates read authenticated" on public.daily_updates for select to authenticated using(true);
create policy "groups read authenticated" on public.groups for select to authenticated using(true);
create policy "members read authenticated" on public.group_members for select to authenticated using(true);
create policy "projects read authenticated" on public.projects for select to authenticated using(true);
create policy "events read authenticated" on public.events for select to authenticated using(true);
create policy "resources read authenticated" on public.resources for select to authenticated using(true);
create policy "gallery read authenticated" on public.gallery for select to authenticated using(true);
create policy "tasks read relevant" on public.tasks for select to authenticated using(assigned_to=auth.uid() or assigned_by=auth.uid() or group_id in(select group_id from public.group_members where user_id=auth.uid()) or public.current_role() in('faculty','admin'));
create policy "submissions read relevant" on public.task_submissions for select to authenticated using(student_id=auth.uid() or task_id in(select id from public.tasks where assigned_by=auth.uid()) or public.current_role() in('faculty','admin'));
create policy "notifications own" on public.notifications for select to authenticated using(user_id=auth.uid());
create policy "notifications update own" on public.notifications for update to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy "comments read" on public.comments for select to authenticated using(true);
create policy "comments own insert" on public.comments for insert to authenticated with check(user_id=auth.uid());
create policy "likes read" on public.likes for select to authenticated using(true);
create policy "likes own" on public.likes for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
-- Faculty/admin CRUD policies
create policy "faculty manage announcements" on public.announcements for all to authenticated using(public.current_role() in('faculty','admin')) with check(public.current_role() in('faculty','admin'));
create policy "faculty manage updates" on public.daily_updates for all to authenticated using(public.current_role() in('faculty','admin')) with check(public.current_role() in('faculty','admin'));
create policy "faculty manage tasks" on public.tasks for all to authenticated using(public.current_role() in('faculty','admin')) with check(public.current_role() in('faculty','admin'));
create policy "faculty manage topics" on public.topics for all to authenticated using(public.current_role() in('faculty','admin')) with check(public.current_role() in('faculty','admin'));
create policy "faculty manage groups" on public.groups for all to authenticated using(public.current_role() in('faculty','admin')) with check(public.current_role() in('faculty','admin'));
create policy "faculty manage projects" on public.projects for all to authenticated using(public.current_role() in('faculty','admin')) with check(public.current_role() in('faculty','admin'));
create policy "faculty manage events" on public.events for all to authenticated using(public.current_role() in('faculty','admin')) with check(public.current_role() in('faculty','admin'));
create policy "faculty manage resources" on public.resources for all to authenticated using(public.current_role() in('faculty','admin')) with check(public.current_role() in('faculty','admin'));
create policy "faculty manage gallery" on public.gallery for all to authenticated using(public.current_role() in('faculty','admin')) with check(public.current_role() in('faculty','admin'));
create policy "student submit" on public.task_submissions for insert to authenticated with check(student_id=auth.uid());
create policy "student update own submission" on public.task_submissions for update to authenticated using(student_id=auth.uid()) with check(student_id=auth.uid());
-- Auth trigger
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$ begin insert into public.profiles(id,email,full_name,role) values(new.id,new.email,coalesce(new.raw_user_meta_data->>'full_name','New User'),coalesce((new.raw_user_meta_data->>'role')::public.user_role,'student')); return new; end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
-- Storage buckets
insert into storage.buckets(id,name,public) values('avatars','avatars',true),('portal-files','portal-files',false),('gallery','gallery',true) on conflict do nothing;
