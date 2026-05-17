import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';
import Input  from '../components/ui/Input';
import { apiFetch } from '../lib/api';

const BUNDESLAENDER = [
  'Baden-Württemberg','Bayern','Berlin','Brandenburg','Bremen',
  'Hamburg','Hessen','Mecklenburg-Vorpommern','Niedersachsen',
  'Nordrhein-Westfalen','Rheinland-Pfalz','Saarland','Sachsen',
  'Sachsen-Anhalt','Schleswig-Holstein','Thüringen',
  // Austria
  'Wien (AT)','Niederösterreich (AT)','Oberösterreich (AT)','Steiermark (AT)',
  'Tirol (AT)','Kärnten (AT)','Salzburg (AT)','Vorarlberg (AT)','Burgenland (AT)',
  // Switzerland
  'Zürich (CH)','Bern (CH)','Luzern (CH)','Basel-Stadt (CH)','Genf (CH)',
];

const SUBJECTS = [
  'Mathematik','Deutsch','Englisch','Französisch','Latein','Spanisch','Russisch',
  'Physik','Chemie','Biologie','Informatik','Geographie','Geschichte','Politik',
  'Wirtschaft','Musik','Kunst','Sport','Religion/Ethik','Philosophie','Sozialkunde',
];

export default function TeacherOnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep]               = useState(0);
  const [schoolName, setSchoolName]   = useState('');
  const [bundesland, setBundesland]   = useState('');
  const [subjects, setSubjects]       = useState<string[]>([]);
  const [loading, setLoading]         = useState(false);
  const [done, setDone]               = useState(false);

  function toggleSubject(s: string) {
    setSubjects(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  }

  async function submit() {
    if (!schoolName.trim() || !bundesland || subjects.length === 0) {
      toast.error('Please fill in all fields'); return;
    }
    setLoading(true);
    try {
      const data = await apiFetch<{ teacherStatus: string }>('/teacher/onboarding', {
        method: 'POST',
        body: JSON.stringify({ schoolName, bundesland, subjects }),
      });
      if ((data as any).teacherStatus === 'approved') {
        navigate('/teacher');
        return;
      }
      setDone(true);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full text-center">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 p-10">
            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-950 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-8 h-8 text-amber-500" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mb-2">
              Profile submitted! ✅
            </h1>
            <p className="text-slate-500 text-sm mb-4">
              Your teacher profile is complete. An admin will review and approve your account.
            </p>
            <p className="text-xs text-slate-400 mb-8 bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
              ⏱ You'll get access as soon as an admin approves your account.
            </p>
            <Button size="lg" className="w-full" onClick={() => navigate('/teacher')}>
              View status →
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 p-8">

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-violet-100 dark:bg-violet-950 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <div className="font-extrabold text-slate-900 dark:text-slate-100">Lehrer-Profil</div>
              <div className="text-xs text-slate-500">Schritt {step + 1} von 2</div>
            </div>
          </div>

          {/* Progress */}
          <div className="flex gap-2 mb-6">
            {[0, 1].map(i => (
              <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= step ? 'bg-violet-600' : 'bg-slate-200 dark:bg-slate-700'}`} />
            ))}
          </div>

          <AnimatePresence mode="wait">

            {/* Step 0: School + state */}
            {step === 0 && (
              <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mb-1">Deine Schule</h2>
                <p className="text-sm text-slate-500 mb-6">Diese Informationen helfen uns, dein Konto zu verifizieren.</p>

                <div className="space-y-4">
                  <Input
                    label="Name der Schule *"
                    value={schoolName}
                    onChange={e => setSchoolName(e.target.value)}
                    placeholder="z.B. Goethe-Gymnasium Berlin"
                    required
                  />

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Bundesland / Kanton *
                    </label>
                    <select
                      value={bundesland}
                      onChange={e => setBundesland(e.target.value)}
                      className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    >
                      <option value="">Bitte wählen...</option>
                      <optgroup label="Deutschland">
                        {BUNDESLAENDER.filter(b => !b.includes('(AT)') && !b.includes('(CH)')).map(b => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Österreich">
                        {BUNDESLAENDER.filter(b => b.includes('(AT)')).map(b => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Schweiz">
                        {BUNDESLAENDER.filter(b => b.includes('(CH)')).map(b => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </optgroup>
                    </select>
                  </div>

                  <Button
                    size="lg" className="w-full"
                    onClick={() => setStep(1)}
                    disabled={!schoolName.trim() || !bundesland}
                  >
                    Weiter →
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 1: Subjects */}
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mb-1">Unterrichtete Fächer</h2>
                <p className="text-sm text-slate-500 mb-5">Wähle alle Fächer aus, die du unterrichtest.</p>

                <div className="flex flex-wrap gap-2 mb-6 max-h-64 overflow-y-auto pr-1">
                  {SUBJECTS.map(s => (
                    <button
                      key={s}
                      onClick={() => toggleSubject(s)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                        subjects.includes(s)
                          ? 'bg-violet-600 text-white border-violet-600'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-violet-400'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                {subjects.length > 0 && (
                  <p className="text-xs text-violet-600 font-semibold mb-4">
                    {subjects.length} Fach{subjects.length !== 1 ? 'er' : ''} ausgewählt
                  </p>
                )}

                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => setStep(0)} className="flex-shrink-0">
                    ← Zurück
                  </Button>
                  <Button
                    size="lg" loading={loading} className="flex-1"
                    onClick={submit}
                    disabled={subjects.length === 0}
                  >
                    Profil einreichen ✓
                  </Button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
