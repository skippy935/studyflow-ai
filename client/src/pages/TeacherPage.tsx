import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap, Plus, Users, BookOpen, Copy, Check,
  BarChart2, Megaphone, Library, ChevronRight, RotateCcw,
  Trash2, Upload, Pin, Send, X, TrendingUp, AlertTriangle, Clock,
} from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Spinner from '../components/ui/Spinner';
import { apiFetch } from '../lib/api';
import toast from 'react-hot-toast';

// ── Types ────────────────────────────────────────────────────────────────────
interface TeacherClass {
  id: number; name: string; subject: string; gradeLevel: string; joinCode: string;
  isArchived: boolean; createdAt: string;
  _count: { members: number; assignments: number };
}
interface Assignment {
  id: number; classId: number; title: string; description: string;
  dueDate: string | null; maxXp: number; createdAt: string;
  _count?: { submissions: number };
}
interface Material {
  id: number; title: string; description: string; subject: string; topic: string;
  fileType: string; isDraft: boolean; tags: string; createdAt: string;
}
interface Announcement {
  id: number; classId: number | null; title: string; body: string;
  pinned: boolean; createdAt: string;
}
interface AnalyticsData {
  class: { id: number; name: string; subject: string };
  totalStudents: number; totalAssignments: number; overdue: number; activeStudents: number;
  completionRates: { id: number; title: string; submitted: number; total: number; rate: number; avgGrade: number | null }[];
  roster: { id: number; displayName: string; email: string; xp: number; streak: number; joinedAt: string; lastStudyDate: string | null; submittedCount: number }[];
}

// ── Mock data (shown until real API populates) ───────────────────────────────
const MOCK_CLASSES: TeacherClass[] = [
  { id: 1, name: '10B Mathematik', subject: 'Mathematik', gradeLevel: '10', joinCode: 'MATH3K', isArchived: false, createdAt: '2026-01-15T09:00:00Z', _count: { members: 22, assignments: 5 } },
  { id: 2, name: '9A Physik', subject: 'Physik', gradeLevel: '9', joinCode: 'PHYS7Z', isArchived: false, createdAt: '2026-02-01T09:00:00Z', _count: { members: 18, assignments: 3 } },
  { id: 3, name: '11 Chemie LK', subject: 'Chemie', gradeLevel: '11', joinCode: 'CHEM2X', isArchived: false, createdAt: '2026-03-10T09:00:00Z', _count: { members: 14, assignments: 4 } },
];
const MOCK_MATERIALS: Material[] = [
  { id: 1, title: 'Quadratische Funktionen — Einführung', description: '', subject: 'Mathematik', topic: 'Algebra', fileType: 'text', isDraft: false, tags: '["Klasse 10","Parabel"]', createdAt: '2026-03-01T10:00:00Z' },
  { id: 2, title: 'Newtonsche Gesetze — Zusammenfassung', description: '', subject: 'Physik', topic: 'Mechanik', fileType: 'pdf', isDraft: false, tags: '["Klasse 9"]', createdAt: '2026-03-10T10:00:00Z' },
  { id: 3, title: 'Organische Chemie — Reaktionstypen', description: 'Draft', subject: 'Chemie', topic: 'Organik', fileType: 'text', isDraft: true, tags: '["LK","Abitur"]', createdAt: '2026-04-01T10:00:00Z' },
  { id: 4, title: 'Ableitungsregeln Cheatsheet', description: '', subject: 'Mathematik', topic: 'Analysis', fileType: 'pdf', isDraft: false, tags: '["Klasse 11"]', createdAt: '2026-04-05T10:00:00Z' },
  { id: 5, title: 'Elektrische Felder', description: '', subject: 'Physik', topic: 'Elektrik', fileType: 'text', isDraft: false, tags: '[]', createdAt: '2026-04-10T10:00:00Z' },
];
const MOCK_ASSIGNMENTS: Assignment[] = [
  { id: 1, classId: 1, title: 'Aufgabenblatt 3: Quadratische Gleichungen', description: '', dueDate: '2026-04-20T23:59:00Z', maxXp: 20, createdAt: '2026-04-01T10:00:00Z', _count: { submissions: 18 } },
  { id: 2, classId: 1, title: 'Hausaufgabe: Scheitelpunktform', description: '', dueDate: '2026-04-16T23:59:00Z', maxXp: 10, createdAt: '2026-04-10T10:00:00Z', _count: { submissions: 12 } },
  { id: 3, classId: 2, title: 'Experiment: Reibungskräfte', description: '', dueDate: '2026-04-18T23:59:00Z', maxXp: 15, createdAt: '2026-04-05T10:00:00Z', _count: { submissions: 10 } },
  { id: 4, classId: 3, title: 'Substitutionsreaktionen Übungstest', description: '', dueDate: '2026-04-22T23:59:00Z', maxXp: 25, createdAt: '2026-04-08T10:00:00Z', _count: { submissions: 6 } },
  { id: 5, classId: 1, title: 'Klausurvorbereitung Parabelformen', description: '', dueDate: '2026-04-25T23:59:00Z', maxXp: 30, createdAt: '2026-04-12T10:00:00Z', _count: { submissions: 0 } },
];
const MOCK_ANNOUNCEMENTS: Announcement[] = [
  { id: 1, classId: 1, title: '📅 Klausur am 28. April', body: 'Die Mathematikklausur findet am 28. April statt. Thema: Quadratische Funktionen. Bringt Taschenrechner mit.', pinned: true, createdAt: '2026-04-10T08:00:00Z' },
  { id: 2, classId: null, title: '🎉 Willkommen zurück nach den Ferien', body: 'Ich freue mich, euch alle wieder zu sehen! Die neuen Aufgabenblätter werden bis Montag hochgeladen.', pinned: false, createdAt: '2026-04-08T09:00:00Z' },
];

