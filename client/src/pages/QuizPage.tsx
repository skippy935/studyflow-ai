import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import Button    from '../components/ui/Button';
import Spinner   from '../components/ui/Spinner';
import { apiFetch } from '../lib/api';
import type { Quiz, QuizQuestion } from '../types';

export default function QuizPage() {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quiz, setQuiz]         = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading]   = useState(true);
  const [index, setIndex]       = useState(0);
  const [answers, setAnswers]   = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState<Record<number, boolean>>({});
  const [done, setDone]         = useState(false);

  useEffect(() => {
    apiFetch<{ quiz: Quiz; questions: QuizQuestion[] }>(`/quizzes/${id}`)
      .then(d => { setQuiz(d.quiz); setQuestions(d.questions); })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <AppLayout><div className="flex justify-center py-20"><Spinner size="lg" /></div></AppLayout>;
  if (!quiz || !questions.length) return <AppLayout><p className="text-slate-500">Quiz not found.</p></AppLayout>;

  const q   = questions[index];
  const isSubmitted = submitted[q.id];
  const pct = Math.round((index / questions.length) * 100);

  function checkAnswer() {
    setSubmitted(s => ({ ...s, [q.id]: true }));
  }

  function next() {
    if (index + 1 >= questions.length) setDone(true);
    else { setIndex(i => i + 1); }
  }

  if (done) {
    const mcqs    = questions.filter(q => q.type === 'multiple_choice');
    const correct = mcqs.filter(q => answers[q.id] === q.correct).length;
    const pctScore = mcqs.length ? Math.round((correct / mcqs.length) * 100) : 0;

    return (
      <AppLayout>
        <div className="max-w-xl mx-auto text-center py-10">
          <div className="text-5xl mb-5">🎉</div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-2">Quiz Complete!</h2>
          <p className="text-slate-500 mb-8">Here's how you did:</p>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 mb-6">
            <div className="text-5xl font-black text-indigo-600 mb-1">{correct}/{mcqs.length}</div>
            <div className="text-sm text-slate-400 mb-4">Multiple choice score</div>
            <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <motion.div animate={{ width: `${pctScore}%` }} className="h-full bg-indigo-600 rounded-full" />
            </div>
          </div>
          {questions.filter(q => q.type === 'open').length > 0 && (
            <div className="text-left space-y-3 mb-6">
              <h3 className="font-bold text-slate-900 dark:text-slate-100">Open Question Review</h3>
              {questions.filter(q => q.type === 'open').map(q => (
                <div key={q.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4">
                  <p className="font-semibold text-sm text-slate-900 dark:text-slate-100 mb-2">{q.question}</p>
                  <p className="text-xs text-slate-500 mb-1"><strong>Your answer:</strong> {answers[q.id] || '(no answer)'}</p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400"><strong>Model answer:</strong> {q.sampleAnswer}</p>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-3 justify-center">
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>Dashboard</Button>
            <Button onClick={() => window.location.reload()}>Retake Quiz</Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> {quiz.title}
        </button>

        {/* Progress */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <motion.div animate={{ width: `${pct}%` }} className="h-full bg-indigo-600 rounded-full" />
          </div>
          <span className="text-xs font-bold text-slate-400 tabular-nums">{index + 1} / {questions.length}</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8">
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
                  cls += answers[q.id] === opt ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-200' : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 text-slate-700 dark:text-slate-300 cursor-pointer';
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
                  <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl text-sm text-slate-600 dark:text-slate-300 mb-3">{answers[q.id] || '(no answer)'}</div>
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950 rounded-2xl">
                    <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1">MODEL ANSWER</p>
                    <p className="text-sm text-emerald-800 dark:text-emerald-200 mb-2">{q.sampleAnswer}</p>
                    {q.keywords?.length ? <p className="text-xs text-emerald-700 dark:text-emerald-400">Key terms: {q.keywords.map(k => <strong key={k} className="mr-1">{k}</strong>)}</p> : null}
                  </div>
                </>
              ) : (
                <textarea value={answers[q.id] || ''} onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.value }))} rows={4} placeholder="Write your answer here…" className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none" />
              )}
            </div>
          )}

          <Button size="lg" className="w-full justify-center" onClick={isSubmitted ? next : checkAnswer}>
            {isSubmitted ? (index < questions.length - 1 ? 'Next Question →' : 'See Results') : 'Check Answer'}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
