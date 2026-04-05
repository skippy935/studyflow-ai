import { useState } from 'react';
import { MessageCircle, X, Send, ChevronDown } from 'lucide-react';
import { apiFetch } from '../../lib/api';
import toast from 'react-hot-toast';

type Category = 'bug' | 'feature' | 'billing' | 'other';

const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'bug',     label: '🐛 Bug report'       },
  { value: 'feature', label: '💡 Feature request'   },
  { value: 'billing', label: '💳 Billing question'  },
  { value: 'other',   label: '❓ Other'             },
];

export default function SupportWidget() {
  const [open, setOpen]         = useState(false);
  const [category, setCategory] = useState<Category>('bug');
  const [message, setMessage]   = useState('');
  const [sending, setSending]   = useState(false);
  const [sent, setSent]         = useState(false);

  async function submit() {
    if (!message.trim()) return;
    setSending(true);
    try {
      await apiFetch('/support/feedback', {
        method: 'POST',
        body: JSON.stringify({ category, message: message.trim() }),
      });
      setSent(true);
      setMessage('');
      setTimeout(() => { setSent(false); setOpen(false); }, 2500);
    } catch {
      toast.error('Failed to send — please email support@studybuild.app');
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen(v => !v)}
        className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-40 w-12 h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all"
        title="Support & Feedback">
        {open ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-36 right-4 lg:bottom-20 lg:right-6 z-40 w-80 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden">
          <div className="bg-indigo-600 px-4 py-3">
            <p className="text-white font-bold text-sm">Support & Feedback</p>
            <p className="text-indigo-200 text-xs mt-0.5">We usually reply within 24 hours</p>
          </div>

          {sent ? (
            <div className="p-6 text-center">
              <p className="text-2xl mb-2">✅</p>
              <p className="font-bold text-slate-800 dark:text-slate-200">Message sent!</p>
              <p className="text-xs text-slate-500 mt-1">We'll get back to you soon.</p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Category</label>
                <div className="relative">
                  <select value={category} onChange={e => setCategory(e.target.value as Category)}
                    className="w-full text-sm bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl px-3 py-2 outline-none border border-slate-200 dark:border-slate-700 appearance-none pr-8">
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2 top-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Message</label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Describe your issue or idea…"
                  rows={4}
                  className="w-full text-sm bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl px-3 py-2 outline-none border border-slate-200 dark:border-slate-700 resize-none"
                />
              </div>
              <button
                onClick={submit}
                disabled={!message.trim() || sending}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold py-2 rounded-xl transition-colors">
                <Send className="w-3.5 h-3.5" />
                {sending ? 'Sending…' : 'Send message'}
              </button>
              <p className="text-[10px] text-center text-slate-400">
                Or email us at <a href="mailto:support@studybuild.app" className="text-indigo-500 hover:underline">support@studybuild.app</a>
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
