import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, ChevronRight, AlertCircle, Video } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import Button from '../components/ui/Button';
import { apiFetch } from '../lib/api';

type Step = 'upload' | 'settings';
type Difficulty = 'standard' | 'hard' | 'brutal';

interface Material {
  text: string;
  wordCount: number;
  pageCount?: number;
  fileName: string;
  fileType: string;
}

export default function ExaminerPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('upload');
  const [material, setMaterial] = useState<Material | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState('');
  const [pasteText, setPasteText] = useState('');
  const [dragging, setDragging] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [questionCount, setQuestionCount] = useState(10);
  const [customCount, setCustomCount] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [focusArea, setFocusArea] = useState('');
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [youtubeFetching, setYoutubeFetching] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const extractFile = useCallback(async (file: File) => {
    setExtracting(true);
    setExtractError('');
    const token = localStorage.getItem('sb_token');
    const form = new FormData();
    form.append('file', file);
    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      });
      const data = await res.json();
      if (!res.ok || data.error) { setExtractError(data.error || 'Extraction failed'); return; }
      setMaterial(data);
      setStep('settings');
    } catch { setExtractError('Network error. Please try again.'); }
    finally { setExtracting(false); }
  }, []);

  const handleYoutube = useCallback(async () => {
    if (!youtubeUrl.trim()) return;
    setYoutubeFetching(true);
    setExtractError('');
    try {
      const data = await apiFetch<{ text: string; videoId: string }>('/upload/youtube', {
        method: 'POST',
        body: JSON.stringify({ url: youtubeUrl.trim() }),
      });
      const words = data.text.trim().split(/\s+/).filter(Boolean).length;
      if (words < 50) { setExtractError('Transcript too short (under 50 words).'); return; }
      setMaterial({ text: data.text.trim(), wordCount: words, fileName: `YouTube: ${data.videoId}`, fileType: 'paste' });
      setStep('settings');
    } catch (e: any) {
      setExtractError(e.message || 'Could not fetch transcript.');
    } finally {
      setYoutubeFetching(false);
    }
  }, [youtubeUrl]);

  const handlePaste = useCallback(() => {
    const words = pasteText.trim().split(/\s+/).filter(Boolean).length;
    if (words < 50) { setExtractError('Please paste at least 50 words.'); return; }
    setMaterial({ text: pasteText.trim(), wordCount: words, fileName: 'Pasted notes', fileType: 'paste' });
    setStep('settings');
  }, [pasteText]);

  const startExam = useCallback(async () => {
    if (!material || !difficulty) return;
    setStarting(true); setStartError('');
    try {
      const { sessionId } = await apiFetch<{ sessionId: number }>('/examiner/sessions', {
        method: 'POST',
        body: JSON.stringify({
          materialName: material.fileName,
          materialType: material.fileType,
          wordCount: material.wordCount,
          difficulty,
          questionCount,
          focusArea: focusArea.trim() || null,
          extractedText: material.text,
        }),
      });
      navigate(`/examiner/${sessionId}`);
    } catch (e: any) { setStartError(e.message || 'Failed to start. Try again.'); }
    finally { setStarting(false); }
  }, [material, difficulty, questionCount, focusArea, navigate]);

  const DIFF = [
    { key: 'standard', emoji: '📚', label: 'Standard', desc: 'Build up gradually' },
    { key: 'hard',     emoji: '🔥', label: 'Hard',     desc: 'Reach depth faster' },
    { key: 'brutal',   emoji: '💀', label: 'Brutal',   desc: 'No warmup, full depth' },
  ] as const;

  return (
    <AppLayout>
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🎓</span>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">The Examiner</h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Upload your notes. Every question comes from what <em>you</em> uploaded — nothing else.
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          {(['upload','settings'] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === s || (s === 'upload' && step === 'settings') ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
                {i + 1}
              </div>
              <span className={`text-xs font-semibold ${step === s ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400'}`}>
                {s === 'upload' ? 'Upload' : 'Settings'}
              </span>
              {i === 0 && <ChevronRight className="w-3 h-3 text-slate-300" />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ── Step 1: Upload ── */}
          {step === 'upload' && (
            <motion.div key="upload" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
              {/* Drop zone */}
              <div
                onClick={() => fileRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) extractFile(f); }}
                className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all mb-4 ${dragging ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950' : 'border-slate-200 dark:border-slate-700 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                <input ref={fileRef} type="file" className="hidden" accept=".pdf,.txt,.md,.jpg,.jpeg,.png,.webp,.docx,.doc"
                  onChange={e => { const f = e.target.files?.[0]; if (f) extractFile(f); e.target.value = ''; }} />
                {extracting ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Extracting text…</p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="font-bold text-slate-700 dark:text-slate-300 mb-1">Drop your file or click to browse</p>
                    <p className="text-xs text-slate-400">PDF · TXT · MD · JPG · PNG · DOCX</p>
                  </>
                )}
              </div>

              {extractError && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 dark:bg-red-950 rounded-xl px-4 py-3 mb-4 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {extractError}
                </div>
              )}

              {/* YouTube */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">or YouTube URL</span>
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
              </div>
              <div className="flex gap-2 mb-4">
                <div className="flex items-center flex-1 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                  <Video className="w-4 h-4 text-red-500 mx-3 flex-shrink-0" />
                  <input
                    type="url"
                    value={youtubeUrl}
                    onChange={e => setYoutubeUrl(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleYoutube()}
                    placeholder="https://youtube.com/watch?v=..."
                    className="flex-1 py-2.5 pr-3 text-sm bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none placeholder-slate-400"
                  />
                </div>
                <Button size="sm" variant="ghost" disabled={!youtubeUrl.trim() || youtubeFetching} onClick={handleYoutube}>
                  {youtubeFetching ? 'Fetching…' : 'Use →'}
                </Button>
              </div>

              {/* Paste */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">or paste text</span>
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
              </div>
              <textarea
                value={pasteText}
                onChange={e => setPasteText(e.target.value)}
                className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-2"
                rows={5}
                placeholder="Paste your notes here (minimum 50 words)…"
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">{pasteText.trim().split(/\s+/).filter(Boolean).length} words</span>
                <Button size="sm" variant="ghost" disabled={pasteText.trim().split(/\s+/).filter(Boolean).length < 50} onClick={handlePaste}>
                  Use These Notes →
                </Button>
              </div>
            </motion.div>
          )}

          {/* ── Step 2: Settings ── */}
          {step === 'settings' && material && (
            <motion.div key="settings" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
              {/* Preview card */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <FileText className="w-8 h-8 text-indigo-500 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">{material.fileName}</p>
                    <p className="text-xs text-slate-400">{material.wordCount.toLocaleString()} words{material.pageCount ? ` · ${material.pageCount} pages` : ''}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-xl p-3 line-clamp-3 font-mono">
                  {material.text.slice(0, 300)}{material.text.length > 300 ? '…' : ''}
                </p>
                {material.wordCount > 15000 && (
                  <p className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-950 rounded-lg px-3 py-2 mt-2">
                    ⚠️ Long notes — use Focus Area to direct the exam to specific sections.
                  </p>
                )}
                <button onClick={() => setStep('upload')} className="text-xs text-slate-400 hover:text-indigo-500 mt-2 transition-colors">
                  ← Upload different file
                </button>
              </div>

              {/* Difficulty */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Difficulty</p>
                <div className="grid grid-cols-3 gap-2">
                  {DIFF.map(d => (
                    <button key={d.key} onClick={() => setDifficulty(d.key)}
                      className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${difficulty === d.key ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950' : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300'}`}>
                      <span className="text-xl mb-1">{d.emoji}</span>
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{d.label}</span>
                      <span className="text-xs text-slate-400">{d.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Question count */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Questions</p>
                <div className="flex flex-wrap gap-2">
                  {[5, 10, 15].map(n => (
                    <button key={n} onClick={() => { setQuestionCount(n); setShowCustom(false); }}
                      className={`px-4 py-1.5 rounded-full text-sm font-semibold border-2 transition-all ${questionCount === n && !showCustom ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950 text-indigo-600' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-indigo-300'}`}>
                      {n}
                    </button>
                  ))}
                  <button onClick={() => setShowCustom(true)}
                    className={`px-4 py-1.5 rounded-full text-sm font-semibold border-2 transition-all ${showCustom ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950 text-indigo-600' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-indigo-300'}`}>
                    Custom
                  </button>
                  {showCustom && (
                    <input type="number" min="3" max="30" value={customCount} placeholder="3–30"
                      onChange={e => { setCustomCount(e.target.value); setQuestionCount(Math.max(3, Math.min(30, parseInt(e.target.value) || 10))); }}
                      className="w-20 px-3 py-1.5 rounded-full text-sm border-2 border-indigo-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none" />
                  )}
                </div>
              </div>

              {/* Focus area */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Focus Area <span className="font-normal normal-case tracking-normal">(optional)</span></p>
                <input type="text" value={focusArea} onChange={e => setFocusArea(e.target.value)}
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. only test me on Chapter 3, or photosynthesis only…" />
              </div>

              {startError && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 dark:bg-red-950 rounded-xl px-4 py-3 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" /> {startError}
                </div>
              )}

              <Button className="w-full justify-center py-3 text-base font-extrabold" disabled={!difficulty || starting} onClick={startExam}>
                {starting ? 'Starting…' : 'Start The Exam'}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
