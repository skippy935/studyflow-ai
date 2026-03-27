import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Shuffle, Check, X, ChevronRight } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import Button    from '../components/ui/Button';
import Spinner   from '../components/ui/Spinner';
import { apiFetch } from '../lib/api';
import type { Quiz, QuizQuestion } from '../types';

type Phase = 'intro' | 'quiz' | 'results';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function scoreFeedback(pct: number): { emoji: string; msg: string; cls: string } {
  if (pct >= 90) return { emoji: '🏆', msg: 'Outstanding!',     cls: 'text-emerald-600' };
  if (pct >= 75) return { emoji: '🎉', msg: 'Great work!',       cls: 'text-indigo-600'  };
  if (pct >= 55) return { emoji: '📚', msg: 'Getting there.',    cls: 'text-amber-600'   };
  return           { emoji: '💪', msg: 'Keep practising.',       cls: 'text-red-600'     };
}

export default function QuizPage() {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quiz, setQuiz]         = useState<Quiz | null>(null);
  const [rawQuestions, setRawQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading]   = useState(true);
  const [phase, setPhase]       = useState<Phase>('intro');
  const [shuffled, setShuffled] = useState(false);

  // Quiz state
  const [orderedQ, setOrderedQ] = useState<QuizQuestion[]>([]);
  const [index, setIndex]       = useState(0);
  const [answers, setAnswers]   = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState<Record<number, boolean>>({});
  const [reviewAll, setReviewAll] = useState(false);

  useEffect(() => {
    apiFetch<{ quiz: Quiz; questions: QuizQuestion[] }>(`/quizzes/${id}`)
      .then(d => { setQuiz(d.quiz); setRawQuestions(d.questions); })
      .finally(() => setLoading(false));
  }, [id]);

  function startQuiz() {
    setOrderedQ(shuffled ? shuffle(rawQuestions) : rawQuestions);
    setIndex(0);
    setAnswers({});
    setSubmitted({});
    setPhase('quiz');
  }

  const q          = orderedQ[index];
  const isSubmitted = q ? submitted[q.id] : false;
  const pct        = orderedQ.length ? Math.round((index / orderedQ.length) * 100) : 0;

  // Results calculations
  const mcqs      = useMemo(() => orderedQ.filter(q => q.type === 'multiple_choice'), [orderedQ]);
  const correct   = useMemo(() => mcqs.filter(q => answers[q.id] === q.correct).length, [mcqs, answers]);
  const pctScore  = mcqs.length ? Math.round((correct / mcqs.length) * 100) : 0;
  const feedback  = scoreFeedback(pctScore);
  const wrongMcqs = mcqs.filter(q => answers[q.id] !== q.correct);

  if (loading) return <AppLayout><div className="flex justify-center py-20"><Spinner size="lg" /></div></AppLayout>;
  if (!quiz || !rawQuestions.length) return <AppLayout><p className="text-slate-500">Quiz not found.</p></AppLayout>;

  // ── INTRO ──────────────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <AppLayout>
        <div className="max-w-xl mx-auto">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </button>
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 text-center">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-950 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <span className="text-3xl">🧠</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mb-2">{quiz.title}</h1>
            <p className="text-slate-400 text-sm mb-6">{rawQuestions.length} question{rawQuestions.length !== 1 ? 's' : ''}</p>

            <div className="grid grid-cols-2 gap-3 text-sm mb-8">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div className="font-bold text-slate-900 dark:text-slate-100">{rawQuestions.filter(q => q.type === 'multiple_choice').length}</div>
                <div className="text-slate-400 text-xs">Multiple choice</div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div className="font-bold text-slate-900 dark:text-slate-100">{rawQuestions.filter(q => q.type === 'open').length}</div>
                <div className="text-slate-400 text-xs">Open questions</div>
              </div>
            </div>

            <button
              onClick={() => setShuffled(s => !s)}
              className={`flex items-center gap-2 mx-auto mb-6 px-4 py-2 rounded-xl border-2 text-sm font-semibold transition-all ${shuffled ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-950 text-indigo-600' : 'border-slate-200 dark:border-slate-700 text-slate-500'}`}>
              <Shuffle className="w-4 h-4" />
              Shuffle questions {shuffled ? '(on)' : '(off)'}
            </button>

            <Button size="lg" className="w-full justify-center" onClick={startQuiz}>
              Start Quiz →
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  // ── RESULTS ────────────────────────────────────────────────────────────
  if (phase === 'results') {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">{feedback.emoji}</div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-1">{feedback.msg}</h2>
            <p className="text-slate-400 text-sm">Quiz complete</p>
          </div>

          {/* Score card */}
          {mcqs.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 mb-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Multiple Choice Score</span>
                <span className={`text-2xl font-black ${feedback.cls}`}>{pctScore}%</span>
              </div>
              <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-2">
                <motion.div
                  initial={{ width: 0 }} animate={{ width: `${pctScore}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className={`h-full rounded-full ${pctScore >= 75 ? 'bg-emerald-500' : pctScore >= 55 ? 'bg-amber-500' : 'bg-red-500'}`} />
              </div>
              <p className="text-xs text-slate-400">{correct} of {mcqs.length} correct</p>
            </div>
          )}

          {/* Question-by-question breakdown */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden mb-5">
            <button
              onClick={() => setReviewAll(v => !v)}
              className="w-full flex items-center justify-between px-5 py-4 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <span>Review all questions ({orderedQ.length})</span>
              <ChevronRight className={`w-4 h-4 transition-transform ${reviewAll ? 'rotate-90' : ''}`} />
            </button>

            <AnimatePresence>
              {reviewAll && (
                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                  <div className="border-t border-slate-100 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
                    {orderedQ.map((question, i) => {
                      const userAns = answers[question.id] || '(no answer)';
                      const isMcq   = question.type === 'multiple_choice';
                      const isRight = isMcq && userAns === question.correct;
                      const isWrong = isMcq && userAns !== question.correct;
                      return (
                        <div key={question.id} className="px-5 py-4">
                          <div className="flex items-start gap-3">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${isMcq ? (isRight ? 'bg-emerald-500' : 'bg-red-400') : 'bg-slate-300 dark:bg-slate-600'}`}>
                              {isMcq
                                ? (isRight ? <Check className="w-3 h-3 text-white" /> : <X className="w-3 h-3 text-white" />)
                                : <span className="text-white text-xs font-bold">{i + 1}</span>
                              }
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">{question.question}</p>
                              {isMcq ? (
                                <>
                                  {isWrong && <p className="text-xs text-red-600 dark:text-red-400 mb-1">Your answer: {userAns}</p>}
                                  <p className={`text-xs font-semibold ${isRight ? 'text-emerald-600' : 'text-emerald-700 dark:text-emerald-400'}`}>✓ {question.correct}</p>
                                  {question.explanation && isWrong && (
                                    <p className="text-xs text-slate-500 mt-1 italic">{question.explanation}</p>
                                  )}
                                </>
                              ) : (
                                <>
                                  <p className="text-xs text-slate-500 mb-1"><span className="font-semibold">Your answer:</span> {userAns}</p>
                                  <p className="text-xs text-emerald-700 dark:text-emerald-400"><span className="font-semibold">Model answer:</span> {question.sampleAnswer}</p>
                                  {question.keywords?.length ? (
                                    <p className="text-xs text-slate-400 mt-1">Key terms: {question.keywords.join(', ')}</p>
                                  ) : null}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="ghost" className="flex-1 justify-center" onClick={() => navigate('/dashboard')}>Dashboard</Button>
            {wrongMcqs.length > 0 && (
              <Button variant="ghost" className="flex-1 justify-center" onClick={() => {
                const topics = wrongMcqs.map(q => q.question.slice(0, 60)).join(',');
                navigate(`/planner?gaps=${encodeURIComponent(topics)}`);
              }}>
                📋 Add weak areas to planner
              </Button>
            )}
            <Button className="flex-1 justify-center" onClick={() => { setPhase('intro'); }}>
              Retake Quiz
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  // ── QUIZ ───────────────────────────────────────────────────────────────
  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> {quiz.title}
        </button>

        {/* Progress */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <motion.div animate={{ width: `${pct}%` }} className="h-full bg-indigo-600 rounded-full" />
          </div>
          <span className="text-xs font-bold text-slate-400 tabular-nums">{index + 1} / {orderedQ.length}</span>
        </div>

        <motion.div key={q.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8">
          {/* Type badge */}
          <div className={`inline-block text-xs font-bold uppercase tracking-wider mb-4 ${q.type === 'multiple_choice' ? 'text-purple-600' : 'text-sky-600'}`}>
            {q.type === 'multiple_choice' ? 'Multiple Choice' : 'Open Question'}
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-6">{q.question}</p>

          {q.type === 'multiple_choice' ? (
            <div className="space-y-2 mb-6">
              {(q.options || []).map(opt => {
                let cls = 'w-full flex items-center gap-3 p-4 rounded-2xl border-2 text-left text-sm font-medium transition-all ';
                if (isSubmitted) {
                  if (opt === q.correct) cls += 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200';
                  else if (opt === answers[q.id]) cls += 'border-red-400 bg-red-50 dark:bg-red-950 text-red-800 dark:text-red-200';
                  else cls += 'border-slate-100 dark:border-slate-800 text-slate-400';
                } else {
                  cls += answers[q.id] === opt
                    ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-200'
                    : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 text-slate-700 dark:text-slate-300 cursor-pointer';
                }
                return (
                  <button key={opt} className={cls} disabled={isSubmitted}
                    onClick={() => !isSubmitted && setAnswers(a => ({ ...a, [q.id]: opt }))}>
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
                  <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl text-sm text-slate-600 dark:text-slate-300 mb-3">
                    {answers[q.id] || '(no answer)'}
                  </div>
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950 rounded-2xl">
                    <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1">MODEL ANSWER</p>
                    <p className="text-sm text-emerald-800 dark:text-emerald-200 mb-2">{q.sampleAnswer}</p>
                    {q.keywords?.length ? (
                      <p className="text-xs text-emerald-700 dark:text-emerald-400">
                        Key terms: {q.keywords.map(k => <strong key={k} className="mr-1">{k}</strong>)}
                      </p>
                    ) : null}
                  </div>
                </>
              ) : (
                <textarea
                  value={answers[q.id] || ''}
                  onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.value }))}
                  rows={4}
                  placeholder="Write your answer here…"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                />
              )}
            </div>
          )}

          <Button size="lg" className="w-full justify-center"
            onClick={() => {
              if (!isSubmitted) {
                setSubmitted(s => ({ ...s, [q.id]: true }));
              } else {
                if (index + 1 >= orderedQ.length) setPhase('results');
                else setIndex(i => i + 1);
              }
            }}>
            {isSubmitted
              ? (index < orderedQ.length - 1 ? 'Next Question →' : 'See Results')
              : 'Check Answer'}
          </Button>
        </motion.div>
      </div>
    </AppLayout>
  );
}
