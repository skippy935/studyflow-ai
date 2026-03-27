import { useEffect, useState, useRef, type ReactNode } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Layers, HelpCircle, FileText, Trash2, BookOpen, Play, Flame, Brain, AlertTriangle, Calendar, GraduationCap, FolderOpen, FolderPlus, ChevronRight, ChevronDown, MoreHorizontal, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import AppLayout from '../components/layout/AppLayout';
import Button    from '../components/ui/Button';
import Spinner   from '../components/ui/Spinner';
import StreakCalendar from '../components/ui/StreakCalendar';
import { apiFetch } from '../lib/api';
import { getUser }  from '../lib/auth';
import { useTranslation } from '../i18n';
import type { Deck, Quiz, Summary, Stats, Subject } from '../types';

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
  const [subjects,  setSubjects]  = useState<Subject[]>([]);
  const [stats,     setStats]     = useState<Stats | null>(null);
  const [upcomingTasks, setUpcomingTasks] = useState<{ id: number; title: string; dueDate: string | null; done: boolean }[]>([]);
  const [loading, setLoading]     = useState(true);

  // Subject UI state
  const [collapsedSubjects, setCollapsedSubjects] = useState<Set<number>>(new Set());
  const [newSubjectName, setNewSubjectName]       = useState('');
  const [showNewSubject, setShowNewSubject]       = useState(false);
  const [movingDeckId, setMovingDeckId]           = useState<number | null>(null);
  const newSubjectInputRef = useRef<HTMLInputElement>(null);
  const moveMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([
      apiFetch<{ decks: Deck[] }>('/decks').then(d => setDecks(d.decks)),
      apiFetch<{ quizzes: Quiz[] }>('/quizzes').then(d => setQuizzes(d.quizzes)),
      apiFetch<{ summaries: Summary[] }>('/summaries').then(d => setSummaries(d.summaries)),
      apiFetch<Stats>('/stats').then(s => setStats(s)),
      apiFetch<{ sessions: ExaminerSession[] }>('/examiner/sessions').then(d => setExaminerSessions(d.sessions)).catch(() => {}),
      apiFetch<{ subjects: Subject[] }>('/subjects').then(d => setSubjects(d.subjects)).catch(() => {}),
      apiFetch<{ tasks: { id: number; title: string; dueDate: string | null; done: boolean }[] }>('/planner')
        .then(d => setUpcomingTasks(d.tasks.filter(t => !t.done).slice(0, 5))).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  // Close move-to-subject dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (moveMenuRef.current && !moveMenuRef.current.contains(e.target as Node)) {
        setMovingDeckId(null);
      }
    }
    if (movingDeckId !== null) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [movingDeckId]);

  useEffect(() => {
    if (showNewSubject) newSubjectInputRef.current?.focus();
  }, [showNewSubject]);

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

  async function createSubject() {
    const name = newSubjectName.trim();
    if (!name) return;
    try {
      const data = await apiFetch<{ subject: Subject }>('/subjects', {
        method: 'POST',
        body: JSON.stringify({ name }),
      });
      setSubjects(prev => [...prev, data.subject]);
      setNewSubjectName('');
      setShowNewSubject(false);
      toast.success(`Subject "${name}" created`);
    } catch {
      toast.error('Failed to create subject');
    }
  }

  async function deleteSubject(id: number) {
    if (!confirm('Delete this subject? Decks inside will become unassigned.')) return;
    await apiFetch(`/subjects/${id}`, { method: 'DELETE' });
    setSubjects(prev => prev.filter(s => s.id !== id));
    setDecks(prev => prev.map(d => d.subjectId === id ? { ...d, subjectId: null } : d));
    toast.success('Subject deleted');
  }

  async function moveDeckToSubject(deckId: number, subjectId: number | null) {
    try {
      await apiFetch(`/decks/${deckId}/subject`, {
        method: 'PATCH',
        body: JSON.stringify({ subjectId }),
      });
      setDecks(prev => prev.map(d => d.id === deckId ? { ...d, subjectId } : d));
      setMovingDeckId(null);
    } catch {
      toast.error('Failed to move deck');
    }
  }

  function toggleSubject(id: number) {
    setCollapsedSubjects(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
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

  const ungroupedDecks = decks.filter(d => !d.subjectId);

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

      {/* Streak calendar */}
      {stats && <StreakCalendar streak={stats.streak} />}

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

      {/* Upcoming tasks widget */}
      {upcomingTasks.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Upcoming Tasks</h2>
            <Link to="/planner" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">View all →</Link>
          </div>
          <div className="space-y-2">
            {upcomingTasks.map(task => {
              const due = task.dueDate ? new Date(task.dueDate) : null;
              const now = new Date(); now.setHours(0,0,0,0);
              const diff = due ? Math.ceil((due.getTime() - now.getTime()) / 86400000) : null;
              const overdue = diff !== null && diff < 0;
              return (
                <div key={task.id} className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${overdue ? 'bg-red-400' : diff === 0 ? 'bg-orange-400' : 'bg-indigo-400'}`} />
                  <span className="text-sm text-slate-700 dark:text-slate-300 flex-1 truncate">{task.title}</span>
                  {diff !== null && (
                    <span className={`text-xs font-semibold flex-shrink-0 ${overdue ? 'text-red-500' : diff === 0 ? 'text-orange-500' : 'text-slate-400'}`}>
                      {overdue ? `${Math.abs(diff)}d overdue` : diff === 0 ? 'Today' : `${diff}d`}
                    </span>
                  )}
                </div>
              );
            })}
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {/* Decks tab header */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {decks.length} {decks.length === 1 ? 'deck' : 'decks'}{subjects.length > 0 ? ` · ${subjects.length} subject${subjects.length === 1 ? '' : 's'}` : ''}
                </p>
                <button
                  onClick={() => setShowNewSubject(v => !v)}
                  className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 px-3 py-1.5 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors">
                  <FolderPlus className="w-4 h-4" /> New Subject
                </button>
              </div>

              {/* New subject input */}
              <AnimatePresence>
                {showNewSubject && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className="mb-4 overflow-hidden">
                    <div className="flex gap-2 p-3 bg-indigo-50 dark:bg-indigo-950 rounded-2xl border border-indigo-100 dark:border-indigo-900">
                      <input
                        ref={newSubjectInputRef}
                        value={newSubjectName}
                        onChange={e => setNewSubjectName(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') createSubject(); if (e.key === 'Escape') { setShowNewSubject(false); setNewSubjectName(''); } }}
                        placeholder="Subject name (e.g. Biology, Semester 1…)"
                        className="flex-1 bg-transparent text-sm font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none"
                      />
                      <button onClick={createSubject} className="p-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => { setShowNewSubject(false); setNewSubjectName(''); }} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {decks.length === 0 && subjects.length === 0 ? (
                <EmptyState message={t.dashboard.noDecks} onCreate={() => navigate('/create')} label={t.dashboard.createFirst} />
              ) : (
                <div className="space-y-6">
                  {/* Subject groups */}
                  {subjects.map(subject => {
                    const subjectDecks = decks.filter(d => d.subjectId === subject.id);
                    const isCollapsed  = collapsedSubjects.has(subject.id);
                    return (
                      <div key={subject.id}>
                        {/* Subject header */}
                        <div className="flex items-center gap-2 mb-3 group">
                          <button
                            onClick={() => toggleSubject(subject.id)}
                            className="flex items-center gap-2 flex-1 min-w-0"
                          >
                            <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: subject.color + '22' }}>
                              {isCollapsed
                                ? <ChevronRight className="w-3.5 h-3.5" style={{ color: subject.color }} />
                                : <ChevronDown className="w-3.5 h-3.5" style={{ color: subject.color }} />
                              }
                            </div>
                            <FolderOpen className="w-4 h-4 flex-shrink-0" style={{ color: subject.color }} />
                            <span className="font-bold text-slate-800 dark:text-slate-200 text-sm truncate">{subject.name}</span>
                            <span className="text-xs text-slate-400 flex-shrink-0">{subjectDecks.length} deck{subjectDecks.length !== 1 ? 's' : ''}</span>
                          </button>
                          <button
                            onClick={() => deleteSubject(subject.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-all">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Subject decks */}
                        <AnimatePresence>
                          {!isCollapsed && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden">
                              {subjectDecks.length === 0 ? (
                                <p className="text-sm text-slate-400 italic pl-8 mb-2">No decks yet — move a deck here using the ⋯ menu.</p>
                              ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pl-2 border-l-2 ml-3" style={{ borderColor: subject.color + '44' }}>
                                  {subjectDecks.map((deck, i) => (
                                    <DeckCard key={deck.id} deck={deck} i={i} subjects={subjects}
                                      movingDeckId={movingDeckId} moveMenuRef={moveMenuRef}
                                      onDelete={deleteDeck} onNavigate={navigate}
                                      onMoveOpen={setMovingDeckId} onMoveToSubject={moveDeckToSubject}
                                      t={t} />
                                  ))}
                                </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}

                  {/* Ungrouped decks */}
                  {ungroupedDecks.length > 0 && (
                    <div>
                      {subjects.length > 0 && (
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Ungrouped</span>
                          <span className="text-xs text-slate-400">{ungroupedDecks.length} deck{ungroupedDecks.length !== 1 ? 's' : ''}</span>
                        </div>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {ungroupedDecks.map((deck, i) => (
                          <DeckCard key={deck.id} deck={deck} i={i} subjects={subjects}
                            movingDeckId={movingDeckId} moveMenuRef={moveMenuRef}
                            onDelete={deleteDeck} onNavigate={navigate}
                            onMoveOpen={setMovingDeckId} onMoveToSubject={moveDeckToSubject}
                            t={t} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
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

// ── DeckCard extracted to keep parent clean ────────────────────────────────
interface DeckCardProps {
  deck: Deck;
  i: number;
  subjects: Subject[];
  movingDeckId: number | null;
  moveMenuRef: React.RefObject<HTMLDivElement>;
  onDelete: (id: number) => void;
  onNavigate: ReturnType<typeof useNavigate>;
  onMoveOpen: (id: number | null) => void;
  onMoveToSubject: (deckId: number, subjectId: number | null) => void;
  t: ReturnType<typeof useTranslation>['t'];
}

function DeckCard({ deck, i, subjects, movingDeckId, moveMenuRef, onDelete, onNavigate, onMoveOpen, onMoveToSubject, t }: DeckCardProps) {
  const isMenuOpen = movingDeckId === deck.id;
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0" style={{ background: deck.color }}>
          {deck.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex items-center gap-1">
          {/* Move to subject button */}
          {subjects.length > 0 && (
            <div className="relative" ref={isMenuOpen ? moveMenuRef : null}>
              <button
                onClick={e => { e.stopPropagation(); onMoveOpen(isMenuOpen ? null : deck.id); }}
                className="p-1.5 rounded-lg text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors">
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>
              {isMenuOpen && (
                <div className="absolute right-0 top-8 z-20 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 py-1 min-w-[160px]">
                  <p className="px-3 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider">Move to subject</p>
                  {subjects.map(s => (
                    <button key={s.id} onClick={() => onMoveToSubject(deck.id, s.id)}
                      className={`flex items-center gap-2 w-full px-3 py-1.5 text-sm text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${deck.subjectId === s.id ? 'font-semibold text-indigo-600' : 'text-slate-700 dark:text-slate-300'}`}>
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
                      {s.name}
                      {deck.subjectId === s.id && <Check className="w-3 h-3 ml-auto" />}
                    </button>
                  ))}
                  {deck.subjectId && (
                    <button onClick={() => onMoveToSubject(deck.id, null)}
                      className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-left text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border-t border-slate-100 dark:border-slate-700 mt-1 pt-1">
                      <X className="w-3 h-3" /> Remove from subject
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
          <button onClick={() => onDelete(deck.id)} className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
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
        <Button size="sm" variant="ghost" className="flex-1 justify-center" onClick={() => onNavigate(`/deck/${deck.id}`)}>
          <BookOpen className="w-3.5 h-3.5" />
        </Button>
        <Button size="sm" className="flex-1 justify-center" onClick={() => onNavigate(`/study/${deck.id}`)}>
          <Play className="w-3.5 h-3.5" /> {t.dashboard.study}
        </Button>
      </div>
    </motion.div>
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
