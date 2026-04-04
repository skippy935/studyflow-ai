import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Bot, User, Lightbulb, Calculator, GraduationCap, BookOpen } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import Spinner from '../components/ui/Spinner';
import { apiFetch } from '../lib/api';
import type { Deck } from '../types';

type TutorMode = 'normal' | 'exam' | 'math';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isHint?: boolean;
}

const MODES: { key: TutorMode; label: string; icon: typeof BookOpen; desc: string }[] = [
  { key: 'normal', icon: BookOpen,       label: 'Normal',  desc: 'Full explanations with examples' },
  { key: 'exam',   icon: GraduationCap,  label: 'Exam',    desc: 'Hints only — no direct answers' },
  { key: 'math',   icon: Calculator,     label: 'Math',    desc: 'Step-by-step solutions' },
];

export default function TutorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<TutorMode>('normal');
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    apiFetch<{ deck: Deck; cards: unknown[] }>(`/decks/${id}`)
      .then(d => setDeck(d.deck))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const streamResponse = useCallback(async (
    apiMessages: { role: 'user' | 'assistant'; content: string }[],
    assistantId: string,
    hintLevel?: 1 | 2 | 3,
  ) => {
    setStreaming(true);
    try {
      const token = localStorage.getItem('sb_token');
      const res = await fetch(`/api/tutor/${id}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ messages: apiMessages, mode, hintLevel }),
      });

      if (!res.ok || !res.body) throw new Error('Stream failed');

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
            const { text: chunk } = JSON.parse(data);
            if (chunk) {
              setMessages(prev =>
                prev.map(m => m.id === assistantId ? { ...m, content: m.content + chunk } : m)
              );
            }
          } catch { /* skip malformed */ }
        }
      }
    } catch {
      setMessages(prev =>
        prev.map(m => m.id === assistantId ? { ...m, content: 'Sorry, something went wrong. Please try again.' } : m)
      );
    } finally {
      setStreaming(false);
      textareaRef.current?.focus();
    }
  }, [id, mode]);

  const sendMessage = useCallback(async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || streaming) return;
    if (!text) setInput('');

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content };
    const assistantId = crypto.randomUUID();
    const assistantMsg: Message = { id: assistantId, role: 'assistant', content: '' };
    setMessages(prev => [...prev, userMsg, assistantMsg]);

    const apiMessages = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));
    await streamResponse(apiMessages, assistantId);
  }, [input, streaming, messages, streamResponse]);

  const requestHint = useCallback(async (level: 1 | 2 | 3) => {
    if (streaming) return;
    const hintLabels = { 1: 'Give me a hint', 2: 'Show partial solution', 3: 'Show full solution' };
    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: hintLabels[level], isHint: true };
    const assistantId = crypto.randomUUID();
    const assistantMsg: Message = { id: assistantId, role: 'assistant', content: '' };
    setMessages(prev => [...prev, userMsg, assistantMsg]);

    const apiMessages = messages.map(m => ({ role: m.role, content: m.content }));
    await streamResponse(apiMessages, assistantId, level);
  }, [streaming, messages, streamResponse]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  if (loading) return <AppLayout><div className="flex justify-center py-20"><Spinner size="lg" /></div></AppLayout>;
  if (!deck) return <AppLayout><p className="text-slate-500 p-6">Deck not found.</p></AppLayout>;

  const modeColor: Record<TutorMode, string> = {
    normal: 'bg-indigo-600',
    exam:   'bg-amber-500',
    math:   'bg-emerald-600',
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-120px)]">
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate(`/deck/${id}`)} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${modeColor[mode]}`}>
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-slate-900 dark:text-slate-100 text-sm leading-tight truncate">AI Tutor</h1>
              <p className="text-xs text-slate-500 truncate">{deck.name}</p>
            </div>
          </div>
        </div>

        {/* Mode selector */}
        <div className="flex gap-2 mb-3">
          {MODES.map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => { setMode(key); setMessages([]); }}
              title={MODES.find(m => m.key === key)?.desc}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border-2 transition-all ${
                mode === key
                  ? key === 'exam'
                    ? 'border-amber-400 bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                    : key === 'math'
                    ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                    : 'border-indigo-400 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                  : 'border-slate-200 dark:border-slate-700 text-slate-500'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
          {mode === 'exam' && (
            <span className="ml-auto text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1 font-medium">
              <GraduationCap className="w-3.5 h-3.5" /> No direct answers
            </span>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 pb-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${modeColor[mode]}`}>
                <Bot className="w-7 h-7 text-white" />
              </div>
              <h2 className="font-bold text-slate-900 dark:text-slate-100 mb-2">
                {mode === 'exam' ? 'Exam Mode — I\'ll guide, not tell' : mode === 'math' ? 'Math Mode — Step-by-step solutions' : `Ask me anything about ${deck.name}`}
              </h2>
              <p className="text-sm text-slate-500 max-w-xs mx-auto">
                {mode === 'exam'
                  ? 'I\'ll give hints and ask questions to help you think. No direct answers.'
                  : mode === 'math'
                  ? 'Ask any maths question and I\'ll break it down step by step.'
                  : `I've read all ${deck._count?.cards ?? 0} cards and can explain any concept.`
                }
              </p>
              {mode !== 'exam' && (
                <div className="mt-6 flex flex-wrap gap-2 justify-center">
                  {['Explain the key concepts', 'Quiz me on this', 'What should I focus on?'].map(q => (
                    <button key={q} onClick={() => sendMessage(q)}
                      className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-indigo-400 hover:text-indigo-600 transition-colors">
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                msg.role === 'assistant' ? modeColor[mode] : 'bg-slate-200 dark:bg-slate-700'
              }`}>
                {msg.role === 'assistant'
                  ? <Bot className="w-4 h-4 text-white" />
                  : <User className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                }
              </div>
              <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'assistant'
                  ? 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                  : msg.isHint
                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800'
                  : 'bg-indigo-600 text-white'
              }`}>
                {msg.content || (streaming && msg.role === 'assistant' ? <span className="animate-pulse">▋</span> : '')}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Hint buttons (only visible when there are messages and not streaming) */}
        {messages.length > 0 && !streaming && (
          <div className="flex gap-2 pb-2">
            <span className="text-xs text-slate-400 flex items-center gap-1 mr-1">
              <Lightbulb className="w-3 h-3" /> Hints:
            </span>
            {([1, 2, 3] as const).map(level => (
              <button key={level} onClick={() => requestHint(level)}
                className="text-xs px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950 transition-colors">
                {level === 1 ? 'Tipp' : level === 2 ? 'Teil-Lösung' : 'Voll-Lösung'}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={mode === 'exam' ? 'Try to answer first...' : mode === 'math' ? 'Type a maths question...' : 'Ask a question about this deck...'}
            rows={1}
            disabled={streaming}
            className="flex-1 resize-none rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            style={{ minHeight: '44px', maxHeight: '120px' }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || streaming}
            className="w-11 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors flex-shrink-0"
          >
            {streaming ? <Spinner size="sm" /> : <Send className="w-4 h-4 text-white" />}
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
