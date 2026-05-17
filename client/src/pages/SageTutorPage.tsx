import { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, Send, RotateCcw, ArrowLeft, FileText, AlertCircle, Loader2, BookOpen } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface Material {
  text: string;
  wordCount: number;
  fileName: string;
}

function SageAvatar({ size = 'sm' }: { size?: 'sm' | 'lg' }) {
  const cls = size === 'lg' ? 'w-16 h-16 rounded-3xl text-2xl' : 'w-7 h-7 rounded-full text-sm';
  return (
    <div className={`${cls} flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-200 dark:shadow-violet-900`}>
      <span>✦</span>
    </div>
  );
}

export default function SageTutorPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const preloaded = location.state as {
    extractedText?: string;
    materialName?: string;
    examinerGaps?: { shaky: string[]; gaps: string[] };
  } | null;

  const [material, setMaterial] = useState<Material | null>(
    preloaded?.extractedText
      ? { text: preloaded.extractedText, wordCount: preloaded.extractedText.split(/\s+/).length, fileName: preloaded.materialName ?? 'your notes' }
      : null
  );
  const [examinerGaps] = useState(preloaded?.examinerGaps);

  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState('');
  const [pasteText, setPasteText] = useState('');
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Call API and stream response — accepts material directly so no stale closure
  const stream = useCallback(async (
    apiMessages: { role: 'user' | 'assistant'; content: string }[],
    mat: Material,
  ) => {
    setStreaming(true);
    const assistantId = crypto.randomUUID();
    setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '' }]);

    try {
      const token = localStorage.getItem('sb_token');
      const res = await fetch('/api/tutor/sage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          messages: apiMessages,
          extractedText: mat.text,
          materialName: mat.fileName,
          examinerGaps,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || err.error || `Error ${res.status}`);
      }
      if (!res.body) throw new Error('No response body');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6);
          if (data === '[DONE]') break;
          try {
            const { text } = JSON.parse(data);
            if (text) setMessages(prev => prev.map(m =>
              m.id === assistantId ? { ...m, content: m.content + text } : m
            ));
          } catch { /* skip */ }
        }
      }
    } catch (err: any) {
      setMessages(prev => prev.map(m =>
        m.id === assistantId ? { ...m, content: err.message || 'Something went wrong. Please try again.' } : m
      ));
    } finally {
      setStreaming(false);
      inputRef.current?.focus();
    }
  }, [examinerGaps]);

  // When material becomes available, auto-start the session once
  useEffect(() => {
    if (material && !startedRef.current) {
      startedRef.current = true;
      stream([{ role: 'user', content: 'Hello' }], material);
    }
  }, [material, stream]);

  // Start chat after file extraction
  const startWithMaterial = useCallback((mat: Material) => {
    setMaterial(mat);
    // stream is triggered by the useEffect above
  }, []);

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
      startWithMaterial({ text: data.text, wordCount: data.wordCount, fileName: data.fileName });
    } catch { setExtractError('Network error. Please try again.'); }
    finally { setExtracting(false); }
  }, [startWithMaterial]);

  const handlePaste = useCallback(() => {
    const words = pasteText.trim().split(/\s+/).filter(Boolean).length;
    if (words < 50) { setExtractError('Please paste at least 50 words.'); return; }
    setExtractError('');
    startWithMaterial({ text: pasteText.trim(), wordCount: words, fileName: 'Pasted notes' });
  }, [pasteText, startWithMaterial]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) extractFile(file);
  }, [extractFile]);

  const sendMessage = useCallback(async () => {
    const content = input.trim();
    if (!content || streaming || !material) return;
    setInput('');

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);

    await stream(newMessages.map(m => ({ role: m.role, content: m.content })), material);
  }, [input, streaming, messages, material, stream]);

  const reset = () => {
    setMaterial(null);
    setMessages([]);
    setInput('');
    setPasteText('');
    startedRef.current = false;
  };

  // ── Upload screen ────────────────────────────────────────────────────────────
  if (!material) {
    return (
      <AppLayout>
        <div className="max-w-xl mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">Sage — AI Tutor</h1>
              <p className="text-sm text-slate-500">Upload your notes and I'll teach you what you need to know.</p>
            </div>
          </div>

          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
              dragging
                ? 'border-violet-400 bg-violet-50 dark:bg-violet-950'
                : 'border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <input ref={fileRef} type="file" className="hidden"
              accept=".pdf,.docx,.doc,.txt,.md,.jpg,.jpeg,.png,.webp"
              onChange={e => { const f = e.target.files?.[0]; if (f) extractFile(f); }} />
            {extracting ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
                <p className="text-sm text-slate-500">Reading your notes…</p>
              </div>
            ) : (
              <>
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                <p className="font-semibold text-slate-700 dark:text-slate-300">Drop your notes here</p>
                <p className="text-xs text-slate-400 mt-1">PDF, DOCX, TXT, MD, JPG, PNG</p>
              </>
            )}
          </div>

          {/* Paste zone */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Or paste your notes</p>
            <textarea
              value={pasteText}
              onChange={e => { setPasteText(e.target.value); setExtractError(''); }}
              placeholder="Paste notes, textbook content, or any study material here…"
              rows={6}
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 outline-none focus:ring-2 focus:ring-violet-400 resize-none"
            />
            <button
              onClick={handlePaste}
              disabled={pasteText.trim().split(/\s+/).filter(Boolean).length < 50}
              className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white text-sm font-semibold transition-colors"
            >
              Start tutoring session
            </button>
          </div>

          {extractError && (
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 dark:bg-red-950 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {extractError}
            </div>
          )}
        </div>
      </AppLayout>
    );
  }

  // ── Chat screen ──────────────────────────────────────────────────────────────
  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-120px)]">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button onClick={reset} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <SageAvatar size="sm" />
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-slate-900 dark:text-slate-100 text-sm leading-tight">Sage</h1>
            <p className="text-xs text-slate-400 truncate flex items-center gap-1">
              <FileText className="w-3 h-3" />
              {material.fileName} · {material.wordCount.toLocaleString()} words
            </p>
          </div>
          {messages.length > 1 && (
            <button onClick={reset} title="New session"
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Examiner gap banner */}
        {examinerGaps && (examinerGaps.shaky.length + examinerGaps.gaps.length) > 0 && (
          <div className="mb-3 px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
            <BookOpen className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <span>
              <strong>From The Examiner:</strong> Sage will focus on — {[...examinerGaps.shaky, ...examinerGaps.gaps].join(', ')}.
            </span>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 pb-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4">
              <SageAvatar size="lg" />
              <div>
                <p className="font-bold text-slate-700 dark:text-slate-300 text-lg">Sage is reading your notes…</p>
                <p className="text-sm text-slate-400 mt-1">One moment.</p>
              </div>
            </div>
          )}

          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {msg.role === 'assistant' && <SageAvatar size="sm" />}
              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold text-slate-600 dark:text-slate-300">
                  U
                </div>
              )}
              <div className={`max-w-[82%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'assistant'
                  ? 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-sm'
                  : 'bg-indigo-600 text-white rounded-tr-sm'
              }`}>
                {msg.content || (streaming && msg.role === 'assistant'
                  ? <span className="flex gap-1 items-center h-4">
                      <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                  : ''
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="Ask Sage anything about your notes…"
            rows={2}
            disabled={streaming}
            className="flex-1 resize-none rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none focus:ring-2 focus:ring-violet-400 disabled:opacity-50"
            style={{ maxHeight: '120px' }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || streaming}
            className="w-11 h-11 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-40 flex items-center justify-center transition-colors flex-shrink-0 mb-0.5"
          >
            {streaming
              ? <Loader2 className="w-4 h-4 text-white animate-spin" />
              : <Send className="w-4 h-4 text-white" />
            }
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
