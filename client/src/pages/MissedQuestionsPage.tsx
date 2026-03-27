import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Trash2, Play, Check, X, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import AppLayout from '../components/layout/AppLayout';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import { apiFetch } from '../lib/api';
import type { QuizQuestion } from '../types';

interface MissedEntry {
  id: number;
  questionId: number;
  timesWrong: number;
  lastSeenAt: string;
  question: QuizQuestion;
  quiz: { id: number; title: string };
}

type Mode = 'list' | 'practice';

export default function MissedQuestionsPage() {
  const navigate = useNavigate();
  const [missed,  setMissed]  = useState<MissedEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode,    setMode]    = useState<Mode>('list');

  // Practice state
  const [practiceQ,   setPracticeQ]   = useState<QuizQuestion[]>([]);
  const [pIndex,      setPIndex]      = useState(0);
  const [pAnswers,    setPAnswers]     = useState<Record<number, string>>({});
  const [pSubmitted,  setPSubmitted]  = useState<Record<number, boolean>>({});
  const [practiceEnd, setPracticeEnd] = useState(false);

  useEffect(() => {
    apiFetch<{ missed: MissedEntry[] }>('/quizzes/missed')
      .then(d => setMissed(d.missed))
      .finally(() => setLoading(false));
  }, []);

  async function markLearned(questionId: number) {
    await apiFetch(`/quizzes/missed/${questionId}`, { method: 'DELETE' });
    setMissed(prev => prev.filter(m => m.questionId !== questionId));
    toast.success('Removed from missed questions');
  }

  function startPractice() {
    setPracticeQ(missed.map(m => m.question));
    setPIndex(0);
    setPAnswers({});
    setPSubmitted({});
    setPracticeEnd(false);
    setMode('practice');
  }

  // ── PRACTICE MODE ──────────────────────────────────────────────────────
  if (mode === 'practice') {
    if (practiceEnd) {
      const mcqs    = practiceQ.filter(q => q.type === 'multiple_choice');
      const correct = mcqs.filter(q => pAnswers[q.id] === q.correct).length;
      const pct     = mcqs.length ? Math.round((correct / mcqs.length) * 100) : 0;
      return (
        <AppLayout>
          <div className="max-w-xl mx-auto text-center py-10">
            <div className="text-5xl mb-4">{pct >= 75 ? '🎉' : '📚'}</div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-2">Practice Complete!</h2>
            {mcqs.length > 0 && (
              <p className="text-slate-500 mb-6">{correct}/{mcqs.length} correct ({pct}%)</p>
            )}
            <div className="flex gap-3 justify-center">
              <Button variant="ghost" onClick={() => setMode('list')}>Back to Bank</Button>
              <Button onClick={startPractice}>Retry</Button>
            </div>
          </div>
        </AppLayout>
      );
    }

    const q = practiceQ[pIndex];
    const isSubmitted = pSubmitted[q.id];
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto">
          <button onClick={() => setMode('list')} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Missed Questions Bank
          </button>

          <div className="flex items-center gap-3 mb-8">
            <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <motion.div animate={{ width: `${Math.round((pIndex / practiceQ.length) * 100)}%` }} className="h-full bg-red-400 rounded-full" />
            </div>
            <span className="text-xs font-bold text-slate-400 tabular-nums">{pIndex + 1} / {practiceQ.length}</span>
          </div>

          <motion.div key={q.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8">
            <div className="text-xs font-bold uppercase tracking-wider text-red-500 mb-4">Missed Question</div>
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-6">{q.question}</p>

            {q.type === 'multiple_choice' ? (
              <div className="space-y-2 mb-6">
                {(q.options || []).map(opt => {
                  let cls = 'w-full flex items-center gap-3 p-4 rounded-2xl border-2 text-left text-sm font-medium transition-all ';
                  if (isSubmitted) {
                    if (opt === q.correct) cls += 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200';
                    else if (opt === pAnswers[q.id]) cls += 'border-red-400 bg-red-50 dark:bg-red-950 text-red-800 dark:text-red-200';
                    else cls += 'border-slate-100 dark:border-slate-800 text-slate-400';
                  } else {
                    cls += pAnswers[q.id] === opt
                      ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-200'
                      : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 text-slate-700 dark:text-slate-300 cursor-pointer';
                  }
                  return (
                    <button key={opt} className={cls} disabled={isSubmitted}
                      onClick={() => !isSubmitted && setPAnswers(a => ({ ...a, [q.id]: opt }))}>
                      <span className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-xs font-bold flex-shrink-0">{opt.charAt(0)}</span>
                      {opt}
                    </button>
                  );
                })}
                {isSubmitted && q.explanation && (
                  <div className="mt-3 p-4 bg-indigo-50 dark:bg-indigo-950 rounded-2xl text-sm text-indigo-800 dark:text-indigo-200">
                    💡 {q.explanation}
                  </div>
                )}
              </div>
            ) : (
              <div className="mb-6">
                {isSubmitted ? (
                  <>
                    <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl text-sm text-slate-600 dark:text-slate-300 mb-3">{pAnswers[q.id] || '(no answer)'}</div>
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-950 rounded-2xl">
                      <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1">MODEL ANSWER</p>
                      <p className="text-sm text-emerald-800 dark:text-emerald-200">{q.sampleAnswer}</p>
                    </div>
                  </>
                ) : (
                  <textarea value={pAnswers[q.id] || ''} onChange={e => setPAnswers(a => ({ ...a, [q.id]: e.target.value }))}
                    rows={4} placeholder="Write your answer…"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none" />
                )}
              </div>
            )}

            <Button size="lg" className="w-full justify-center"
              onClick={() => {
                if (!isSubmitted) {
                  setPSubmitted(s => ({ ...s, [q.id]: true }));
                } else {
                  if (pIndex + 1 >= practiceQ.length) setPracticeEnd(true);
                  else setPIndex(i => i + 1);
                }
              }}>
              {isSubmitted ? (pIndex < practiceQ.length - 1 ? 'Next →' : 'Finish') : 'Check Answer'}
            </Button>
          </motion.div>
        </div>
      </AppLayout>
    );
  }

  // ── LIST MODE ──────────────────────────────────────────────────────────
  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </button>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span className="text-2xl">❌</span> Missed Questions Bank
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">Questions you've got wrong — practice until they stick.</p>
          </div>
          {missed.length > 0 && (
            <Button size="sm" onClick={startPractice}>
              <Play className="w-4 h-4" /> Practice All
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : missed.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950 rounded-2xl flex items-center justify-center text-2xl mb-4">✅</div>
            <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">No missed questions!</p>
            <p className="text-sm text-slate-400 mb-4">Complete a quiz to populate your missed questions bank.</p>
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>Go to Quizzes</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {missed.map((entry, i) => {
              const q = entry.question;
              return (
                <motion.div key={entry.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-bold text-slate-400 uppercase">{entry.quiz.title}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${q.type === 'multiple_choice' ? 'bg-purple-100 dark:bg-purple-950 text-purple-600' : 'bg-sky-100 dark:bg-sky-950 text-sky-600'}`}>
                          {q.type === 'multiple_choice' ? 'MCQ' : 'Open'}
                        </span>
                        <span className="text-xs text-red-500 font-semibold">✗ {entry.timesWrong}×</span>
                      </div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">{q.question}</p>
                      {q.type === 'multiple_choice' && q.correct && (
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <Check className="w-3 h-3" /> {q.correct}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => markLearned(entry.questionId)}
                        title="Mark as learned"
                        className="p-1.5 rounded-lg text-slate-300 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950 transition-colors">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => navigate(`/quiz/${entry.quiz.id}`)}
                        title="Go to quiz"
                        className="p-1.5 rounded-lg text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors">
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => markLearned(entry.questionId)}
                        title="Remove"
                        className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
