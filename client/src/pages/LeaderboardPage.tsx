import { useEffect, useState } from 'react';
import { Trophy, Flame, Crown, Medal, Star, TrendingUp } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import Spinner from '../components/ui/Spinner';
import { apiFetch } from '../lib/api';
import { useTranslation } from '../i18n';

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
  if (rank === 1) return (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-md shadow-yellow-200 dark:shadow-yellow-900/50">
      <Crown className="w-4 h-4 text-white" />
    </div>
  );
  if (rank === 2) return (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 dark:from-slate-500 dark:to-slate-600 flex items-center justify-center shadow-sm">
      <Medal className="w-4 h-4 text-white" />
    </div>
  );
  if (rank === 3) return (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-sm shadow-amber-200 dark:shadow-amber-900/50">
      <Medal className="w-4 h-4 text-white" />
    </div>
  );
  return (
    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{rank}</span>
    </div>
  );
}

function LevelBadge({ level }: { level: number }) {
  const color = level >= 20 ? 'from-violet-500 to-purple-600' :
                level >= 10 ? 'from-indigo-500 to-blue-600' :
                level >= 5  ? 'from-emerald-500 to-teal-600' :
                              'from-slate-400 to-slate-500';
  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold text-white bg-gradient-to-r ${color} px-1.5 py-0.5 rounded-full`}>
      <Star className="w-2.5 h-2.5" /> Lv.{level}
    </span>
  );
}

function XPBar({ xp, maxXp = 10000 }: { xp: number; maxXp?: number }) {
  const pct = Math.min((xp / maxXp) * 100, 100);
  return (
    <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 rounded-full transition-all"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default function LeaderboardPage() {
  const { t } = useTranslation();
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 25;

  useEffect(() => {
    apiFetch<LeaderboardData>('/leaderboard?limit=100')
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const entries = data?.leaderboard ?? [];
  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);
  const paginated = rest.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(rest.length / PAGE_SIZE);
  const maxXp = entries[0]?.xp ?? 1000;

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-200 dark:shadow-yellow-900/40">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">{t.leaderboard.title}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> {t.leaderboard.subtitle}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-24"><Spinner size="lg" /></div>
        ) : entries.length === 0 ? (
          <div className="text-center py-24 text-slate-400">
            <Trophy className="w-14 h-14 mx-auto mb-4 opacity-20" />
            <p className="font-bold text-slate-500 dark:text-slate-400 text-lg">{t.leaderboard.noRankings}</p>
            <p className="text-sm mt-1.5">{t.leaderboard.noRankingsDesc}</p>
          </div>
        ) : (
          <>
            {/* My rank card */}
            {data?.myRank && data.myRank > 3 && (
              <div className="bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/60 dark:to-violet-950/60 rounded-2xl border border-indigo-200 dark:border-indigo-800 px-5 py-3.5 mb-5 flex items-center gap-4">
                <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  #{data.myRank}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-indigo-700 dark:text-indigo-300">{t.leaderboard.yourRank}</p>
                  <p className="text-xs text-indigo-500 dark:text-indigo-400">{data.myXp.toLocaleString()} XP · Level {data.myLevel}</p>
                </div>
                <p className="text-xs text-indigo-400 dark:text-indigo-500">{entries[data.myRank - 2]?.xp != null ? (entries[data.myRank - 2].xp - data.myXp).toLocaleString() + ' XP ' + t.leaderboard.xpToRank + (data.myRank - 1) : ''}</p>
              </div>
            )}

            {/* Podium — Top 3 */}
            {top3.length >= 3 && (
              <div className="grid grid-cols-3 gap-3 mb-6">
                {/* 2nd place */}
                <div className={`flex flex-col items-center pt-6 pb-4 px-2 rounded-2xl border ${top3[1].isMe ? 'bg-indigo-50 dark:bg-indigo-950 border-indigo-200 dark:border-indigo-700' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'}`}>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center text-white font-bold text-sm mb-2">
                    {top3[1].displayName.charAt(0).toUpperCase()}
                  </div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate max-w-full text-center">{top3[1].displayName}{top3[1].isMe && ` ${t.leaderboard.you}`}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{top3[1].xp.toLocaleString()} XP</p>
                  <div className="mt-2 w-7 h-7 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center">
                    <span className="text-white font-black text-xs">2</span>
                  </div>
                </div>

                {/* 1st place */}
                <div className={`flex flex-col items-center pt-4 pb-4 px-2 rounded-2xl border -mt-3 shadow-lg ${top3[0].isMe ? 'bg-indigo-50 dark:bg-indigo-950 border-indigo-200 dark:border-indigo-700' : 'bg-white dark:bg-slate-900 border-yellow-200 dark:border-yellow-800'}`}>
                  <Crown className="w-5 h-5 text-yellow-500 mb-1" />
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-white font-bold text-base mb-2 shadow-md shadow-yellow-200 dark:shadow-yellow-900/50">
                    {top3[0].displayName.charAt(0).toUpperCase()}
                  </div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate max-w-full text-center">{top3[0].displayName}{top3[0].isMe && ` ${t.leaderboard.you}`}</p>
                  <p className="text-xs text-yellow-600 dark:text-yellow-400 font-bold mt-0.5">{top3[0].xp.toLocaleString()} XP</p>
                  {top3[0].streak >= 3 && (
                    <span className="flex items-center gap-0.5 text-[10px] text-orange-500 font-semibold mt-1">
                      <Flame className="w-3 h-3" />{top3[0].streak}
                    </span>
                  )}
                </div>

                {/* 3rd place */}
                <div className={`flex flex-col items-center pt-6 pb-4 px-2 rounded-2xl border ${top3[2].isMe ? 'bg-indigo-50 dark:bg-indigo-950 border-indigo-200 dark:border-indigo-700' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'}`}>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold text-sm mb-2">
                    {top3[2].displayName.charAt(0).toUpperCase()}
                  </div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate max-w-full text-center">{top3[2].displayName}{top3[2].isMe && ` ${t.leaderboard.you}`}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{top3[2].xp.toLocaleString()} XP</p>
                  <div className="mt-2 w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                    <span className="text-white font-black text-xs">3</span>
                  </div>
                </div>
              </div>
            )}

            {/* Full list */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
              {(top3.length < 3 ? entries : paginated).map((entry, i) => {
                const isFirstInList = top3.length >= 3 && i === 0;
                return (
                  <div
                    key={entry.id}
                    className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                      entry.isMe
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 border-l-2 border-l-indigo-500'
                        : i % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/50 dark:bg-slate-800/20'
                    } ${!isFirstInList ? 'border-t border-slate-100 dark:border-slate-800' : ''}`}
                  >
                    <RankBadge rank={entry.rank} />

                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${
                      entry.isMe ? 'bg-indigo-600' :
                      entry.rank <= 10 ? 'bg-gradient-to-br from-indigo-500 to-violet-600' :
                      'bg-slate-400 dark:bg-slate-600'
                    }`}>
                      {entry.displayName.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={`text-sm font-semibold truncate ${entry.isMe ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-900 dark:text-slate-100'}`}>
                          {entry.displayName}
                          {entry.isMe && <span className="text-xs font-normal text-indigo-500 ml-1">{t.leaderboard.you}</span>}
                        </p>
                        <LevelBadge level={entry.level} />
                        {entry.streak >= 3 && (
                          <span className="flex items-center gap-0.5 text-[10px] text-orange-500 font-semibold">
                            <Flame className="w-3 h-3" />{entry.streak}
                          </span>
                        )}
                      </div>
                      <XPBar xp={entry.xp} maxXp={maxXp} />
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-extrabold text-slate-900 dark:text-slate-100">{entry.xp.toLocaleString()}</p>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">XP</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {top3.length >= 3 && totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 px-1">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 disabled:opacity-40 transition-all"
                >
                  {t.leaderboard.prev}
                </button>
                <span className="text-sm text-slate-500">
                  {t.leaderboard.page} {page + 1} {t.leaderboard.of} {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page === totalPages - 1}
                  className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 disabled:opacity-40 transition-all"
                >
                  {t.leaderboard.next}
                </button>
              </div>
            )}

            {entries.length > 0 && (
              <p className="text-center text-xs text-slate-400 mt-4">
                {t.leaderboard.topLearners} {entries.length} · {t.leaderboard.updatedDaily}
              </p>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
