import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Layers, HelpCircle, FileText, Trash2, BookOpen, Play, Flame, Brain, AlertTriangle, Calendar, GraduationCap } from 'lucide-react';
import toast from 'react-hot-toast';
import AppLayout from '../components/layout/AppLayout';
import Button    from '../components/ui/Button';
import Spinner   from '../components/ui/Spinner';
import { apiFetch } from '../lib/api';
import { getUser }  from '../lib/auth';
import { useTranslation } from '../i18n';
import type { Deck, Quiz, Summary, Stats } from '../types';

type Tab = 'decks' | 'quizzes' | 'summaries' | 'examiner';

interface ExaminerSession {
  id: number;
  material_name: string;
  difficulty: 'standard' | 'hard' | 'brutal';
  question_count: number;
  exchange_count: number;
  completed: number;
  created_at: string;
}

export default function DashboardPage() {
  const { t }    = useTranslation();
  const navigate = useNavigate();
  const user     = getUser();
  const [tab, setTab] = useState<Tab>('decks');
  const [decks,     setDecks]     = useState<Deck[]>([]);
  const [quizzes,   setQuizzes]   = useState<Quiz[]>([]);
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [examinerSessions, setExaminerSessions] = useState<ExaminerSession[]>([]);
  const [stats,     setStats]     = useState<Stats | null>(null);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch<{ decks: Deck[] }>('/decks').then(d => setDecks(d.decks)),
      apiFetch<{ quizzes: Quiz[] }>('/quizzes').then(d => setQuizzes(d.quizzes)),
      apiFetch<{ summaries: Summary[] }>('/summaries').then(d => setSummaries(d.summaries)),
      apiFetch<Stats>('/stats').then(s => setStats(s)),
      apiFetch<{ sessions: ExaminerSession[] }>('/examiner/sessions').then(d => setExaminerSessions(d.sessions)).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  async function deleteDeck(id: number) {
    if (!confirm('Delete this deck?')) return;
    await apiFetch(`/decks/${id}`, { method: 'DELETE' });
    setDecks(prev => prev.filter(d => d.id !== id));
    toast.success('Deck deleted');
  }

  async function deleteQuiz(id: number) {
    if (!confirm('Delete this quiz?')) return;
    await apiFetch(`/quizzes/${id}`, { method: 'DELETE' });
    setQuizzes(prev => prev.filter(q => q.id !== id));
    toast.success('Quiz deleted');
  }

  async function deleteSummary(id: number) {
    if (!confirm('Delete this summary?')) return;
    await apiFetch(`/summaries/${id}`, { method: 'DELETE' });
    setSummaries(prev => prev.filter(s => s.id !== id));
    toast.success('Summary deleted');
  }

  function formatSessionDate(dateStr: string) {
    const d = new Date(dateStr);
    const today = new Date(); today.setHours(0,0,0,0);
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate()-1);
    const day = new Date(d); day.setHours(0,0,0,0);
    if (day.getTime() === today.getTime()) return t.stats.today;
    if (day.getTime() === yesterday.getTime()) return t.stats.yesterday;
    const diff = Math.floor((today.getTime() - day.getTime()) / 86400000);
    return `${diff} ${t.stats.daysAgo}`;
  }

  const tabs: { key: Tab; label: string; icon: typeof Layers }[] = [
    { key: 'decks',     label: t.dashboard.decks,     icon: Layers },
    { key: 'quizzes',   label: t.dashboard.quizzes,   icon: HelpCircle },
    { key: 'summaries', label: t.dashboard.summaries, icon: FileText },
    { key: 'examiner',  label: 'Examiner',             icon: GraduationCap },
  ];

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{t.dashboard.welcome}, {user?.displayName?.split(' ')[0]}! 👋</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        <Button onClick={() => navigate('/create')} size="sm">
          <Plus className="w-4 h-4" /> {t.dashboard.create}
        </Button>
      </div>

      {/* Stats bar */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard icon={<Flame className="w-5 h-5 text-orange-500" />} value={stats.streak} label={t.stats.streak} bg="bg-orange-50 dark:bg-orange-950" />
          <StatCard icon={<Brain className="w-5 h-5 text-indigo-500" />} value={stats.totalCardsLearned} label={t.stats.cards} bg="bg-indigo-50 dark:bg-indigo-950" />
          <StatCard icon={<AlertTriangle className="w-5 h-5 text-red-500" />} value={stats.weakCards} label={t.stats.weak} bg="bg-red-50 dark:bg-red-950" />
          <StatCard icon={<Calendar className="w-5 h-5 text-emerald-500" />} value={stats.dueToday} label={t.stats.due} bg="bg-emerald-50 dark:bg-emerald-950" />
        </div>
      )}

      {/* Recent activity */}
      {stats && stats.recentSessions.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 mb-6">
          <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">{t.stats.recentActivity}</h2>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {stats.recentSessions.map(s => (
              <div key={s.id} className="flex-shrink-0 flex items-center gap-2.5 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.deck.color }} />
                <div>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{s.deck.name}</p>
                  <p className="text-xs text-slate-400">{s.cardsStudied} cards · {formatSessionDate(s.studiedAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl mb-6 w-fit">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tab === key ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : (
        <>
          {/* Decks */}
          {tab === 'decks' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {decks.length === 0 ? (
                <EmptyState message={t.dashboard.noDecks} onCreate={() => navigate('/create')} label={t.dashboard.createFirst} />
              ) : decks.map((deck, i) => (
                <motion.div key={deck.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0" style={{ background: deck.color }}>
                      {deck.name.charAt(0).toUpperCase()}
                    </div>
                    <button onClick={() => deleteDeck(deck.id)} className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-0.5 truncate">{deck.name}</h3>
                  <p className="text-xs text-slate-400 mb-1">{deck._count?.cards ?? 0} {t.dashboard.cards}</p>
                  {deck.examDate && (
                    <p className="text-xs text-indigo-500 mb-3 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {new Date(deck.examDate).toLocaleDateString()}
                    </p>
                  )}
                  {!deck.examDate && <div className="mb-3" />}
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" className="flex-1 justify-center" onClick={() => navigate(`/deck/${deck.id}`)}>
                      <BookOpen className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="sm" className="flex-1 justify-center" onClick={() => navigate(`/study/${deck.id}`)}>
                      <Play className="w-3.5 h-3.5" /> {t.dashboard.study}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Quizzes */}
          {tab === 'quizzes' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {quizzes.length === 0 ? (
                <EmptyState message={t.dashboard.noQuizzes} onCreate={() => navigate('/create')} label={t.dashboard.createFirst} />
              ) : quizzes.map((quiz, i) => (
                <motion.div key={quiz.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 flex items-center justify-center">
                      <HelpCircle className="w-5 h-5 text-purple-600" />
                    </div>
                    <button onClick={() => deleteQuiz(quiz.id)} className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-0.5 truncate">{quiz.title}</h3>
                  <p className="text-xs text-slate-400 mb-4">{quiz._count?.questions ?? 0} {t.dashboard.questions}</p>
                  <Button size="sm" className="w-full justify-center" onClick={() => navigate(`/quiz/${quiz.id}`)}>
                    <Play className="w-3.5 h-3.5" /> {t.dashboard.takeQuiz}
                  </Button>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Summaries */}
          {tab === 'summaries' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {summaries.length === 0 ? (
                <EmptyState message={t.dashboard.noSummaries} onCreate={() => navigate('/create')} label={t.dashboard.createFirst} />
              ) : summaries.map((s, i) => (
                <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/summary/${s.id}`)}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-emerald-600" />
                    </div>
                    <button onClick={e => { e.stopPropagation(); deleteSummary(s.id); }} className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1 truncate">{s.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2">{s.content.substring(0, 120)}…</p>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Examiner */}
          {tab === 'examiner' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">Upload your notes — The Examiner tests you on exactly what you uploaded.</p>
                <Button size="sm" onClick={() => navigate('/examiner')}>
                  <Plus className="w-4 h-4" /> New Exam
                </Button>
              </div>
              {examinerSessions.length === 0 ? (
                <div className="flex flex-col items-center py-20 text-center">
                  <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-950 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">🎓</div>
                  <p className="text-slate-400 mb-4">No exam sessions yet.</p>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/examiner')}>
                    <Plus className="w-4 h-4" /> Start your first exam
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {examinerSessions.map((s, i) => {
                    const DIFF_COLORS: Record<string, string> = { standard: '#3B82F6', hard: '#F59E0B', brutal: '#EF4444' };
                    const DIFF_LABELS: Record<string, string> = { standard: 'Standard', hard: 'Hard', brutal: 'Brutal' };
                    return (
                      <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => navigate(`/examiner/${s.id}`)}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center">
                            <GraduationCap className="w-5 h-5 text-indigo-600" />
                          </div>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: (DIFF_COLORS[s.difficulty] || '#3B82F6') + '22', color: DIFF_COLORS[s.difficulty] || '#3B82F6' }}>
                            {DIFF_LABELS[s.difficulty] || s.difficulty}
                          </span>
                        </div>
                        <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1 truncate">{s.material_name}</h3>
                        <p className="text-xs text-slate-400 mb-3">
                          {s.exchange_count} / {s.question_count} questions · {s.completed ? '✅ Complete' : '⏳ In progress'}
                        </p>
                        <p className="text-xs text-slate-300 dark:text-slate-600">{new Date(s.created_at).toLocaleDateString()}</p>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </>
      )}
    </AppLayout>
  );
}

function StatCard({ icon, value, label, bg }: { icon: ReactNode; value: number; label: string; bg: string }) {
  return (
    <div className={`${bg} rounded-2xl p-4 flex items-center gap-3`}>
      {icon}
      <div>
        <div className="text-xl font-black text-slate-900 dark:text-slate-100">{value}</div>
        <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      </div>
    </div>
  );
}

function EmptyState({ message, onCreate, label }: { message: string; onCreate: () => void; label: string }) {
  return (
    <div className="col-span-full flex flex-col items-center py-20 text-center">
      <p className="text-slate-400 mb-4">{message}</p>
      <Button variant="ghost" onClick={onCreate} size="sm"><Plus className="w-4 h-4" /> {label}</Button>
    </div>
  );
}
