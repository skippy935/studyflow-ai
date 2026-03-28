import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Bot, User } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import Spinner from '../components/ui/Spinner';
import { apiFetch } from '../lib/api';
import type { Deck } from '../types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function TutorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [loading, setLoading] = useState(true);
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

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || streaming) return;
    setInput('');

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: text };
    const assistantId = crypto.randomUUID();
    const assistantMsg: Message = { id: assistantId, role: 'assistant', content: '' };

    setMessages(prev => [...prev, userMsg, assistantMsg]);
    setStreaming(true);

    const apiMessages = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));

    try {
      const token = localStorage.getItem('sb_token');
      const res = await fetch(`/api/tutor/${id}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ messages: apiMessages }),
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
    } catch (err) {
      setMessages(prev =>
        prev.map(m => m.id === assistantId ? { ...m, content: 'Sorry, something went wrong. Please try again.' } : m)
      );
    } finally {
      setStreaming(false);
      textareaRef.current?.focus();
    }
  }, [input, streaming, messages, id]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  if (loading) return <AppLayout><div className="flex justify-center py-20"><Spinner size="lg" /></div></AppLayout>;
  if (!deck) return <AppLayout><p className="text-slate-500 p-6">Deck not found.</p></AppLayout>;

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-120px)]">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(`/deck/${id}`)} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: deck.color }}>
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 dark:text-slate-100 text-sm leading-tight">AI Tutor</h1>
              <p className="text-xs text-slate-500">{deck.name}</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 pb-4">
          {messages.length === 0 && (
            <div className="text-center py-16">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: deck.color }}>
                <Bot className="w-7 h-7 text-white" />
              </div>
              <h2 className="font-bold text-slate-900 dark:text-slate-100 mb-2">Ask me anything about {deck.name}</h2>
              <p className="text-sm text-slate-500 max-w-xs mx-auto">I've read all {deck._count?.cards ?? 0} cards in this deck and can explain, clarify, or quiz you on any concept.</p>
            </div>
          )}
          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                msg.role === 'assistant' ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'
              }`}>
                {msg.role === 'assistant'
                  ? <Bot className="w-4 h-4 text-white" />
                  : <User className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                }
              </div>
              <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'assistant'
                  ? 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                  : 'bg-indigo-600 text-white'
              }`}>
                {msg.content || (streaming && msg.role === 'assistant' ? <span className="animate-pulse">▋</span> : '')}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about this deck..."
            rows={1}
            disabled={streaming}
            className="flex-1 resize-none rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            style={{ minHeight: '44px', maxHeight: '120px' }}
          />
          <button
            onClick={sendMessage}
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
