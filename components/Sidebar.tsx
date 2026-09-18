'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  Bell,
  BookOpen,
  CalendarDays,
  CheckSquare,
  FolderKanban,
  GalleryHorizontalEnd,
  Home,
  LogOut,
  Menu,
  PanelLeft,
  Target,
  Users,
  UserRound,
  Wifi,
  FileText,
  Settings,
  ClipboardList,
} from 'lucide-react';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Logo from './Logo';

const icons: Record<string, any> = {
  Dashboard: Home,
  'My Profile': UserRound,
  Students: Users,
  Announcements: Bell,
  'Daily Updates': Wifi,
  Tasks: CheckSquare,
  'My Topics': Target,
  'Topic Assignment': ClipboardList,
  Groups: Users,
  Projects: FolderKanban,
  Events: CalendarDays,
  Resources: BookOpen,
  Gallery: GalleryHorizontalEnd,
  Achievements: Target,
  Notifications: Bell,
  Submissions: FileText,
  Profile: UserRound,
  Settings: Settings,
};

const studentItems = [
  { label: 'Dashboard', path: '' },
  { label: 'My Profile', path: 'profile' },
  { label: 'Announcements', path: 'announcements' },
  { label: 'Daily Updates', path: 'daily-updates' },
  { label: 'Tasks', path: 'tasks' },
  { label: 'My Topics', path: 'topics' },
  { label: 'Groups', path: 'groups' },
  { label: 'Projects', path: 'projects' },
  { label: 'Events', path: 'events' },
  { label: 'Resources', path: 'resources' },
  { label: 'Gallery', path: 'gallery' },
  { label: 'Achievements', path: 'achievements' },
  { label: 'Notifications', path: 'notifications' },
  { label: 'Settings', path: 'settings' },
];

const facultyItems = [
  { label: 'Dashboard', path: '' },
  { label: 'Students', path: 'students' },
  { label: 'Groups', path: 'groups' },
  { label: 'Announcements', path: 'announcements' },
  { label: 'Daily Updates', path: 'daily-updates' },
  { label: 'Tasks', path: 'tasks' },
  { label: 'Topic Assignment', path: 'topics' },
  { label: 'Projects', path: 'projects' },
  { label: 'Events', path: 'events' },
  { label: 'Resources', path: 'resources' },
  { label: 'Gallery', path: 'gallery' },
  { label: 'Submissions', path: 'submissions' },
  { label: 'Notifications', path: 'notifications' },
  { label: 'Profile', path: 'profile' },
  { label: 'Settings', path: 'settings' },
];

export default function Sidebar({
  role,
}: {
  role: 'student' | 'faculty' | 'admin';
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const items = role === 'student' ? studentItems : facultyItems;

  const basePath = `/dashboard/${role}`;

  return (
    <>
      {/* Mobile menu */}
      <button
        className="fixed left-4 top-4 z-50 grid h-10 w-10 place-items-center rounded-xl bg-white shadow md:hidden"
        onClick={() => setOpen(!open)}
      >
        <Menu size={19} />
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r bg-white p-5 transition-transform md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between">
          <Logo />

          <button className="hidden text-slate-400 md:block">
            <PanelLeft size={18} />
          </button>
        </div>

        {/* Workspace */}
        <div className="mt-8 rounded-2xl bg-[#07162d] p-4 text-white">
          <div className="text-[10px] font-bold uppercase tracking-[.18em] text-cyan-300">
            Workspace
          </div>

          <div className="mt-1 font-extrabold">
            {role === 'student' ? 'Student Portal' : 'Faculty Console'}
          </div>

          <div className="mt-1 text-xs text-slate-400">
            IoT Innovation Center
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-5 flex-1 space-y-1 overflow-y-auto">
          {items.map((item) => {
            const Icon = icons[item.label] || FileText;

            const href = item.path
              ? `${basePath}/${item.path}`
              : basePath;

            const active =
              pathname === href ||
              (item.path !== '' && pathname.startsWith(`${href}/`));

            return (
              <Link
                key={item.label}
                href={href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  active
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            window.location.href = '/login';
          }}
          className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-slate-500 hover:bg-slate-50"
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>
    </>
  );
}
