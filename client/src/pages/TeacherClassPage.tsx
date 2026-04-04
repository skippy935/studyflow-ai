import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, User, Calendar, Trophy, Flame, Check } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Spinner from '../components/ui/Spinner';
import { apiFetch } from '../lib/api';
import { levelFromXP } from '../lib/xp';
import toast from 'react-hot-toast';

interface Student {
  id: number;
  displayName: string;
  email: string;
  xp: number;
  streak: number;
  totalCardsLearned: number;
  lastStudyDate: string | null;
}

interface Assignment {
  id: number;
  title: string;
  description: string;
  dueDate: string | null;
  maxXp: number;
  _count: { submissions: number };
}

interface ClassDetail {
  id: number;
  name: string;
  subject: string;
  gradeLevel: string;
  joinCode: string;
  members: { user: Student }[];
  assignments: Assignment[];
}

export default function TeacherClassPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cls, setCls] = useState<ClassDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'students' | 'assignments'>('students');
  const [showNew, setShowNew] = useState(false);
  const [aTitle, setATitle] = useState('');
  const [aDesc, setADesc] = useState('');
  const [aDue, setADue] = useState('');
  const [aXp, setAXp] = useState('10');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiFetch<{ class: ClassDetail }>(`/teacher/classes/${id}`)
      .then(d => setCls(d.class))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  async function createAssignment() {
    if (!aTitle.trim()) return;
    setSaving(true);
    try {
      const d = await apiFetch<{ assignment: Assignment }>('/teacher/assignments', {
        method: 'POST',
        body: JSON.stringify({ classId: parseInt(id!), title: aTitle, description: aDesc, dueDate: aDue || null, maxXp: parseInt(aXp) || 10 }),
      });
      setCls(prev => prev ? { ...prev, assignments: [d.assignment, ...prev.assignments] } : prev);
      setShowNew(false);
      setATitle(''); setADesc(''); setADue(''); setAXp('10');
      toast.success('Assignment created!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <AppLayout><div className="flex justify-center py-20"><Spinner size="lg" /></div></AppLayout>;
  if (!cls) return <AppLayout><p className="text-slate-500 p-6">Class not found.</p></AppLayout>;

  const students = cls.members.map(m => m.user);

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <button onClick={() => navigate('/teacher')} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Teacher Dashboard
        </button>
        <div className="flex items-start justify-between mb-5">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{cls.name}</h1>
            <p className="text-sm text-slate-500">{[cls.subject, cls.gradeLevel].filter(Boolean).join(' · ')} · Join code: <span className="font-mono font-bold text-indigo-600">{cls.joinCode}</span></p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
          {(['students', 'assignments'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg capitalize transition-all ${tab === t ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm' : 'text-slate-500'}`}>
              {t} {t === 'students' ? `(${students.length})` : `(${cls.assignments.length})`}
            </button>
          ))}
        </div>

        {/* Students tab */}
        {tab === 'students' && (
          students.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <User className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-semibold">No students yet</p>
              <p className="text-sm mt-1">Share the join code <span className="font-mono font-bold text-indigo-600">{cls.joinCode}</span> with your students.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {students.sort((a, b) => b.xp - a.xp).map((s, i) => (
                <div key={s.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 px-4 py-3 flex items-center gap-3">
                  <span className="text-sm font-bold text-slate-400 w-5 text-center">{i + 1}</span>
                  <div className="w-9 h-9 bg-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {s.displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{s.displayName}</p>
                    <p className="text-xs text-slate-400 truncate">{s.email}</p>
                  </div>
                  <div className="text-right text-xs text-slate-500 flex-shrink-0">
                    <div className="flex items-center gap-2 justify-end">
                      <span className="flex items-center gap-0.5"><Trophy className="w-3 h-3 text-indigo-500" /> Lv {levelFromXP(s.xp)}</span>
                      {s.streak >= 3 && <span className="flex items-center gap-0.5 text-orange-500"><Flame className="w-3 h-3" />{s.streak}</span>}
                    </div>
                    <p className="mt-0.5">{s.xp.toLocaleString()} XP</p>
                    {s.lastStudyDate && (
                      <p className="mt-0.5 text-slate-400">
                        <Calendar className="w-2.5 h-2.5 inline mr-0.5" />
                        {new Date(s.lastStudyDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Assignments tab */}
        {tab === 'assignments' && (
          <>
            <div className="flex justify-end mb-3">
              <Button size="sm" onClick={() => setShowNew(true)}><Plus className="w-4 h-4" /> New Assignment</Button>
            </div>

            {showNew && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 mb-4">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-3">New assignment</h3>
                <div className="space-y-3">
                  <Input label="Title" value={aTitle} onChange={e => setATitle(e.target.value)} placeholder="e.g. Chapter 5 Summary" />
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
                    <textarea value={aDesc} onChange={e => setADesc(e.target.value)} rows={3}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                      placeholder="Instructions for students…" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="Due date" type="date" value={aDue} onChange={e => setADue(e.target.value)} />
                    <Input label="Max XP" type="number" value={aXp} onChange={e => setAXp(e.target.value)} />
                  </div>
                  <div className="flex gap-2">
                    <Button loading={saving} onClick={createAssignment} disabled={!aTitle.trim()}>Create</Button>
                    <Button variant="ghost" onClick={() => setShowNew(false)}>Cancel</Button>
                  </div>
                </div>
              </div>
            )}

            {cls.assignments.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <p className="font-semibold">No assignments yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {cls.assignments.map(a => (
                  <div key={a.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{a.title}</p>
                        {a.description && <p className="text-xs text-slate-500 mt-0.5 truncate">{a.description}</p>}
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                          {a.dueDate && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(a.dueDate).toLocaleDateString()}</span>}
                          <span className="flex items-center gap-1"><Trophy className="w-3 h-3" /> {a.maxXp} XP</span>
                          <span className="flex items-center gap-1"><Check className="w-3 h-3" /> {a._count.submissions} submitted</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
