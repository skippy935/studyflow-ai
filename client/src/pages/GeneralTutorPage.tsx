import { useState, useRef, useEffect } from 'react';
import { Bot, Send, RotateCcw, BookOpen } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import Button from '../components/ui/Button';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTED = [
  'Explain the difference between mitosis and meiosis',
  'Help me understand Newton\'s third law',
  'What is the difference between correlation and causation?',
  'Explain the French Revolution in simple terms',
  'How does compound interest work?',
];

export default function GeneralTutorPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput]       = useState('');
  const [subject, setSubject]   = useState('');
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content || streaming) return;
    setInput('');

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setStreaming(true);

    const assistantId = crypto.randomUUID();
    const assistantMsg: Message = { id: assistantId, role: 'assistant', content: '' };
    setMessages(prev => [...prev, assistantMsg]);

    try {
      const apiMessages = allMessages.map(m => ({ role: m.role, content: m.content }));
      const res = await fetch('/api/tutor/general', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ messages: apiMessages, subject }),
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
            const { text } = JSON.parse(data);
            if (text) {
              setMessages(prev => prev.map(m =>
                m.id === assistantId ? { ...m, content: m.content + text } : m
              ));
            }
          } catch {}
        }
      }
    } catch {
      setMessages(prev => prev.map(m =>
        m.id === assistantId ? { ...m, content: 'Sorry, something went wrong. Please try again.' } : m
      ));
    } finally {
      setStreaming(false);
      inputRef.current?.focus();
    }
  }

  function reset() {
    setMessages([]);
    setInput('');
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-120px)]">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-violet-100 dark:bg-violet-950 rounded-2xl flex items-center justify-center">
              <Bot className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">AI Tutor</h1>
              <p className="text-xs text-slate-400">Available 24/7 — ask me anything</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="Subject (optional)"
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-700 dark:text-slate-300 outline-none w-36"
            />
            {messages.length > 0 && (
              <button onClick={reset} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Clear chat">
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-2">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-5">
              <div className="w-16 h-16 bg-violet-100 dark:bg-violet-950 rounded-3xl flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-violet-500" />
              </div>
              <div>
                <p className="font-bold text-slate-700 dark:text-slate-300">Your personal AI tutor</p>
                <p className="text-sm text-slate-400 mt-1">Ask anything — explanations, problems, concept review</p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                {SUGGESTED.map(s => (
                  <button key={s} onClick={() => send(s)}
                    className="text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-600 dark:text-slate-400 hover:border-violet-300 hover:text-violet-600 transition-colors text-left">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map(m => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-violet-500 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                  m.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-sm'
                    : 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-sm'
                }`}>
                  {m.content || (streaming && m.role === 'assistant' ? (
                    <span className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                  ) : '')}
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex gap-2 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Ask anything… (Enter to send, Shift+Enter for newline)"
              rows={2}
              disabled={streaming}
              className="flex-1 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none focus:ring-2 focus:ring-violet-400 resize-none disabled:opacity-50"
            />
            <Button onClick={() => send()} loading={streaming} disabled={!input.trim()} className="mb-0.5">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
