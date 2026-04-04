import { useEffect, useState } from 'react';
import { Trophy, Flame, Crown } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import Spinner from '../components/ui/Spinner';
import { apiFetch } from '../lib/api';
import { levelFromXP } from '../lib/xp';

interface LeaderboardEntry {
  rank: number;
  id: number;
  displayName: string;
  xp: number;
  level: number;
  streak: number;
  badgeCount: number;
  isMe: boolean;
}

interface LeaderboardData {
  leaderboard: LeaderboardEntry[];
  myRank: number | null;
  myXp: number;
  myLevel: number;
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
  if (rank === 2) return <span className="text-lg font-black text-slate-400">2</span>;
  if (rank === 3) return <span className="text-lg font-black text-amber-600">3</span>;
  return <span className="text-sm font-bold text-slate-400 w-5 text-center">{rank}</span>;
}

export default function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<LeaderboardData>('/leaderboard')
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <AppLayout><div className="flex justify-center py-20"><Spinner size="lg" /></div></AppLayout>;

  const entries = data?.leaderboard ?? [];

  return (
    <AppLayout>
      <div className="max-w-xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-950 rounded-2xl flex items-center justify-center">
            <Trophy className="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">Leaderboard</h1>
            <p className="text-sm text-slate-500">Global rankings by XP</p>
          </div>
        </div>

        {/* My rank card (if not in top list) */}
        {data?.myRank && data.myRank > entries.length && (
          <div className="bg-indigo-50 dark:bg-indigo-950 rounded-2xl border border-indigo-200 dark:border-indigo-800 px-4 py-3 mb-4 flex items-center gap-3">
            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">Your rank: #{data.myRank}</span>
            <span className="text-xs text-indigo-500 ml-auto">{data.myXp} XP · Level {data.myLevel}</span>
          </div>
        )}

        {entries.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-semibold">No rankings yet</p>
            <p className="text-sm mt-1">Study to earn XP and appear here!</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
            {entries.map((entry, i) => (
              <div
                key={entry.id}
                className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                  entry.isMe
                    ? 'bg-indigo-50 dark:bg-indigo-950'
                    : i % 2 === 0
                    ? 'bg-white dark:bg-slate-900'
                    : 'bg-slate-50/50 dark:bg-slate-800/30'
                } ${i < entries.length - 1 ? 'border-b border-slate-100 dark:border-slate-800' : ''}`}
              >
                {/* Rank */}
                <div className="w-7 flex items-center justify-center flex-shrink-0">
                  <RankBadge rank={entry.rank} />
                </div>

                {/* Avatar */}
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${
                  entry.rank === 1 ? 'bg-yellow-500' : entry.rank === 2 ? 'bg-slate-400' : entry.rank === 3 ? 'bg-amber-600' : 'bg-indigo-500'
                }`}>
                  {entry.displayName.charAt(0).toUpperCase()}
                </div>

                {/* Name + badges */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${entry.isMe ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-900 dark:text-slate-100'}`}>
                    {entry.displayName} {entry.isMe && <span className="text-xs font-normal">(you)</span>}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-slate-400">Level {entry.level}</span>
                    {entry.badgeCount > 0 && <span className="text-xs text-slate-400">· {entry.badgeCount} badge{entry.badgeCount !== 1 ? 's' : ''}</span>}
                    {entry.streak >= 3 && (
                      <span className="flex items-center gap-0.5 text-xs text-orange-500">
                        <Flame className="w-3 h-3" />{entry.streak}
                      </span>
                    )}
                  </div>
                </div>

                {/* XP */}
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-extrabold text-slate-900 dark:text-slate-100">{entry.xp.toLocaleString()}</p>
                  <p className="text-xs text-slate-400">XP</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