type Tab = 'classes' | 'assignments' | 'materials' | 'announcements' | 'analytics';

export default function TeacherPage() {
  const navigate = useNavigate();
  const [tab, setTab]               = useState<Tab>('classes');
  const [teacherStatus, setStatus]  = useState<string | null>(null);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [copiedCode, setCopied]     = useState<string | null>(null);

  // Data (real or mock)
  const [classes, setClasses]           = useState<TeacherClass[]>([]);
  const [assignments, setAssignments]   = useState<Assignment[]>([]);
  const [materials, setMaterials]       = useState<Material[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [analytics, setAnalytics]       = useState<AnalyticsData | null>(null);
  const [useMock, setUseMock]           = useState(false);

  // Forms
  const [showNewClass, setShowNewClass]     = useState(false);
  const [showNewAssign, setShowNewAssign]   = useState(false);
  const [showNewMaterial, setShowNewMaterial] = useState(false);
  const [showNewAnn, setShowNewAnn]         = useState(false);

  const [newClassName, setClassName]     = useState('');
  const [newClassSubj, setClassSubj]     = useState('');
  const [newClassGrade, setClassGrade]   = useState('');
  const [newAssignClassId, setAssignCls] = useState('');
  const [newAssignTitle, setAssignTitle] = useState('');
  const [newAssignDesc, setAssignDesc]   = useState('');
  const [newAssignDue, setAssignDue]     = useState('');
  const [newAssignXp, setAssignXp]       = useState('10');
  const [newMatTitle, setMatTitle]       = useState('');
  const [newMatSubject, setMatSubject]   = useState('');
  const [newMatTopic, setMatTopic]       = useState('');
  const [newMatContent, setMatContent]   = useState('');
  const [newAnnTitle, setAnnTitle]       = useState('');
  const [newAnnBody, setAnnBody]         = useState('');
  const [newAnnClassId, setAnnCls]       = useState('');
  const [newAnnPinned, setAnnPinned]     = useState(false);

  useEffect(() => { init(); }, []);

  async function init() {
    try {
      const profile = await apiFetch<{ teacherStatus: string }>('/teacher/profile');
      const status = (profile as any).profile?.verificationStatus ?? (profile as any).teacherStatus;
      setStatus(status);

      if (status !== 'approved') { setLoading(false); return; }

      const [clsRes, matRes, annRes] = await Promise.all([
        apiFetch<{ classes: TeacherClass[] }>('/teacher/classes').catch(() => ({ classes: [] })),
        apiFetch<{ materials: Material[] }>('/teacher/materials').catch(() => ({ materials: [] })),
        apiFetch<{ announcements: Announcement[] }>('/teacher/announcements').catch(() => ({ announcements: [] })),
      ]);

      const loadedClasses = clsRes.classes;
      setClasses(loadedClasses);
      setMaterials(matRes.materials);
      setAnnouncements(annRes.announcements);

      // Seed mock if no real data yet
      if (loadedClasses.length === 0) {
        setUseMock(true);
        setClasses(MOCK_CLASSES);
        setMaterials(MOCK_MATERIALS);
        setAssignments(MOCK_ASSIGNMENTS);
        setAnnouncements(MOCK_ANNOUNCEMENTS);
      }
    } catch {
      setUseMock(true);
      setClasses(MOCK_CLASSES);
      setMaterials(MOCK_MATERIALS);
      setAssignments(MOCK_ASSIGNMENTS);
      setAnnouncements(MOCK_ANNOUNCEMENTS);
    } finally { setLoading(false); }
  }

  async function loadAnalytics(classId: number) {
    try {
      const data = await apiFetch<AnalyticsData>(`/teacher/analytics/${classId}`);
      setAnalytics(data);
    } catch { toast.error('Analytics failed to load'); }
  }

  async function createClass() {
    if (!newClassName.trim()) return;
    setSaving(true);
    try {
      if (useMock) {
        const mockCls: TeacherClass = { id: Date.now(), name: newClassName, subject: newClassSubj, gradeLevel: newClassGrade, joinCode: Math.random().toString(36).substring(2,8).toUpperCase(), isArchived: false, createdAt: new Date().toISOString(), _count: { members: 0, assignments: 0 } };
        setClasses(prev => [mockCls, ...prev]);
      } else {
        const d = await apiFetch<{ class: TeacherClass }>('/teacher/classes', { method: 'POST', body: JSON.stringify({ name: newClassName, subject: newClassSubj, gradeLevel: newClassGrade }) });
        setClasses(prev => [d.class, ...prev]);
      }
      setShowNewClass(false); setClassName(''); setClassSubj(''); setClassGrade('');
      toast.success('Klasse erstellt!');
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : 'Failed'); }
    finally { setSaving(false); }
  }

  async function createAssignment() {
    if (!newAssignTitle.trim() || !newAssignClassId) return;
    setSaving(true);
    try {
      if (useMock) {
        const a: Assignment = { id: Date.now(), classId: parseInt(newAssignClassId), title: newAssignTitle, description: newAssignDesc, dueDate: newAssignDue || null, maxXp: parseInt(newAssignXp)||10, createdAt: new Date().toISOString(), _count: { submissions: 0 } };
        setAssignments(prev => [a, ...prev]);
      } else {
        const d = await apiFetch<{ assignment: Assignment }>('/teacher/assignments', { method: 'POST', body: JSON.stringify({ classId: parseInt(newAssignClassId), title: newAssignTitle, description: newAssignDesc, dueDate: newAssignDue || undefined, maxXp: parseInt(newAssignXp)||10 }) });
        setAssignments(prev => [d.assignment, ...prev]);
      }
      setShowNewAssign(false); setAssignTitle(''); setAssignDesc(''); setAssignDue(''); setAssignXp('10');
      toast.success('Aufgabe erstellt!');
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : 'Failed'); }
    finally { setSaving(false); }
  }

  async function createMaterial() {
    if (!newMatTitle.trim()) return;
    setSaving(true);
    try {
      if (useMock) {
        const m: Material = { id: Date.now(), title: newMatTitle, description: '', subject: newMatSubject, topic: newMatTopic, fileType: 'text', isDraft: true, tags: '[]', createdAt: new Date().toISOString() };
        setMaterials(prev => [m, ...prev]);
      } else {
        const d = await apiFetch<{ material: Material }>('/teacher/materials', { method: 'POST', body: JSON.stringify({ title: newMatTitle, subject: newMatSubject, topic: newMatTopic, content: newMatContent, isDraft: true }) });
        setMaterials(prev => [d.material, ...prev]);
      }
      setShowNewMaterial(false); setMatTitle(''); setMatSubject(''); setMatTopic(''); setMatContent('');
      toast.success('Material gespeichert (Entwurf)');
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : 'Failed'); }
    finally { setSaving(false); }
  }

  async function createAnnouncement() {
    if (!newAnnTitle.trim() || !newAnnBody.trim()) return;
    setSaving(true);
    try {
      if (useMock) {
        const a: Announcement = { id: Date.now(), classId: newAnnClassId ? parseInt(newAnnClassId) : null, title: newAnnTitle, body: newAnnBody, pinned: newAnnPinned, createdAt: new Date().toISOString() };
        setAnnouncements(prev => [a, ...prev]);
      } else {
        const d = await apiFetch<{ announcement: Announcement }>('/teacher/announcements', { method: 'POST', body: JSON.stringify({ classId: newAnnClassId ? parseInt(newAnnClassId) : null, title: newAnnTitle, body: newAnnBody, pinned: newAnnPinned }) });
        setAnnouncements(prev => [d.announcement, ...prev]);
      }
      setShowNewAnn(false); setAnnTitle(''); setAnnBody(''); setAnnCls(''); setAnnPinned(false);
      toast.success('Ankündigung veröffentlicht!');
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : 'Failed'); }
    finally { setSaving(false); }
  }

  async function rotateCode(id: number) {
    if (useMock) { toast('Mock-Modus — Code-Rotation simuliert'); return; }
    try {
      const d = await apiFetch<{ joinCode: string }>(`/teacher/classes/${id}/rotate-code`, { method: 'PATCH' });
      setClasses(prev => prev.map(c => c.id === id ? { ...c, joinCode: d.joinCode } : c));
      toast.success('Neuer Code generiert');
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : 'Failed'); }
  }

  async function deleteAnn(id: number) {
    if (useMock) { setAnnouncements(prev => prev.filter(a => a.id !== id)); toast('Gelöscht'); return; }
    try {
      await apiFetch(`/teacher/announcements/${id}`, { method: 'DELETE' });
      setAnnouncements(prev => prev.filter(a => a.id !== id));
    } catch {}
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code).then(() => { setCopied(code); setTimeout(() => setCopied(null), 2000); });
  }

  function relDate(d: string) {
    const diff = Date.now() - new Date(d).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Heute';
    if (days === 1) return 'Gestern';
    return `vor ${days} Tagen`;
  }

  function isDue(d: string | null) {
    if (!d) return false;
    return new Date(d) < new Date();
  }

  if (loading) return <AppLayout><div className="flex justify-center py-20"><Spinner size="lg" /></div></AppLayout>;

  // Not a teacher / not onboarded
  if (!teacherStatus || teacherStatus === 'pending') {
    return (
      <AppLayout>
        <div className="max-w-md mx-auto text-center py-16">
          <GraduationCap className="w-14 h-14 text-indigo-600 mx-auto mb-4" />
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mb-2">Lehrer-Konto einrichten</h1>
          <p className="text-slate-500 text-sm mb-6">Vervollständige dein Profil, um Klassen zu erstellen und Schüler zu verwalten.</p>
          <Button size="lg" className="w-full justify-center" onClick={() => navigate('/teacher/onboarding')}>
            Profil vervollständigen →
          </Button>
        </div>
      </AppLayout>
    );
  }

  // Pending approval
  if (teacherStatus === 'pending_approval') {
    return (
      <AppLayout>
        <div className="max-w-md mx-auto text-center py-16">
          <div className="w-16 h-16 bg-amber-100 dark:bg-amber-950 rounded-full flex items-center justify-center mx-auto mb-5">
            <Clock className="w-8 h-8 text-amber-500" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mb-2">
            Waiting for admin approval
          </h1>
          <p className="text-slate-500 text-sm mb-4">
            Your teacher profile has been submitted. An admin will review and approve your account shortly.
          </p>
          <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 mb-6 text-left space-y-2 text-sm text-slate-500">
            <div className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Profile submitted</div>
            <div className="flex items-center gap-2"><span className="text-amber-400 animate-pulse">⏳</span> Waiting for admin approval</div>
            <div className="flex items-center gap-2 opacity-40"><span>🔒</span> Dashboard access</div>
          </div>
          <Button variant="ghost" size="lg" onClick={() => { init(); toast.success('Checking status...'); }}>
            Check status
          </Button>
        </div>
      </AppLayout>
    );
  }

  // Rejected
  if (teacherStatus === 'rejected') {
    return (
      <AppLayout>
        <div className="max-w-md mx-auto text-center py-16">
          <p className="text-red-500 font-semibold">Dein Lehrer-Konto wurde nicht genehmigt.</p>
        </div>
      </AppLayout>
    );
  }

  // APPROVED — full dashboard
  const TAB_CONFIG: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'classes',       label: 'Klassen',       icon: Users },
    { id: 'assignments',   label: 'Aufgaben',       icon: BookOpen },
    { id: 'materials',     label: 'Materialien',    icon: Library },
    { id: 'announcements', label: 'Ankündigungen',  icon: Megaphone },
    { id: 'analytics',     label: 'Analytics',      icon: BarChart2 },
  ];

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-violet-600" /> Lehrer-Dashboard
            </h1>
            <p className="text-sm text-slate-500">{classes.length} Klassen · {materials.length} Materialien</p>
          </div>
          {useMock && (
            <span className="text-xs bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 rounded-full px-3 py-1 font-semibold">
              Demo-Daten
            </span>
          )}
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 mb-6 overflow-x-auto scrollbar-hide border-b border-slate-200 dark:border-slate-800 pb-0">
          {TAB_CONFIG.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold transition-all whitespace-nowrap border-b-2 -mb-px ${
                  tab === t.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                <Icon className="w-4 h-4" />{t.label}
              </button>
            );
          })}
        </div>

        {/* ── CLASSES ─────────────────────────────────────────────────────── */}
        {tab === 'classes' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-900 dark:text-slate-100">Meine Klassen</h2>
              <Button size="sm" onClick={() => setShowNewClass(true)}><Plus className="w-4 h-4" /> Neue Klasse</Button>
            </div>

            {showNewClass && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 mb-4">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4">Neue Klasse erstellen</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Input label="Klassenname *" value={newClassName} onChange={e => setClassName(e.target.value)} placeholder="z.B. 10B Mathematik" />
                  <Input label="Fach" value={newClassSubj} onChange={e => setClassSubj(e.target.value)} placeholder="z.B. Mathematik" />
                  <Input label="Klasse/Stufe" value={newClassGrade} onChange={e => setClassGrade(e.target.value)} placeholder="z.B. 10" />
                </div>
                <div className="flex gap-2 mt-4">
                  <Button loading={saving} onClick={createClass} disabled={!newClassName.trim()}>Erstellen</Button>
                  <Button variant="ghost" onClick={() => setShowNewClass(false)}>Abbrechen</Button>
                </div>
              </div>
            )}

            {classes.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-semibold">Noch keine Klassen</p>
              </div>
            ) : (
              <div className="space-y-3">
                {classes.map(cls => (
                  <div key={cls.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-slate-100 truncate">{cls.name}</h3>
                        <p className="text-sm text-slate-500">{[cls.subject, cls.gradeLevel && `Klasse ${cls.gradeLevel}`].filter(Boolean).join(' · ')}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {cls._count.members} Schüler</span>
                          <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {cls._count.assignments} Aufgaben</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="flex items-center gap-1.5 mb-2">
                          <span className="font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400 tracking-widest">{cls.joinCode}</span>
                          <button onClick={() => copyCode(cls.joinCode)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                            {copiedCode === cls.joinCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                          </button>
                          <button onClick={() => rotateCode(cls.id)} title="Neuen Code generieren" className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                          </button>
                        </div>
                        <Button size="sm" onClick={() => navigate(`/teacher/classes/${cls.id}`)}>
                          Öffnen <ChevronRight className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── ASSIGNMENTS ──────────────────────────────────────────────────── */}
        {tab === 'assignments' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-900 dark:text-slate-100">Aufgaben</h2>
              <Button size="sm" onClick={() => setShowNewAssign(true)}><Plus className="w-4 h-4" /> Neue Aufgabe</Button>
            </div>

            {showNewAssign && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 mb-4">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4">Neue Aufgabe erstellen</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Klasse *</label>
                    <select value={newAssignClassId} onChange={e => setAssignCls(e.target.value)} className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      <option value="">Klasse wählen...</option>
                      {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <Input label="Titel *" value={newAssignTitle} onChange={e => setAssignTitle(e.target.value)} placeholder="z.B. Aufgabenblatt 4" />
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="Fällig am" type="datetime-local" value={newAssignDue} onChange={e => setAssignDue(e.target.value)} />
                    <Input label="Max. XP" type="number" value={newAssignXp} onChange={e => setAssignXp(e.target.value)} />
                  </div>
                  <div className="flex gap-2">
                    <Button loading={saving} onClick={createAssignment} disabled={!newAssignTitle.trim() || !newAssignClassId}>Erstellen</Button>
                    <Button variant="ghost" onClick={() => setShowNewAssign(false)}>Abbrechen</Button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {assignments.map(a => {
                const cls = classes.find(c => c.id === a.classId);
                const overdue = isDue(a.dueDate);
                return (
                  <div key={a.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-slate-900 dark:text-slate-100">{a.title}</h3>
                          {overdue && <span className="flex items-center gap-1 text-xs bg-red-50 dark:bg-red-950 text-red-500 px-2 py-0.5 rounded-full"><AlertTriangle className="w-3 h-3" /> Überfällig</span>}
                        </div>
                        <p className="text-xs text-slate-400">
                          {cls?.name} · {a.dueDate ? `Fällig: ${new Date(a.dueDate).toLocaleDateString('de-DE')}` : 'Kein Fälligkeitsdatum'} · {a.maxXp} XP
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                          {a._count?.submissions ?? 0}
                        </div>
                        <div className="text-xs text-slate-400">Abgaben</div>
                        <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-1.5">
                          <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(100, ((a._count?.submissions ?? 0) / Math.max(1, cls?._count?.members ?? 1)) * 100)}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── MATERIALS ────────────────────────────────────────────────────── */}
        {tab === 'materials' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-900 dark:text-slate-100">Material-Bibliothek</h2>
              <Button size="sm" onClick={() => setShowNewMaterial(true)}><Upload className="w-4 h-4" /> Material hinzufügen</Button>
            </div>

            {showNewMaterial && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 mb-4">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4">Neues Material</h3>
                <div className="space-y-3">
                  <Input label="Titel *" value={newMatTitle} onChange={e => setMatTitle(e.target.value)} placeholder="Titel des Materials" />
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="Fach" value={newMatSubject} onChange={e => setMatSubject(e.target.value)} placeholder="z.B. Mathematik" />
                    <Input label="Thema" value={newMatTopic} onChange={e => setMatTopic(e.target.value)} placeholder="z.B. Algebra" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Inhalt</label>
                    <textarea value={newMatContent} onChange={e => setMatContent(e.target.value)} placeholder="Text des Materials..." rows={4} className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <p className="text-xs text-slate-400">Wird als Entwurf gespeichert — du kannst es später veröffentlichen.</p>
                  <div className="flex gap-2">
                    <Button loading={saving} onClick={createMaterial} disabled={!newMatTitle.trim()}>Speichern</Button>
                    <Button variant="ghost" onClick={() => setShowNewMaterial(false)}>Abbrechen</Button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {materials.map(m => {
                const tags: string[] = (() => { try { return JSON.parse(m.tags); } catch { return []; } })();
                return (
                  <div key={m.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{m.fileType === 'pdf' ? '📄' : m.fileType === 'image' ? '🖼️' : '📝'}</span>
                          <h3 className="font-bold text-slate-900 dark:text-slate-100">{m.title}</h3>
                          {m.isDraft && <span className="text-xs bg-amber-50 dark:bg-amber-950 text-amber-600 px-2 py-0.5 rounded-full">Entwurf</span>}
                        </div>
                        <p className="text-xs text-slate-400 mb-2">
                          {[m.subject, m.topic].filter(Boolean).join(' › ')} · {relDate(m.createdAt)}
                        </p>
                        {tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {tags.map((t, i) => <span key={i} className="text-xs bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full">{t}</span>)}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1.5 flex-shrink-0">
                        <button className="p-1.5 text-xs text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded-lg transition-colors font-semibold">
                          Wiederverwenden
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── ANNOUNCEMENTS ────────────────────────────────────────────────── */}
        {tab === 'announcements' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-900 dark:text-slate-100">Ankündigungen</h2>
              <Button size="sm" onClick={() => setShowNewAnn(true)}><Send className="w-4 h-4" /> Ankündigung</Button>
            </div>

            {showNewAnn && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 mb-4">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4">Neue Ankündigung</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">An Klasse (optional)</label>
                    <select value={newAnnClassId} onChange={e => setAnnCls(e.target.value)} className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      <option value="">Alle Klassen</option>
                      {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <Input label="Betreff *" value={newAnnTitle} onChange={e => setAnnTitle(e.target.value)} placeholder="z.B. Klausur am Montag" />
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Nachricht *</label>
                    <textarea value={newAnnBody} onChange={e => setAnnBody(e.target.value)} placeholder="Schreibe deine Ankündigung..." rows={4} className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={newAnnPinned} onChange={e => setAnnPinned(e.target.checked)} className="rounded" />
                    <span className="text-slate-700 dark:text-slate-300">Ankündigung anheften</span>
                  </label>
                  <div className="flex gap-2">
                    <Button loading={saving} onClick={createAnnouncement} disabled={!newAnnTitle.trim() || !newAnnBody.trim()}>
                      <Send className="w-4 h-4" /> Senden
                    </Button>
                    <Button variant="ghost" onClick={() => setShowNewAnn(false)}>Abbrechen</Button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {announcements.map(a => {
                const cls = classes.find(c => c.id === a.classId);
                return (
                  <div key={a.id} className={`bg-white dark:bg-slate-900 rounded-2xl border p-5 ${a.pinned ? 'border-indigo-200 dark:border-indigo-800' : 'border-slate-100 dark:border-slate-800'}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {a.pinned && <Pin className="w-3.5 h-3.5 text-indigo-500" />}
                          <h3 className="font-bold text-slate-900 dark:text-slate-100">{a.title}</h3>
                        </div>
                        <p className="text-xs text-slate-400 mb-2">
                          {cls ? cls.name : 'Alle Klassen'} · {relDate(a.createdAt)}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{a.body}</p>
                      </div>
                      <button onClick={() => deleteAnn(a.id)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-red-500 transition-colors flex-shrink-0">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── ANALYTICS ────────────────────────────────────────────────────── */}
        {tab === 'analytics' && (
          <div>
            <h2 className="font-bold text-slate-900 dark:text-slate-100 mb-4">Fortschritt & Analytics</h2>

            {!analytics && (
              <div className="space-y-2 mb-6">
                <p className="text-sm text-slate-500 mb-3">Klasse für Analytics auswählen:</p>
                {classes.map(c => (
                  <button key={c.id} onClick={() => useMock ? setAnalytics({
                    class: { id: c.id, name: c.name, subject: c.subject },
                    totalStudents: c._count.members, totalAssignments: c._count.assignments,
                    overdue: 1, activeStudents: Math.floor(c._count.members * 0.7),
                    completionRates: assignments.filter(a => a.classId === c.id).map(a => ({
                      id: a.id, title: a.title, submitted: a._count?.submissions ?? 0,
                      total: c._count.members, rate: Math.round(((a._count?.submissions ?? 0) / Math.max(1, c._count.members)) * 100), avgGrade: 78,
                    })),
                    roster: Array.from({ length: Math.min(8, c._count.members) }, (_, i) => ({
                      id: i + 1, displayName: `Schüler ${i + 1}`, email: `student${i+1}@school.de`,
                      xp: Math.floor(Math.random() * 3000), streak: Math.floor(Math.random() * 20),
                      joinedAt: c.createdAt, lastStudyDate: new Date(Date.now() - Math.random() * 7 * 86400000).toISOString(),
                      submittedCount: Math.floor(Math.random() * c._count.assignments),
                    })),
                  }) : loadAnalytics(c.id)}
                    className="w-full flex items-center justify-between bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 hover:border-indigo-400 transition-colors text-left">
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-slate-100">{c.name}</div>
                      <div className="text-xs text-slate-400">{c._count.members} Schüler · {c._count.assignments} Aufgaben</div>
                    </div>
                    <TrendingUp className="w-5 h-5 text-indigo-500" />
                  </button>
                ))}
              </div>
            )}

            {analytics && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-900 dark:text-slate-100">{analytics.class.name}</h3>
                  <button onClick={() => setAnalytics(null)} className="text-xs text-slate-400 hover:text-slate-600">← Zurück</button>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  {[
                    { label: 'Schüler', value: analytics.totalStudents, color: 'text-indigo-600' },
                    { label: 'Aktiv (7d)', value: analytics.activeStudents, color: 'text-emerald-600' },
                    { label: 'Aufgaben', value: analytics.totalAssignments, color: 'text-violet-600' },
                    { label: 'Überfällig', value: analytics.overdue, color: 'text-red-500' },
                  ].map(s => (
                    <div key={s.label} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 text-center">
                      <div className={`text-2xl font-extrabold ${s.color}`}>{s.value}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Assignment completion */}
                {analytics.completionRates.length > 0 && (
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 mb-4">
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Abgabequoten</h4>
                    <div className="space-y-3">
                      {analytics.completionRates.map(r => (
                        <div key={r.id}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-700 dark:text-slate-300 truncate flex-1">{r.title}</span>
                            <span className="font-semibold text-slate-900 dark:text-slate-100 ml-2">{r.rate}%</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full">
                            <div className={`h-full rounded-full ${r.rate >= 70 ? 'bg-emerald-500' : r.rate >= 40 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${r.rate}%` }} />
                          </div>
                          <div className="flex justify-between text-xs text-slate-400 mt-0.5">
                            <span>{r.submitted}/{r.total} abgegeben</span>
                            {r.avgGrade != null && <span>Ø {r.avgGrade}%</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Roster */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5">
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Schülerliste</h4>
                  <div className="space-y-2">
                    {analytics.roster.map(s => (
                      <div key={s.id} className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800 last:border-0">
                        <div>
                          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{s.displayName}</div>
                          <div className="text-xs text-slate-400">{s.email} · {s.submittedCount}/{analytics.totalAssignments} Aufgaben</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-semibold text-indigo-600">{s.xp} XP</div>
                          <div className="text-xs text-slate-400">{s.streak}d Streak</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </AppLayout>
  );
}
