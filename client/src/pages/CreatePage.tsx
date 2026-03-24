import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layers, HelpCircle, FileText, Upload, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import AppLayout from '../components/layout/AppLayout';
import Button    from '../components/ui/Button';
import Input     from '../components/ui/Input';
import { apiFetch, uploadFile } from '../lib/api';
import { useTranslation } from '../i18n';
import type { Deck, Quiz, Summary, Card, QuizQuestion } from '../types';

type Mode   = 'flashcards' | 'quiz' | 'summary';
const COLORS = ['#4F46E5','#7C3AED','#EC4899','#EF4444','#F59E0B','#10B981','#06B6D4','#64748B'];

export default function CreatePage() {
  const { t, lang, setLang } = useTranslation();
  const navigate = useNavigate();
  const [mode, setMode]         = useState<Mode>('flashcards');
  const [title, setTitle]       = useState('');
  const [desc, setDesc]         = useState('');
  const [notes, setNotes]       = useState('');
  const [color, setColor]       = useState(COLORS[0]);
  const [loading, setLoading]   = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError]       = useState('');
  const [preview, setPreview]   = useState<{ label: string; id: number; type: Mode } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const modes: { key: Mode; icon: typeof Layers; label: string }[] = [
    { key: 'flashcards', icon: Layers,     label: t.create.mode.flashcards },
    { key: 'quiz',       icon: HelpCircle, label: t.create.mode.quiz       },
    { key: 'summary',    icon: FileText,   label: t.create.mode.summary    },
  ];

  async function handleFileUpload(file: File) {
    setUploading(true);
    try {
      const result = await uploadFile(file);
      if (result.text) setNotes(prev => prev ? `${prev}\n\n${result.text}` : result.text);
      toast.success(`${file.name} uploaded`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function handleGenerate() {
    if (!title.trim())         { setError(`Please enter a ${mode === 'flashcards' ? 'deck' : 'topic'} name.`); return; }
    if (notes.trim().length < 20) { setError('Please provide at least a few sentences of notes.'); return; }
    setError('');
    setLoading(true);

    try {
      if (mode === 'flashcards') {
        const { deck, cards } = await apiFetch<{ deck: Deck; cards: Card[] }>('/ai/generate', {
          method: 'POST', body: JSON.stringify({ name: title, description: desc, color, notes, language: lang })
        });
        toast.success(`${cards.length} flashcards generated!`);
        setPreview({ label: `${cards.length} flashcards created`, id: deck.id, type: 'flashcards' });
      } else if (mode === 'quiz') {
        const { quiz, questions } = await apiFetch<{ quiz: Quiz; questions: QuizQuestion[] }>('/ai/quiz-create', {
          method: 'POST', body: JSON.stringify({ title, topic: title, notes, language: lang })
        });
        toast.success(`${questions.length} questions generated!`);
        setPreview({ label: `${questions.length} questions created`, id: quiz.id, type: 'quiz' });
      } else {
        const { summary } = await apiFetch<{ summary: Summary }>('/ai/summary-create', {
          method: 'POST', body: JSON.stringify({ title, topic: title, notes, language: lang })
        });
        toast.success('Summary generated!');
        setPreview({ label: 'Summary created', id: summary.id, type: 'summary' });
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setLoading(false);
    }
  }

  function openResult() {
    if (!preview) return;
    if (preview.type === 'flashcards') navigate(`/deck/${preview.id}`);
    else if (preview.type === 'quiz')  navigate(`/quiz/${preview.id}`);
    else                               navigate(`/summary/${preview.id}`);
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mb-6">{t.create.title}</h1>

        {/* Mode selector */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {modes.map(({ key, icon: Icon, label }) => (
            <button key={key} onClick={() => { setMode(key); setPreview(null); }}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${mode === key ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-600' : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300'}`}>
              <Icon className="w-5 h-5" />
              <span className="text-sm font-semibold">{label}</span>
            </button>
          ))}
        </div>

        <div className="space-y-5">
          {/* Title */}
          <Input label={mode === 'flashcards' ? t.create.deckName : t.create.topic}
            value={title} onChange={e => setTitle(e.target.value)}
            placeholder={mode === 'flashcards' ? t.create.deckNamePlaceholder : t.create.topicPlaceholder} />

          {/* Description (flashcards only) */}
          {mode === 'flashcards' && (
            <Input label={t.create.description} value={desc} onChange={e => setDesc(e.target.value)} placeholder={t.create.descPlaceholder} />
          )}

          {/* Colour picker (flashcards only) */}
          {mode === 'flashcards' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t.create.color}</label>
              <div className="flex gap-2">
                {COLORS.map(c => (
                  <button key={c} onClick={() => setColor(c)}
                    className={`w-7 h-7 rounded-full transition-transform hover:scale-110 ${color === c ? 'ring-2 ring-offset-2 ring-indigo-600 scale-110' : ''}`}
                    style={{ background: c }} />
                ))}
              </div>
            </div>
          )}

          {/* Language */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t.create.language}</label>
            <div className="flex gap-2">
              {(['en','de'] as const).map(l => (
                <button key={l} onClick={() => setLang(l)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${lang === l ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-600' : 'border-slate-200 dark:border-slate-700 text-slate-500'}`}>
                  {l === 'en' ? t.create.en : t.create.de}
                </button>
              ))}
            </div>
          </div>

          {/* File upload */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t.create.upload}</label>
            <div
              onClick={() => fileRef.current?.click()}
              onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFileUpload(f); }}
              onDragOver={e => e.preventDefault()}
              className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-center cursor-pointer hover:border-indigo-400 transition-colors"
            >
              <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-500">{uploading ? 'Uploading…' : t.create.uploadHint}</p>
              <input ref={fileRef} type="file" className="hidden" accept=".pdf,.txt,.jpg,.jpeg,.png,.webp"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }} />
            </div>
          </div>

          {/* Notes textarea */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t.create.notes}</label>
            <textarea
              value={notes} onChange={e => setNotes(e.target.value)}
              rows={8} placeholder={t.create.notesPlaceholder}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button onClick={handleGenerate} loading={loading} size="lg" className="w-full justify-center">
            <Zap className="w-4 h-4" /> {loading ? t.create.generating : t.create.generate}
          </Button>
        </div>

        {/* Preview */}
        {preview && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-5 bg-emerald-50 dark:bg-emerald-950 rounded-2xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
            <p className="font-semibold text-emerald-800 dark:text-emerald-200">✅ {preview.label}</p>
            <Button size="sm" onClick={openResult}>{t.create.actionBtn} →</Button>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}
