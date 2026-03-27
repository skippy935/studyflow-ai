import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Send, StopCircle, RotateCcw, Download, FileText } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import { apiFetch } from '../lib/api';

interface Message { role: 'user' | 'assistant'; content: string; }
interface GapAnalysis {
  solid: string[];
  shaky: string[];
  gaps: string[];
  summary: string;
  nextSteps: string[];
}
interface Session {
  id: number;
  material_name: string;
  difficulty: 'standard' | 'hard' | 'brutal';
  question_count: number;
  messages: Message[];
  exchange_count: number;
  completed: number;
  gap_analysis: GapAnalysis | null;
}

const DIFF_COLORS = { standard: '#3B82F6', hard: '#F59E0B', brutal: '#EF4444' };
const DIFF_LABELS = { standard: 'Standard', hard: 'Hard', brutal: 'Brutal' };

function detectQuality(answer: string): 'solid' | 'partial' | 'vague' {
  if (answer.length < 80 || /\bi think\b|\bmaybe\b|\bnot sure\b|\bkind of\b|\bsort of\b/i.test(answer)) return 'vague';
  if (answer.length > 200) return 'solid';
  return 'partial';
}

const QUALITY_STYLE: Record<string, string> = {
  solid:   'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
  partial: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
  vague:   'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
};

