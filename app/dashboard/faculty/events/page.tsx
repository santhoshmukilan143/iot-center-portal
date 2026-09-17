'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Event = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  event_date: string;
  event_time: string | null;
  venue: string | null;
  speaker: string | null;
  registration_url: string | null;
  created_at: string;
};

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadEvents() {
    setLoading(true);
    setError('');

    const { data, error } = await supabase
      .from('events')
      .select(
        'id, title, description, image_url, event_date, event_time, venue, speaker, registration_url, created_at'
      )
      .order('event_date', { ascending: true });

    if (error) {
      setError(error.message);
      setEvents([]);
    } else {
      setEvents(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadEvents();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-blue-600">
              Faculty Console
            </p>

            <h1 className="mt-2 text-4xl font-black text-slate-900">
              Events
            </h1>

            <p className="mt-2 text-slate-500">
              View seminars, workshops and upcoming events.
            </p>
          </div>

          <button
            onClick={loadEvents}
            className="rounded-xl bg-blue-600 px-5 py-3 font-bold text-white shadow-lg hover:bg-blue-700"
          >
            ↻ Refresh Events
          </button>
        </div>

        {/* Stats */}
        <div className="mb-6 grid gap-4 md:grid-cols-3">

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Total Events
            </p>

            <p className="mt-2 text-3xl font-black text-slate-900">
              {events.length}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Upcoming Events
            </p>

            <p className="mt-2 text-3xl font-black text-blue-600">
              {
                events.filter(
                  (event) =>
                    new Date(event.event_date) >= new Date()
                ).length
              }
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              With Registration
            </p>

            <p className="mt-2 text-3xl font-black text-green-600">
              {events.filter((event) => event.registration_url).length}
            </p>
          </div>

        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <p className="font-bold">
              Unable to load events
            </p>

            <p className="mt-1 text-sm">
              {error}
            </p>
          </div>
        )}

        {/* Event List */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

          {loading ? (
            <div className="col-span-full rounded-2xl border bg-white p-10 text-center text-slate-500">
              Loading events...
            </div>
          ) : events.length === 0 ? (
            <div className="col-span-full rounded-2xl border bg-white p-12 text-center">
              <div className="text-5xl">📅</div>

              <h2 className="mt-4 text-xl font-black text-slate-900">
                No events yet
              </h2>

              <p className="mt-2 text-slate-500">
                Events added in Supabase will appear here.
              </p>
            </div>
          ) : (
            events.map((event) => (
              <div
                key={event.id}
                className="overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >

                {/* Image */}
                {event.image_url ? (
                  <img
                    src={event.image_url}
                    alt={event.title}
                    className="h-48 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-48 items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 text-6xl">
                    📅
                  </div>
                )}

                <div className="p-6">

                  {/* Title */}
                  <h2 className="text-xl font-black text-slate-900">
                    {event.title}
                  </h2>

                  {/* Date & Time */}
                  <div className="mt-4 space-y-2">

                    <div className="flex items-center gap-2 text-sm">
                      <span>📅</span>
                      <span className="font-bold text-slate-700">
                        {new Date(
                          event.event_date
                        ).toLocaleDateString()}
                      </span>
                    </div>

                    {event.event_time && (
                      <div className="flex items-center gap-2 text-sm">
                        <span>⏰</span>
                        <span className="text-slate-600">
                          {event.event_time}
                        </span>
                      </div>
                    )}

                    {event.venue && (
                      <div className="flex items-center gap-2 text-sm">
                        <span>📍</span>
                        <span className="text-slate-600">
                          {event.venue}
                        </span>
                      </div>
                    )}

                    {event.speaker && (
                      <div className="flex items-center gap-2 text-sm">
                        <span>🎤</span>
                        <span className="text-slate-600">
                          {event.speaker}
                        </span>
                      </div>
                    )}

                  </div>

                  {/* Description */}
                  {event.description && (
                    <p className="mt-5 text-sm leading-6 text-slate-500">
                      {event.description}
                    </p>
                  )}

                  {/* Registration */}
                  {event.registration_url && (
                    <div className="mt-5 border-t pt-4">
                      <a
                        href={event.registration_url}
                        target="_blank"
                        rel="noreferrer"
                        className="block rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-bold text-white hover:bg-blue-700"
                      >
                        Register / View Event →
                      </a>
                    </div>
                  )}

                </div>
              </div>
            ))
          )}

        </div>

      </div>
    </main>
  );
}
