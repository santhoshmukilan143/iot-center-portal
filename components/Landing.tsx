// Vercel deployment refresh 2
'use client';

import Link from 'next/link';
import {
  ArrowRight,
  BrainCircuit,
  CalendarDays,
  ChevronRight,
  Code2,
  Cpu,
  Database,
  ExternalLink,
  GalleryHorizontalEnd,
  GraduationCap,
  Network,
  Radio,
  RobotArm,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  Wifi,
} from 'lucide-react';

import Reveal from './Reveal';
import Logo from './Logo';

const capabilities = [
  ['IoT Development', Cpu],
  ['Embedded Systems', Code2],
  ['Artificial Intelligence', BrainCircuit],
  ['Robotics', RobotArm],
  ['Sensor Networks', Network],
  ['Research', Search],
  ['Innovation', Sparkles],
  ['Industry Collaboration', Users],
] as const;

const projects = [
  [
    'Smart Campus Energy Mesh',
    'ESP32 • LoRa • AI',
    'Design → Development',
    86,
  ],
  [
    'Autonomous Mobility Vehicle',
    'ROS • Computer Vision',
    'Testing',
    72,
  ],
  [
    'Precision Agriculture Node',
    'ESP32 • Sensors • ML',
    'Research',
    58,
  ],
];

