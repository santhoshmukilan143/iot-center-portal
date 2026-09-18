'use client';

import { useEffect, useState } from 'react';
import DashboardShell from '@/components/DashboardShell';
import { supabase } from '@/lib/supabase';
import {
  CalendarDays,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  X,
  Save,
  MapPin,
  UserRound,
  ExternalLink,
} from 'lucide-react';

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

const emptyForm = {
  title: '',
  description: '',
  image_url: '',
  event_date: '',
  event_time: '',
  venue: '',
  speaker: '',
  registration_url: '',
};

export default function FacultyEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState(emptyForm);

  async function loadEvents() {
    setLoading(true);

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true });

    if (!error) {
      setEvents(data || []);
    } else {
      console.error(error);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadEvents();
  }, []);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  }

  function openEdit(event: Event) {
    setEditingId(event.id);

    setForm({
      title: event.title || '',
      description: event.description || '',
      image_url: event.image_url || '',
      event_date: event.event_date || '',
      event_time: event.event_time
        ? event.event_time.slice(0, 5)
        : '',
      venue: event.venue || '',
      speaker: event.speaker || '',
      registration_url: event.registration_url || '',
    });

    setShowModal(true);
  }

  function closeModal() {
    if (saving) return;

    setShowModal(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  async function saveEvent() {
    if (!form.title.trim()) {
      alert('Please enter event title.');
      return;
    }

    if (!form.event_date) {
      alert('Please select event date.');
      return;
    }

    setSaving(true);

    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        image_url: form.image_url.trim() || null,
        event_date: form.event_date,
        event_time: form.event_time || null,
        venue: form.venue.trim() || null,
        speaker: form.speaker.trim() || null,
        registration_url:
          form.registration_url.trim() || null,
      };

      if (editingId) {
        const { error } = await supabase
          .from('events')
          .update(payload)
          .eq('id', editingId);

        if (error) throw error;
      } else {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          throw new Error('User not logged in.');
        }

        const { error } = await supabase
          .from('events')
          .insert({
            ...payload,
            created_by: user.id,
          });

        if (error) throw error;
      }

      closeModal();
      await loadEvents();
    } catch (error: any) {
      alert(error.message || 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  }

  async function deleteEvent(id: string) {
    const confirmed = confirm(
      'Are you sure you want to delete this event?'
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadEvents();
  }

  function formatDate(date: string) {
    if (!date) return '-';

    const [year, month, day] = date
      .split('-')
      .map(Number);

    return new Date(
      year,
      month - 1,
      day
    ).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  function formatTime(time: string | null) {
    if (!time) return '';

    const [hour, minute] = time
      .slice(0, 5)
      .split(':')
      .map(Number);

    const suffix = hour >= 12 ? 'PM' : 'AM';
    const displayHour =
      hour % 12 === 0 ? 12 : hour % 12;

    return `${displayHour}:${String(minute).padStart(
      2,
      '0'
    )} ${suffix}`;
  }

  const today = new Date().toISOString().split('T')[0];

  const upcomingEvents = events.filter(
    (event) => event.event_date >= today
  ).length;

  return (
    <DashboardShell
      role="faculty"
      title="Events"
    >
      {/* Header */}
      <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-black">
            Events Management
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Create and manage research center events.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={loadEvents}
            className="btn border bg-white text-slate-700"
          >
            <RefreshCw size={16} />
            Refresh
          </button>

          <button
            onClick={openCreate}
            className="btn bg-[#07162d] text-white"
          >
            <Plus size={17} />
            Add Event
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-7 grid gap-4 sm:grid-cols-2">
        <div className="card p-5">
          <div className="text-xs font-semibold text-slate-400">
            Total Events
          </div>

          <div className="mt-2 text-3xl font-black">
            {events.length}
          </div>
        </div>

        <div className="card p-5">
          <div className="text-xs font-semibold text-slate-400">
            Upcoming Events
          </div>

          <div className="mt-2 text-3xl font-black">
            {upcomingEvents}
          </div>
        </div>
      </div>

      {/* Events */}
      <section className="card overflow-hidden">
        <div className="border-b p-5">
          <h3 className="font-extrabold">
            All Events
          </h3>

          <p className="mt-1 text-xs text-slate-400">
            Manage events published in the portal.
          </p>
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-slate-400">
            Loading events...
          </div>
        ) : events.length === 0 ? (
          <div className="p-12 text-center">
            <CalendarDays
              size={42}
              className="mx-auto text-slate-300"
            />

            <h3 className="mt-4 font-bold">
              No events yet
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              Create your first event.
            </p>

            <button
              onClick={openCreate}
              className="btn mx-auto mt-5 bg-[#07162d] text-white"
            >
              <Plus size={16} />
              Add Event
            </button>
          </div>
        ) : (
          <div className="divide-y">
            {events.map((event) => (
              <div
                key={event.id}
                className="p-5 transition hover:bg-slate-50"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex gap-4">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
                      <CalendarDays size={22} />
                    </div>

                    <div>
                      <h3 className="font-extrabold">
                        {event.title}
                      </h3>

                      {event.description && (
                        <p className="mt-1 max-w-2xl text-sm text-slate-500">
                          {event.description}
                        </p>
                      )}

                      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
                        <span>
                          📅 {formatDate(event.event_date)}
                        </span>

                        {event.event_time && (
                          <span>
                            🕒 {formatTime(event.event_time)}
                          </span>
                        )}

                        {event.venue && (
                          <span className="flex items-center gap-1">
                            <MapPin size={13} />
                            {event.venue}
                          </span>
                        )}

                        {event.speaker && (
                          <span className="flex items-center gap-1">
                            <UserRound size={13} />
                            {event.speaker}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    {event.registration_url && (
                      <a
                        href={event.registration_url}
                        target="_blank"
                        rel="noreferrer"
                        className="grid h-9 w-9 place-items-center rounded-lg border bg-white text-slate-600 hover:bg-slate-100"
                        title="Open registration"
                      >
                        <ExternalLink size={16} />
                      </a>
                    )}

                    <button
                      onClick={() => openEdit(event)}
                      className="grid h-9 w-9 place-items-center rounded-lg border bg-white text-blue-600 hover:bg-blue-50"
                      title="Edit"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      onClick={() => deleteEvent(event.id)}
                      className="grid h-9 w-9 place-items-center rounded-lg border bg-white text-red-500 hover:bg-red-50"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {event.image_url && (
                  <div className="mt-4 overflow-hidden rounded-xl">
                    <img
                      src={event.image_url}
                      alt={event.title}
                      className="h-40 w-full object-cover"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b p-5">
              <div>
                <h3 className="text-lg font-black">
                  {editingId
                    ? 'Edit Event'
                    : 'Create Event'}
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  Fill in the event details.
                </p>
              </div>

              <button
                onClick={closeModal}
                className="grid h-9 w-9 place-items-center rounded-lg hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <div className="grid gap-4 p-5">
              <div>
                <label className="label">
                  Event Title *
                </label>

                <input
                  className="input"
                  placeholder="Enter event title"
                  value={form.title}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      title: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="label">
                  Description
                </label>

                <textarea
                  className="input min-h-24"
                  placeholder="Describe the event..."
                  value={form.description}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">
                    Event Date *
                  </label>

                  <input
                    type="date"
                    className="input"
                    value={form.event_date}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        event_date: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="label">
                    Event Time
                  </label>

                  <input
                    type="time"
                    className="input"
                    value={form.event_time}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        event_time: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">
                    Venue
                  </label>

                  <input
                    className="input"
                    placeholder="Example: IoT Lab"
                    value={form.venue}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        venue: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="label">
                    Speaker
                  </label>

                  <input
                    className="input"
                    placeholder="Speaker name"
                    value={form.speaker}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        speaker: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="label">
                  Image URL
                </label>

                <input
                  className="input"
                  placeholder="https://..."
                  value={form.image_url}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      image_url: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="label">
                  Registration URL
                </label>

                <input
                  className="input"
                  placeholder="https://forms.google.com/..."
                  value={form.registration_url}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      registration_url: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 border-t p-5">
              <button
                onClick={closeModal}
                className="btn border bg-white text-slate-700"
                disabled={saving}
              >
                Cancel
              </button>

              <button
                onClick={saveEvent}
                disabled={saving}
                className="btn bg-[#07162d] text-white"
              >
                <Save size={16} />

                {saving
                  ? 'Saving...'
                  : editingId
                  ? 'Update Event'
                  : 'Create Event'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
