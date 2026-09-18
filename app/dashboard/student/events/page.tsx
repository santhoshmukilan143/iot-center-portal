'use client';

import { useEffect, useState } from 'react';
import DashboardShell from '@/components/DashboardShell';
import { supabase } from '@/lib/supabase';
import {
  CalendarDays,
  Clock3,
  MapPin,
  UserRound,
  ExternalLink,
  RefreshCw,
  CalendarCheck,
} from 'lucide-react';

type EventItem = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  event_date: string;
  event_time: string | null;
  venue: string | null;
  speaker: string | null;
  registration_url: string | null;
};

export default function StudentEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    setLoading(true);

    const { data, error } = await supabase
      .from('events')
      .select(
        'id, title, description, image_url, event_date, event_time, venue, speaker, registration_url'
      )
      .order('event_date', { ascending: true });

    if (error) {
      console.error(error);
      setEvents([]);
    } else {
      setEvents(data || []);
    }

    setLoading(false);
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString('en-IN', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  function formatTime(time: string | null) {
    if (!time) return 'Time not specified';

    const [hour, minute] = time.split(':');
    const date = new Date();

    date.setHours(Number(hour), Number(minute), 0, 0);

    return date.toLocaleTimeString('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  return (
    <DashboardShell role="student" title="Events">
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-black">Events</h2>

          <p className="mt-1 text-sm text-slate-400">
            Workshops, seminars, competitions and research center events.
          </p>
        </div>

        <button
          onClick={loadEvents}
          className="btn border bg-white text-slate-700"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="card p-10 text-center text-slate-500">
          Loading events...
        </div>
      ) : events.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-blue-50 text-blue-600">
            <CalendarCheck size={28} />
          </div>

          <h3 className="mt-5 text-lg font-black">
            No upcoming events
          </h3>

          <p className="mt-2 text-sm text-slate-400">
            New events posted by faculty will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {events.map((event) => (
            <article
              key={event.id}
              className="card overflow-hidden"
            >
              {event.image_url && (
                <img
                  src={event.image_url}
                  alt={event.title}
                  className="h-52 w-full object-cover"
                />
              )}

              <div className="p-5">
                <div className="flex items-start gap-4">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
                    <CalendarDays size={22} />
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-lg font-black">
                      {event.title}
                    </h3>

                    <p className="mt-1 text-sm font-bold text-blue-600">
                      {formatDate(event.event_date)}
                    </p>
                  </div>
                </div>

                {event.description && (
                  <p className="mt-5 text-sm leading-6 text-slate-600">
                    {event.description}
                  </p>
                )}

                <div className="mt-5 space-y-3 border-t pt-4">
                  <div className="flex items-center gap-3 text-sm text-slate-500">
                    <Clock3 size={16} />
                    <span>{formatTime(event.event_time)}</span>
                  </div>

                  {event.venue && (
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                      <MapPin size={16} />
                      <span>{event.venue}</span>
                    </div>
                  )}

                  {event.speaker && (
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                      <UserRound size={16} />
                      <span>Speaker · {event.speaker}</span>
                    </div>
                  )}
                </div>

                {event.registration_url && (
                  <a
                    href={event.registration_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#07162d] px-4 py-2.5 text-sm font-bold text-white"
                  >
                    Register / View Details
                    <ExternalLink size={15} />
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
