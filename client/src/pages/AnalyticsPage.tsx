import { useState, useEffect } from 'react';
import { BarChart2, TrendingUp, BookOpen, Flame, Trophy, Target, Calendar, Layers } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import Spinner from '../components/ui/Spinner';
import { apiFetch } from '../lib/api';

interface DailyPoint { date: string; cards: number; sessions: number }
interface TopDeck { deckId: number; name: string; color: string; cardsStudied: number; sessions: number }
interface Quality { again: number; hard: number; good: number; easy: number }
interface Summary {
  totalDecks: number; totalCards: number; totalCardsLearned: number;
  streak: number; xp: number; level: number;
  cards30d: number; cards7d: number; sessions30d: number;
  studyDays30d: number; studyDays7d: number; avgCardsPerDay: number;
  memberSince: string | null;
}
interface Analytics { summary: Summary; dailyChart: DailyPoint[]; quality: Quality; topDecks: TopDeck[] }

function StatCard({ icon: Icon, label, value, sub, color }: { icon: React.ElementType; label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        <Icon className="w-4.5 h-4.5" />
      </div>
      <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{value}</p>
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex-1 flex flex-col items-center gap-1">
      <div className="w-full flex flex-col justify-end h-20 bg-slate-50 dark:bg-slate-800 rounded-lg overflow-hidden">
        <div className={`w-full rounded-sm transition-all ${color}`} style={{ height: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [data, setData]     = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<Analytics>('/stats/analytics')
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <AppLayout><div className="flex justify-center py-20"><Spinner size="lg" /></div></AppLayout>;
  if (!data)   return <AppLayout><p className="text-center py-20 text-slate-400">Failed to load analytics.</p></AppLayout>;

  const { summary, dailyChart, quality, topDecks } = data;

  const maxCards = Math.max(...dailyChart.map(d => d.cards), 1);
  const last14   = dailyChart.slice(-14);

  const qualityTotal = quality.again + quality.hard + quality.good + quality.easy;
  function qPct(n: number) { return qualityTotal > 0 ? Math.round((n / qualityTotal) * 100) : 0; }

  const memberSince = summary.memberSince
    ? new Date(summary.memberSince).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    : null;

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-950 rounded-2xl flex items-center justify-center">
            <BarChart2 className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">Analytics</h1>
            {memberSince && <p className="text-xs text-slate-400">Studying since {memberSince}</p>}
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard icon={Flame}    label="Day streak"       value={summary.streak}           color="bg-orange-100 dark:bg-orange-950 text-orange-500" />
          <StatCard icon={Trophy}   label="Level"            value={`Lv ${summary.level}`}    sub={`${summary.xp} XP`} color="bg-indigo-100 dark:bg-indigo-950 text-indigo-500" />
          <StatCard icon={BookOpen} label="Cards this month" value={summary.cards30d}          sub={`${summary.studyDays30d} study days`} color="bg-emerald-100 dark:bg-emerald-950 text-emerald-500" />
          <StatCard icon={Target}   label="Avg cards/day"    value={summary.avgCardsPerDay}    sub="active study days" color="bg-violet-100 dark:bg-violet-950 text-violet-500" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard icon={Layers}   label="Total decks"      value={summary.totalDecks}        color="bg-sky-100 dark:bg-sky-950 text-sky-500" />
          <StatCard icon={BookOpen} label="Total cards"      value={summary.totalCards}        color="bg-rose-100 dark:bg-rose-950 text-rose-500" />
          <StatCard icon={TrendingUp} label="Cards learned"  value={summary.totalCardsLearned} color="bg-amber-100 dark:bg-amber-950 text-amber-500" />
          <StatCard icon={Calendar} label="Sessions (30d)"   value={summary.sessions30d}       color="bg-teal-100 dark:bg-teal-950 text-teal-500" />
        </div>

        {/* Daily activity chart (last 14 days) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5">
          <p className="font-bold text-slate-800 dark:text-slate-200 mb-4">Cards studied — last 14 days</p>
          <div className="flex items-end gap-1.5">
            {last14.map(d => (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                <MiniBar value={d.cards} max={maxCards} color={d.cards > 0 ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-700'} />
                <p className="text-[9px] text-slate-400 rotate-45 origin-left translate-x-1">{d.date.slice(5)}</p>
              </div>
            ))}
          </div>
          {last14.every(d => d.cards === 0) && (
            <p className="text-center text-sm text-slate-400 mt-4">No study sessions in the last 14 days.</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Answer quality */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5">
            <p className="font-bold text-slate-800 dark:text-slate-200 mb-4">Answer quality (30d)</p>
            {qualityTotal === 0 ? (
              <p className="text-sm text-slate-400">No sessions yet.</p>
            ) : (
              <div className="space-y-2.5">
                {[
                  { label: 'Easy',  value: quality.easy,  pct: qPct(quality.easy),  color: 'bg-emerald-500' },
                  { label: 'Good',  value: quality.good,  pct: qPct(quality.good),  color: 'bg-indigo-500'  },
                  { label: 'Hard',  value: quality.hard,  pct: qPct(quality.hard),  color: 'bg-amber-500'   },
                  { label: 'Again', value: quality.again, pct: qPct(quality.again), color: 'bg-red-500'     },
                ].map(q => (
                  <div key={q.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-600 dark:text-slate-400">{q.label}</span>
                      <span className="text-slate-400">{q.value} ({q.pct}%)</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${q.color}`} style={{ width: `${q.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top decks */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5">
            <p className="font-bold text-slate-800 dark:text-slate-200 mb-4">Most studied decks (30d)</p>
            {topDecks.length === 0 ? (
              <p className="text-sm text-slate-400">No sessions yet.</p>
            ) : (
              <div className="space-y-2.5">
                {topDecks.map((d, i) => {
                  const maxStudied = topDecks[0].cardsStudied;
                  const pct = maxStudied > 0 ? Math.round((d.cardsStudied / maxStudied) * 100) : 0;
                  return (
                    <div key={d.deckId}>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: d.color }} />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex-1 truncate">{d.name}</span>
                        <span className="text-xs text-slate-400">{d.cardsStudied}</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: d.color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Weekly comparison */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5">
          <p className="font-bold text-slate-800 dark:text-slate-200 mb-3">This week at a glance</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{summary.cards7d}</p>
              <p className="text-xs text-slate-400 mt-0.5">Cards studied this week</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{summary.studyDays7d}</p>
              <p className="text-xs text-slate-400 mt-0.5">Days studied this week</p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