export default function ExaminerSessionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [answer, setAnswer] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [ended, setEnded] = useState(false);
  const [gap, setGap] = useState<GapAnalysis | null>(null);
  const [exchangeCount, setExchangeCount] = useState(0);
  const [loadError, setLoadError] = useState('');
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }, []);

  const parseGapAnalysis = useCallback((text: string): GapAnalysis | null => {
    const match = text.match(/---GAP_ANALYSIS_START---([\s\S]*?)---GAP_ANALYSIS_END---/);
    if (!match) return null;
    const block = match[1];
    const get = (key: string) => (block.match(new RegExp(`${key}:(.+)`))?.[1] ?? '').trim();
    const getList = (key: string) => get(key).split(',').map((s: string) => s.trim()).filter(Boolean);
    return {
      solid: getList('SOLID'),
      shaky: getList('SHAKY'),
      gaps: getList('GAPS'),
      summary: get('SUMMARY'),
      nextSteps: getList('NEXT_STEPS'),
    };
  }, []);

  const endSession = useCallback((parsedGap: GapAnalysis | null) => {
    setEnded(true);
    setStreaming(false);
    if (parsedGap) setGap(parsedGap);
    scrollToBottom();
  }, [scrollToBottom]);

  const streamMessage = useCallback(async (userContent: string, triggerGapAnalysis = false) => {
    if (streaming || !id) return;
    setStreaming(true);
    setStreamingText('');

    const token = localStorage.getItem('sb_token');
    let fullText = '';

    try {
      const res = await fetch(`/api/examiner/sessions/${id}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: userContent, triggerGapAnalysis }),
      });

      if (!res.ok) {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Error connecting to The Examiner. Please refresh.' }]);
        setStreaming(false);
        return;
      }

      const reader = res.body!.getReader();
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
          const payload = line.slice(6);
          if (payload === '[DONE]') break;
          try {
            const { text, error } = JSON.parse(payload);
            if (error) { fullText = 'Error: ' + error; break; }
            if (text) { fullText += text; setStreamingText(fullText); scrollToBottom(); }
          } catch { /* malformed */ }
        }
      }

      // Check for gap analysis
      const parsedGap = parseGapAnalysis(fullText);
      if (parsedGap || triggerGapAnalysis) {
        if (!parsedGap) {
          // Retry gap was triggered but no data — just end
        }
        endSession(parsedGap);
        setStreamingText('');
        return;
      }

      // Normal message — add to list
      setMessages(prev => [...prev, { role: 'assistant', content: fullText }]);
      setStreamingText('');
      const newCount = exchangeCount + 1;
      setExchangeCount(newCount);

      if (session && newCount >= session.question_count) {
        setTimeout(() => streamMessage('', true), 800);
        return;
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Please try again.' }]);
      setStreamingText('');
    } finally {
      setStreaming(false);
    }
  }, [streaming, id, exchangeCount, session, parseGapAnalysis, endSession, scrollToBottom]);

  const submitAnswer = useCallback(async () => {
    const text = answer.trim();
    if (!text || streaming || ended) return;
    const quality = detectQuality(text);
    setMessages(prev => [...prev, { role: 'user', content: text, quality } as any]);
    setAnswer('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    await streamMessage(text, false);
  }, [answer, streaming, ended, streamMessage]);

  // Load session on mount
  useEffect(() => {
    if (!id) return;
    apiFetch<{ session: Session }>(`/examiner/sessions/${id}`)
      .then(({ session: s }) => {
        setSession(s);
        if (s.messages?.length > 0) {
          setMessages(s.messages);
          setExchangeCount(s.exchange_count || 0);
          if (s.completed && s.gap_analysis) {
            setGap(s.gap_analysis);
            setEnded(true);
          } else {
            // Resumed session — ready for input
          }
        } else {
          // Fresh session — kick off first question
          streamMessage('', false);
        }
      })
      .catch(() => setLoadError('Failed to load session.'));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => { scrollToBottom(); }, [messages, streamingText, scrollToBottom]);

  if (loadError) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto py-20 text-center">
          <p className="text-red-500 mb-4">{loadError}</p>
          <Button onClick={() => navigate('/examiner')}>Start new exam</Button>
        </div>
      </AppLayout>
    );
  }

  if (!session) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto py-20 flex flex-col items-center gap-3">
          <Spinner size="lg" />
          <p className="text-slate-500 text-sm">Starting your exam…</p>
        </div>
      </AppLayout>
    );
  }

  const diff = session.difficulty;
  const dateStr = new Date().toISOString().slice(0, 10);

  function exportMarkdown() {
    let md = `# StudyBuild Examiner Report\n\n`;
    md += `**Material:** ${session!.material_name}\n`;
    md += `**Date:** ${dateStr}\n`;
    md += `**Difficulty:** ${DIFF_LABELS[diff] || diff}\n`;
    md += `**Questions answered:** ${exchangeCount}\n\n---\n\n## Transcript\n\n`;

    let qNum = 0;
    messages.forEach(msg => {
      if (msg.role === 'assistant') {
        qNum++;
        md += `**Q${qNum}:** ${msg.content}\n\n`;
      } else {
        md += `**Answer:** ${msg.content}\n\n`;
      }
    });

    if (gap) {
      md += `---\n\n## Gap Analysis\n\n`;
      md += `### ✅ What you know\n${gap.solid.length ? gap.solid.map(s => `- ${s}`).join('\n') : '_None demonstrated clearly._'}\n\n`;
      md += `### ⚠️ Shaky ground\n${gap.shaky.length ? gap.shaky.map(s => `- ${s}`).join('\n') : '_No shaky areas._'}\n\n`;
      md += `### 🔴 Gaps found\n${gap.gaps.length ? gap.gaps.map(s => `- ${s}`).join('\n') : '_No major gaps._'}\n\n`;
      md += `### Summary\n${gap.summary}\n\n`;
      if (gap.nextSteps.length) {
        md += `### 📌 What to study next\n${gap.nextSteps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n`;
      }
    }

    const blob = new Blob([md], { type: 'text/markdown' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `examiner-session-${dateStr}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function exportPDF() {
    const { default: jsPDF } = await import('jspdf');
    const doc    = new jsPDF({ unit: 'mm', format: 'a4' });
    const margin = 20;
    const maxW   = 170;
    let   y      = margin;

    function addLine(text: string, size = 10, style: 'normal' | 'bold' | 'italic' = 'normal', rgb: [number, number, number] = [30, 30, 30]) {
      doc.setFontSize(size);
      doc.setFont('helvetica', style);
      doc.setTextColor(...rgb);
      const lines = doc.splitTextToSize(String(text), maxW) as string[];
      lines.forEach((ln: string) => {
        if (y > 272) { doc.addPage(); y = margin; }
        doc.text(ln, margin, y);
        y += size * 0.45;
      });
      y += 2;
    }

    function rule() {
      doc.setDrawColor(210, 210, 210);
      doc.line(margin, y, 190, y);
      y += 6;
    }

    // Header
    addLine('STUDYBUILD — EXAMINER REPORT', 14, 'bold', [79, 70, 229]);
    addLine(session!.material_name, 11, 'bold');
    addLine(`${dateStr}  ·  ${DIFF_LABELS[diff] || diff}  ·  ${exchangeCount} question${exchangeCount !== 1 ? 's' : ''}`, 9, 'normal', [120, 120, 120]);
    y += 3; rule();

    // Transcript
    addLine('TRANSCRIPT', 10, 'bold', [79, 70, 229]);
    y += 1;
    let qNum = 0;
    messages.forEach(msg => {
      if (msg.role === 'assistant') {
        qNum++;
        addLine(`Q${qNum}:`, 10, 'bold', [30, 30, 30]);
        addLine(msg.content, 10, 'normal', [30, 30, 30]);
      } else {
        addLine('Answer:', 9, 'bold', [100, 100, 100]);
        addLine(msg.content, 9, 'italic', [80, 80, 80]);
      }
      y += 1;
    });

    if (gap) {
      y += 2; rule();
      addLine('GAP ANALYSIS', 10, 'bold', [79, 70, 229]);
      y += 1;
      if (gap.solid.length) { addLine('What you know', 9, 'bold', [16, 185, 129]); gap.solid.forEach(s => addLine(`• ${s}`, 9)); y += 1; }
      if (gap.shaky.length) { addLine('Shaky ground',  9, 'bold', [245, 158, 11]); gap.shaky.forEach(s => addLine(`• ${s}`, 9)); y += 1; }
      if (gap.gaps.length)  { addLine('Gaps found',    9, 'bold', [239, 68, 68]);  gap.gaps.forEach(s  => addLine(`• ${s}`, 9)); y += 1; }
      addLine('Summary', 9, 'bold'); addLine(gap.summary, 9); y += 1;
      if (gap.nextSteps.length) { addLine('What to study next', 9, 'bold'); gap.nextSteps.forEach((s, i) => addLine(`${i + 1}. ${s}`, 9)); }
    }

    doc.save(`examiner-session-${dateStr}.pdf`);
  }

  return (
    <AppLayout>
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-950/80 backdrop-blur border-b border-slate-100 dark:border-slate-800 -mx-4 px-4 py-3 mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link to="/dashboard" className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex-shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="min-w-0">
            <p className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate max-w-[200px]">{session.material_name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: (DIFF_COLORS[diff] || '#3B82F6') + '22', color: DIFF_COLORS[diff] || '#3B82F6' }}>
                {DIFF_LABELS[diff] || diff}
              </span>
              <span className="text-xs text-slate-400">Q {exchangeCount} / {session.question_count}</span>
            </div>
          </div>
        </div>
        {!ended && (
          <button onClick={() => setShowEndDialog(true)} className="text-xs font-semibold text-red-500 hover:text-red-600 flex items-center gap-1 flex-shrink-0">
            <StopCircle className="w-4 h-4" /> End Session
          </button>
        )}
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Messages */}
        <div className="flex flex-col gap-4 mb-4">
          {messages.map((msg, i) => {
            const quality = msg.role === 'user' ? detectQuality(msg.content) : null;
            return (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[82%] ${msg.role === 'user' ? '' : ''}`}>
                  <div className={`px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'assistant'
                      ? 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-tl-none rounded-2xl text-slate-800 dark:text-slate-200'
                      : 'bg-indigo-600 text-white rounded-tr-none rounded-2xl'
                  }`}>
                    {msg.content}
                  </div>
                  {quality && (
                    <div className="mt-1 text-right">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${QUALITY_STYLE[quality]}`}>
                        {quality.charAt(0).toUpperCase() + quality.slice(1)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Streaming bubble */}
          {streaming && (
            <div className="flex justify-start">
              <div className="max-w-[82%]">
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-tl-none rounded-2xl px-4 py-3 text-sm leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                  {streamingText || (
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Gap Analysis */}
        {ended && gap && (
          <div className="mt-6 mb-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-950 rounded-2xl flex items-center justify-center mx-auto mb-3 text-3xl">📊</div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mb-1">Exam Complete</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Here's your gap analysis based on your uploaded material.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {[
                { label: 'Solid', value: gap.solid.length, color: '#10B981' },
                { label: 'Shaky', value: gap.shaky.length, color: '#F59E0B' },
                { label: 'Gaps',  value: gap.gaps.length,  color: '#EF4444' },
                { label: 'Questions', value: exchangeCount, color: '#6366F1' },
              ].map(s => (
                <div key={s.label} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-3 text-center">
                  <div className="text-2xl font-black" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Solid / Shaky / Gaps */}
            <div className="flex flex-col gap-3 mb-4">
              <Section title="✅ What you know" color="emerald" items={gap.solid} emptyMsg="None demonstrated clearly yet." />
              <Section title="⚠️ Shaky ground"  color="amber"   items={gap.shaky} emptyMsg="No shaky areas identified." />
              <Section title="🔴 Gaps found"     color="red"     items={gap.gaps}  emptyMsg="No major gaps found." />
            </div>

            {/* Summary */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 mb-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Summary</p>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{gap.summary || '—'}</p>
            </div>

            {/* Next Steps */}
            {gap.nextSteps.length > 0 && (
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 mb-6">
                <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-3">📌 What to study next</p>
                <ol className="list-decimal list-inside space-y-1">
                  {gap.nextSteps.map((s, i) => (
                    <li key={i} className="text-sm text-slate-700 dark:text-slate-300">{s}</li>
                  ))}
                </ol>
              </div>
            )}

            {/* CTAs */}
            <div className="flex flex-col gap-3">
              <div className="flex gap-3">
                <Button className="flex-1 justify-center" onClick={() => {
                  const weakAreas = [...gap.shaky, ...gap.gaps].join(', ');
                  sessionStorage.setItem('examiner_reexamine', JSON.stringify({ focusArea: weakAreas, difficulty: session.difficulty }));
                  navigate('/examiner');
                }}>
                  <RotateCcw className="w-4 h-4" /> Re-examine weak areas
                </Button>
                <Button variant="ghost" className="flex-1 justify-center" onClick={() => navigate('/dashboard')}>
                  Dashboard
                </Button>
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1 justify-center" onClick={exportPDF}>
                  <Download className="w-4 h-4" /> Download PDF
                </Button>
                <Button variant="secondary" className="flex-1 justify-center" onClick={exportMarkdown}>
                  <FileText className="w-4 h-4" /> Download Markdown
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Input */}
        {!ended && (
          <div className="sticky bottom-4">
            <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl p-3 focus-within:border-indigo-500 transition-colors shadow-lg">
              <textarea
                ref={textareaRef}
                value={answer}
                onChange={e => {
                  setAnswer(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
                }}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitAnswer(); } }}
                disabled={streaming || ended}
                rows={3}
                placeholder="Type your answer… (Enter to submit · Shift+Enter for new line)"
                className="w-full bg-transparent text-sm text-slate-900 dark:text-slate-100 resize-none focus:outline-none placeholder-slate-400 mb-2"
              />
              <div className="flex justify-end">
                <Button size="sm" disabled={!answer.trim() || streaming || ended} onClick={submitAnswer}>
                  <Send className="w-3.5 h-3.5" /> Submit
                </Button>
              </div>
            </div>
            <p className="text-center text-xs text-slate-400 mt-1.5">Enter to submit · Shift+Enter for new line</p>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* End confirm dialog */}
      {showEndDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowEndDialog(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-sm w-full text-center shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="text-3xl mb-3">⏹️</div>
            <h3 className="font-extrabold text-slate-900 dark:text-slate-100 mb-2">End session early?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">The Examiner will generate your gap analysis based on what you've covered so far.</p>
            <div className="flex gap-3">
              <Button variant="ghost" className="flex-1 justify-center" onClick={() => setShowEndDialog(false)}>Keep going</Button>
              <Button className="flex-1 justify-center bg-red-500 hover:bg-red-600" onClick={() => { setShowEndDialog(false); streamMessage('', true); }}>
                End &amp; get analysis
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

function Section({ title, color, items, emptyMsg }: { title: string; color: string; items: string[]; emptyMsg: string }) {
  const styles: Record<string, string> = {
    emerald: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400',
    amber:   'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-400',
    red:     'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900 text-red-700 dark:text-red-400',
  };
  return (
    <div className={`border rounded-2xl p-4 ${styles[color]}`}>
      <p className="text-xs font-bold uppercase tracking-wider mb-2">{title}</p>
      {items.length === 0
        ? <p className="text-sm opacity-60 italic">{emptyMsg}</p>
        : <div className="text-sm space-y-1">{items.map((item, i) => <p key={i}>• {item}</p>)}</div>
      }
    </div>
  );
}
