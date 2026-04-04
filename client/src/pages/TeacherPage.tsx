import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Plus, Users, BookOpen, Copy, Check } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Spinner from '../components/ui/Spinner';
import { apiFetch } from '../lib/api';
import toast from 'react-hot-toast';

interface TeacherClass {
  id: number;
  name: string;
  subject: string;
  gradeLevel: string;
  joinCode: string;
  _count: { members: number; assignments: number };
}

export default function TeacherPage() {
  const navigate = useNavigate();
  const [isTeacher, setIsTeacher] = useState<boolean | null>(null);
  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [schoolName, setSchoolName] = useState('');
  const [newName, setNewName] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newGrade, setNewGrade] = useState('');
  const [saving, setSaving] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ isTeacher: boolean }>('/teacher/profile')
      .then(d => {
        setIsTeacher(d.isTeacher);
        if (d.isTeacher) loadClasses();
        else setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function loadClasses() {
    apiFetch<{ classes: TeacherClass[] }>('/teacher/classes')
      .then(d => setClasses(d.classes))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  async function registerTeacher() {
    setSaving(true);
    try {
      await apiFetch('/teacher/register', { method: 'POST', body: JSON.stringify({ schoolName }) });
      setIsTeacher(true);
      loadClasses();
      toast.success('Teacher account activated!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    } finally {
      setSaving(false);
    }
  }

  async function createClass() {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const d = await apiFetch<{ class: TeacherClass }>('/teacher/classes', {
        method: 'POST',
        body: JSON.stringify({ name: newName, subject: newSubject, gradeLevel: newGrade }),
      });
      setClasses(prev => [d.class, ...prev]);
      setShowCreate(false);
      setNewName(''); setNewSubject(''); setNewGrade('');
      toast.success(`Class "${d.class.name}" created — code: ${d.class.joinCode}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    } finally {
      setSaving(false);
    }
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    });
  }

  if (loading) return <AppLayout><div className="flex justify-center py-20"><Spinner size="lg" /></div></AppLayout>;

  // Not a teacher yet — registration screen
  if (!isTeacher) {
    return (
      <AppLayout>
        <div className="max-w-md mx-auto text-center py-16">
          <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-950 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <GraduationCap className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mb-2">Teacher Account</h1>
          <p className="text-slate-500 text-sm mb-8">Create classes, upload assignments, and track student progress.</p>
          <div className="text-left mb-6">
            <Input label="School name (optional)" value={schoolName} onChange={e => setSchoolName(e.target.value)} placeholder="e.g. Goethe Gymnasium Berlin" />
          </div>
          <Button size="lg" className="w-full justify-center" loading={saving} onClick={registerTeacher}>
            Activate Teacher Account
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">Teacher Dashboard</h1>
            <p className="text-sm text-slate-500">{classes.length} class{classes.length !== 1 ? 'es' : ''}</p>
          </div>
          <Button onClick={() => setShowCreate(true)} size="sm">
            <Plus className="w-4 h-4" /> New Class
          </Button>
        </div>

        {/* Create class form */}
        {showCreate && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 mb-5">
            <h2 className="font-bold text-slate-900 dark:text-slate-100 mb-4">Create new class</h2>
            <div className="space-y-3">
              <Input label="Class name" value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. 10B Mathematics" />
              <Input label="Subject" value={newSubject} onChange={e => setNewSubject(e.target.value)} placeholder="e.g. Mathematics" />
              <Input label="Grade level" value={newGrade} onChange={e => setNewGrade(e.target.value)} placeholder="e.g. Grade 10" />
              <div className="flex gap-2 pt-1">
                <Button loading={saving} onClick={createClass} disabled={!newName.trim()}>Create Class</Button>
                <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
              </div>
            </div>
          </div>
        )}

        {/* Classes list */}
        {classes.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-semibold">No classes yet</p>
            <p className="text-sm mt-1">Create your first class to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {classes.map(cls => (
              <div key={cls.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 truncate">{cls.name}</h3>
                    <p className="text-sm text-slate-500">{[cls.subject, cls.gradeLevel].filter(Boolean).join(' · ')}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {cls._count.members} students</span>
                      <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {cls._count.assignments} assignments</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400 tracking-widest">{cls.joinCode}</span>
                      <button onClick={() => copyCode(cls.joinCode)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        {copiedCode === cls.joinCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                      </button>
                    </div>
                    <Button size="sm" onClick={() => navigate(`/teacher/classes/${cls.id}`)}>View →</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
