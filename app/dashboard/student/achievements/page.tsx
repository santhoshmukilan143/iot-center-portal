'use client';

import { useEffect, useState } from 'react';
import DashboardShell from '@/components/DashboardShell';
import { supabase } from '@/lib/supabase';
import {
  Award,
  Trophy,
  Medal,
  Star,
  RefreshCw,
  CalendarDays,
} from 'lucide-react';

type Achievement = {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
};

export default function StudentAchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(false);

  /*
   * There is currently no achievements table in the database schema.
   * Keep this page functional without causing a 404 or database error.
   */
  useEffect(() => {
    loadAchievements();
  }, []);

  async function loadAchievements() {
    setLoading(true);

    // Achievements will be connected to Supabase
    // when the achievements table is added.
    setAchievements([]);

    setLoading(false);
  }

  return (
    <DashboardShell role="student" title="Achievements">
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-black">Achievements</h2>

          <p className="mt-1 text-sm text-slate-400">
            Your awards, milestones and research accomplishments.
          </p>
        </div>

        <button
          onClick={loadAchievements}
          className="btn border bg-white text-slate-700"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="card p-10 text-center text-slate-500">
          Loading achievements...
        </div>
      ) : achievements.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-amber-50 text-amber-600">
            <Trophy size={28} />
          </div>

          <h3 className="mt-5 text-lg font-black">
            No achievements yet
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
            Your awards, certificates, competition results and other
            achievements will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {achievements.map((achievement, index) => (
            <article
              key={achievement.id}
              className="card p-5"
            >
              <div className="flex items-start justify-between">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-amber-50 text-amber-600">
                  {index % 3 === 0 ? (
                    <Trophy size={22} />
                  ) : index % 3 === 1 ? (
                    <Medal size={22} />
                  ) : (
                    <Award size={22} />
                  )}
                </div>

                <Star
                  size={18}
                  className="text-amber-400"
                />
              </div>

              <h3 className="mt-5 text-lg font-black">
                {achievement.title}
              </h3>

              {achievement.description && (
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {achievement.description}
                </p>
              )}

              <div className="mt-5 flex items-center gap-2 text-xs text-slate-400">
                <CalendarDays size={14} />
                {new Date(
                  achievement.created_at
                ).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </div>
            </article>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