export default function Landing() {
  return (
    <main>
      <nav className="fixed inset-x-0 top-0 z-40 border-b border-white/20 bg-white/75 px-5 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between">
          <Logo />

          <div className="hidden items-center gap-7 text-sm font-semibold text-slate-600 md:flex">
            <a href="#about">About</a>
            <a href="#activities">Activities</a>
            <a href="#projects">Projects</a>
            <a href="#events">Events</a>
            <a href="#gallery">Gallery</a>
            <a href="#resources">Resources</a>
          </div>

          <Link className="btn btn-primary" href="/login">
            Login <ArrowRight size={16} />
          </Link>
        </div>
      </nav>

      <section className="grid-bg relative overflow-hidden bg-[#07162d] px-5 pb-24 pt-36 text-white">
        <div className="absolute -right-32 top-10 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-blue-600/20 blur-3xl" />

        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.1fr_.9fr]">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[.2em] text-cyan-200">
              <Wifi size={14} />
              Connected learning ecosystem
            </div>

            <h1 className="max-w-4xl text-5xl font-black leading-[1.02] tracking-[-.04em] md:text-7xl">
              IoT Innovation
              <br />
              <span className="gradient-text">& Research Center</span>
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300">
              Connect • Innovate • Build • Learn. A single digital home for
              students, faculty, projects, research, events and collaboration.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link className="btn btn-primary" href="/login">
                Student Login <ArrowRight size={16} />
              </Link>

              <Link
                className="btn border border-white/15 bg-white/10 text-white"
                href="/login?role=faculty"
              >
                Faculty Login
              </Link>
            </div>

            <div className="mt-12 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-5">
              {[
                ['100+', 'Students'],
                ['20+', 'Projects'],
                ['10+', 'Faculty'],
                ['25+', 'Events'],
                ['15+', 'Research'],
              ].map((x) => (
                <div
                  key={x[1]}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="text-2xl font-black">{x[0]}</div>
                  <div className="mt-1 text-xs text-slate-400">{x[1]}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="mx-auto aspect-square max-w-[510px] rounded-[40px] border border-white/10 bg-white/[.045] p-5 shadow-2xl">
              <div className="relative h-full overflow-hidden rounded-[30px] border border-cyan-300/10 bg-[radial-gradient(circle_at_center,rgba(21,216,229,.18),transparent_48%)]">
                <div className="absolute inset-10 rounded-full border border-cyan-300/15" />
                <div className="absolute inset-24 rounded-full border border-blue-400/20" />

                <div className="absolute inset-0 grid place-items-center">
                  <div className="grid h-28 w-28 place-items-center rounded-3xl border border-cyan-200/30 bg-cyan-300/10 shadow-[0_0_90px_rgba(21,216,229,.2)]">
                    <Cpu size={56} className="text-cyan-200" />
                  </div>
                </div>

                {[
                  ['top-10 left-10', 'ESP32'],
                  ['top-20 right-8', 'AI / ML'],
                  ['bottom-20 left-8', 'Robotics'],
                  ['bottom-10 right-12', 'Cloud'],
                ].map(([p, t]) => (
                  <div
                    key={t}
                    className={
                      'absolute ' +
                      p +
                      ' rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-xs font-bold text-slate-200 backdrop-blur'
                    }
                  >
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="px-5 py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.9fr_1.1fr]">
          <Reveal>
            <p className="text-sm font-black uppercase tracking-[.2em] text-blue-600">
              About the Center
            </p>

            <h2 className="mt-3 text-4xl font-black tracking-tight">
              Where academic curiosity becomes working technology.
            </h2>
          </Reveal>

          <Reveal className="grid gap-4 sm:grid-cols-2">
            <div className="card p-7">
              <GraduationCap className="text-blue-600" />

              <h3 className="mt-5 text-xl font-extrabold">Mission</h3>

              <p className="mt-2 leading-7 text-slate-600">
                Build an accessible ecosystem where students and faculty can
                learn, prototype, research and collaborate around connected
                technologies.
              </p>
            </div>

            <div className="card p-7">
              <Sparkles className="text-cyan-600" />

              <h3 className="mt-5 text-xl font-extrabold">Vision</h3>

              <p className="mt-2 leading-7 text-slate-600">
                Create industry-ready innovators through hands-on projects,
                research culture and measurable collaboration.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="activities" className="bg-white px-5 py-24">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <p className="text-sm font-black uppercase tracking-[.2em] text-blue-600">
              What We Do
            </p>

            <h2 className="mt-3 text-4xl font-black tracking-tight">
              A complete technology ecosystem.
            </h2>
          </Reveal>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {capabilities.map(([name, Icon]) => (
              <Reveal key={name}>
                <div className="card group h-full p-6 transition hover:-translate-y-1 hover:shadow-soft">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-600">
                    <Icon size={22} />
                  </div>

                  <h3 className="mt-5 font-extrabold">{name}</h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Labs, projects and collaborative learning workflows built
                    around real outcomes.
                  </p>

                  <ChevronRight
                    className="mt-5 text-slate-300 transition group-hover:translate-x-1"
                    size={18}
                  />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="projects" className="px-5 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[.2em] text-blue-600">
                Featured Projects
              </p>

              <h2 className="mt-3 text-4xl font-black">
                Work that moves beyond the classroom.
              </h2>
            </div>

            <Link
              href="/login"
              className="hidden font-bold text-blue-600 sm:flex"
            >
              Explore portal <ArrowRight size={16} />
            </Link>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {projects.map(([name, tech, stage, progress]) => (
              <div key={name} className="card overflow-hidden">
                <div className="h-48 bg-[radial-gradient(circle_at_25%_30%,rgba(21,216,229,.25),transparent_30%),linear-gradient(135deg,#07162d,#102b55)] p-5 text-white">
                  <div className="flex justify-between">
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold">
                      Featured
                    </span>

                    <ExternalLink size={17} />
                  </div>

                  <div className="mt-20 text-xl font-black">{name}</div>
                </div>

                <div className="p-6">
                  <p className="text-sm text-slate-500">{tech}</p>

                  <div className="mt-5 flex justify-between text-xs font-bold">
                    <span>{stage}</span>
                    <span>{progress}%</span>
                  </div>

                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-blue-600"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="events" className="bg-[#07162d] px-5 py-24 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_.8fr]">
          <Reveal>
            <p className="text-sm font-black uppercase tracking-[.2em] text-cyan-300">
              Upcoming Events
            </p>

            <h2 className="mt-3 text-4xl font-black">
              Learn together. Build together.
            </h2>

            <div className="mt-8 space-y-3">
              {[
                ['12 SEP', 'ESP32 Edge AI Workshop', 'IoT Lab • 10:00 AM'],
                ['18 SEP', 'Research Review Meetup', 'Seminar Hall • 2:00 PM'],
                ['25 SEP', 'Campus IoT Hackathon', 'Innovation Hub • 9:00 AM'],
              ].map((e) => (
                <div
                  key={e[0]}
                  className="flex items-center gap-5 rounded-2xl border border-white/10 bg-white/5 p-5"
                >
                  <div className="text-center">
                    <div className="text-xl font-black text-cyan-300">
                      {e[0].split(' ')[0]}
                    </div>

                    <div className="text-[10px] text-slate-400">
                      {e[0].split(' ')[1]}
                    </div>
                  </div>

                  <div>
                    <div className="font-bold">{e[1]}</div>
                    <div className="mt-1 text-sm text-slate-400">{e[2]}</div>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal className="grid-bg rounded-[32px] border border-white/10 bg-white/5 p-8">
            <CalendarDays className="text-cyan-300" size={30} />

            <h3 className="mt-6 text-2xl font-black">
              Your center, one workspace.
            </h3>

            <p className="mt-3 leading-7 text-slate-400">
              Tasks, project milestones, resources, group discussions and
              announcements stay connected instead of scattered across apps.
            </p>

            <Link href="/login" className="btn btn-primary mt-7">
              Enter Portal <ArrowRight size={16} />
            </Link>
          </Reveal>
        </div>
      </section>

      <footer
        id="resources"
        className="border-t bg-white px-5 py-12"
      >
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 md:flex-row">
          <div>
            <Logo />

            <p className="mt-4 max-w-sm text-sm leading-6 text-slate-500">
              IoT Innovation & Research Center — a digital ecosystem for
              connected learning, research and innovation.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-12 gap-y-3 text-sm font-semibold text-slate-600">
            <a href="#about">About</a>
            <a href="#projects">Projects</a>
            <a href="#events">Events</a>
            <a href="#activities">Activities</a>
            <a href="mailto:iotcenter@example.edu">Contact</a>
            <a href="/login">Portal Login</a>
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-7xl border-t pt-6 text-xs text-slate-400">
          © 2026 IoT Innovation & Research Center. Built for academic
          collaboration.
        </div>
      </footer>
    </main>
  );
}
