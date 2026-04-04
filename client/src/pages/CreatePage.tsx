import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, HelpCircle, FileText, Upload, Zap, Link, CheckCircle, AlertCircle, PenLine } from 'lucide-react';
import toast from 'react-hot-toast';
import AppLayout from '../components/layout/AppLayout';
import Button    from '../components/ui/Button';
import Input     from '../components/ui/Input';
import { apiFetch, extractFile } from '../lib/api';
import type { ExtractResult } from '../lib/api';
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
  const [extracted, setExtracted] = useState<ExtractResult | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [ytUrl, setYtUrl]       = useState('');
  const [ytLoading, setYtLoading] = useState(false);
  const [examDate, setExamDate] = useState('');
  const [error, setError]       = useState('');
  const [preview, setPreview]   = useState<{ label: string; id: number; type: Mode } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const modes: { key: Mode; icon: typeof Layers; label: string }[] = [
    { key: 'flashcards', icon: Layers,     label: t.create.mode.flashcards },
    { key: 'quiz',       icon: HelpCircle, label: t.create.mode.quiz       },
    { key: 'summary',    icon: FileText,   label: t.create.mode.summary    },
  ];

  async function handleYouTube() {
    if (!ytUrl.trim()) return;
    setYtLoading(true);
    try {
      const result = await apiFetch<{ text: string }>('/upload/youtube', {
        method: 'POST', body: JSON.stringify({ url: ytUrl })
      });
      if (result.text) setNotes(prev => prev ? `${prev}\n\n${result.text}` : result.text);
      toast.success('YouTube transcript imported!');
      setYtUrl('');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to fetch transcript');
    } finally {
      setYtLoading(false);
    }
  }

  async function handleFileUpload(file: File) {
    setUploading(true);
    setExtracted(null);
    setExtractedText('');
    try {
      const result = await extractFile(file);
      setExtracted(result);
      setExtractedText(result.text);
      toast.success(`${file.name} extracted — ${result.wordCount} words`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  function confirmExtract() {
    if (!extractedText.trim()) return;
    setNotes(prev => prev ? `${prev}\n\n${extractedText}` : extractedText);
    setExtracted(null);
    setExtractedText('');
    toast.success('Text added to notes');
  }

  async function handleGenerate() {
    if (!title.trim())         { setError(`Please enter a ${mode === 'flashcards' ? 'deck' : 'topic'} name.`); return; }
    if (notes.trim().length < 20) { setError('Please provide at least a few sentences of notes.'); return; }
    setError('');
    setLoading(true);

    try {
      if (mode === 'flashcards') {
        const { deck, cards } = await apiFetch<{ deck: Deck; cards: Card[] }>('/ai/generate', {
          method: 'POST', body: JSON.stringify({ name: title, description: desc, color, notes, language: lang, examDate: examDate || null })
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
              onClick={() => !uploading && fileRef.current?.click()}
              onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFileUpload(f); }}
              onDragOver={e => e.preventDefault()}
              className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-center cursor-pointer hover:border-indigo-400 transition-colors"
            >
              <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-500">
                {uploading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin inline-block" />
                    {extracted?.isHandwriting ? 'Reading handwritten notes…' : 'Extracting text…'}
                  </span>
                ) : t.create.uploadHint}
              </p>
              <p className="text-xs text-slate-400 mt-1">PDF, DOCX, TXT, JPG, PNG, WEBP · max 50 MB</p>
              <input ref={fileRef} type="file" className="hidden" accept=".pdf,.docx,.doc,.txt,.md,.jpg,.jpeg,.png,.webp"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }} />
            </div>

            {/* Extraction preview */}
            {extracted && (
              <AnimatePresence>
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  className="mt-3 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                  {/* Meta bar */}
                  <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 text-xs">
                    <PenLine className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="font-semibold text-slate-600 dark:text-slate-300 truncate">{extracted.fileName}</span>
                    <span className="text-slate-400">{extracted.wordCount} words{extracted.pageCount ? ` · ${extracted.pageCount}p` : ''}</span>
                    {extracted.isHandwriting && <span className="text-amber-600 font-medium">Handwritten</span>}
                    <span className={`ml-auto font-bold flex items-center gap-1 ${extracted.confidence >= 85 ? 'text-emerald-600' : extracted.confidence >= 60 ? 'text-amber-600' : 'text-red-500'}`}>
                      {extracted.confidence >= 85
                        ? <CheckCircle className="w-3.5 h-3.5" />
                        : <AlertCircle className="w-3.5 h-3.5" />
                      }
                      {extracted.confidence}% readable
                    </span>
                  </div>
                  {/* Editable text */}
                  <textarea
                    value={extractedText}
                    onChange={e => setExtractedText(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-3 text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 font-mono resize-y focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-400"
                    placeholder="Extracted text…"
                  />
                  {extracted.illegibleCount > 0 && (
                    <p className="px-4 pb-2 text-xs text-amber-600">
                      ⚠ {extracted.illegibleCount} illegible section{extracted.illegibleCount !== 1 ? 's' : ''} marked — edit above to correct them before adding.
                    </p>
                  )}
                  <div className="flex gap-2 px-4 pb-3">
                    <Button size="sm" onClick={confirmExtract} className="flex-1 justify-center">Add to notes</Button>
                    <Button size="sm" variant="ghost" onClick={() => { setExtracted(null); setExtractedText(''); }}>Discard</Button>
                  </div>
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          {/* YouTube URL */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t.create.youtube}</label>
            <div className="flex gap-2">
              <input
                value={ytUrl} onChange={e => setYtUrl(e.target.value)}
                placeholder={t.create.youtubePlaceholder}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <button onClick={handleYouTube} disabled={ytLoading || !ytUrl.trim()}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold disabled:opacity-50 transition-colors">
                <Link className="w-4 h-4" />
                {ytLoading ? t.create.youtubeFetching : t.create.youtubeFetch}
              </button>
            </div>
          </div>

          {/* Exam date (flashcards only) */}
          {mode === 'flashcards' && (
            <Input label={t.create.examDate} type="date" value={examDate} onChange={e => setExamDate(e.target.value)} />
          )}

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
