import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Pencil, Trash2, Play, Download, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import AppLayout from '../components/layout/AppLayout';
import Button    from '../components/ui/Button';
import Spinner   from '../components/ui/Spinner';
import { apiFetch } from '../lib/api';
import type { Deck, Card } from '../types';

const DIFF = { easy: 'bg-emerald-100 text-emerald-700', medium: 'bg-amber-100 text-amber-700', hard: 'bg-red-100 text-red-700' };

export default function DeckPage() {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [deck, setDeck]   = useState<Deck | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<number | null>(null);
  const [editFront, setEditFront] = useState('');
  const [editBack,  setEditBack]  = useState('');
  const [adding, setAdding] = useState(false);
  const [newFront, setNewFront] = useState('');
  const [newBack,  setNewBack]  = useState('');

  useEffect(() => {
    apiFetch<{ deck: Deck; cards: Card[] }>(`/decks/${id}`)
      .then(d => { setDeck(d.deck); setCards(d.cards); })
      .finally(() => setLoading(false));
  }, [id]);

  async function saveEdit(cardId: number) {
    const { card } = await apiFetch<{ card: Card }>(`/cards/${cardId}`, {
      method: 'PUT', body: JSON.stringify({ front: editFront, back: editBack })
    });
    setCards(prev => prev.map(c => c.id === cardId ? card : c));
    setEditing(null);
    toast.success('Card updated');
  }

  async function deleteCard(cardId: number) {
    if (!confirm('Delete this card?')) return;
    await apiFetch(`/cards/${cardId}`, { method: 'DELETE' });
    setCards(prev => prev.filter(c => c.id !== cardId));
    toast.success('Card deleted');
  }

  async function addCard() {
    if (!newFront.trim() || !newBack.trim()) return;
    const { card } = await apiFetch<{ card: Card }>(`/decks/${id}/cards`, {
      method: 'POST', body: JSON.stringify({ front: newFront, back: newBack })
    });
    setCards(prev => [...prev, card]);
    setNewFront(''); setNewBack(''); setAdding(false);
    toast.success('Card added');
  }

  if (loading) return <AppLayout><div className="flex justify-center py-20"><Spinner size="lg" /></div></AppLayout>;
  if (!deck)   return <AppLayout><p className="text-slate-500">Deck not found.</p></AppLayout>;

  const due = cards.filter(c => new Date(c.nextReview) <= new Date()).length;

  function exportTSV() {
    const lines = cards.map(c => `${c.front.replace(/\t/g, ' ')}\t${c.back.replace(/\t/g, ' ')}`);
    const tsv = lines.join('\n');
    const blob = new Blob([tsv], { type: 'text/plain; charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${deck!.name.replace(/[^a-z0-9]/gi, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${cards.length} cards exported`);
  }

  async function importTSV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const text = await file.text();
    const parsed = text.split('\n')
      .map(line => {
        const sep = line.includes('\t') ? '\t' : ',';
        const parts = line.split(sep);
        return { front: (parts[0] || '').trim(), back: (parts[1] || '').trim() };
      })
      .filter(c => c.front && c.back);
    if (parsed.length === 0) { toast.error('No valid cards found. Expected tab-separated or CSV lines.'); return; }
    try {
      const { imported, skipped } = await apiFetch<{ imported: number; skipped: number }>(
        `/decks/${id}/cards/bulk`,
        { method: 'POST', body: JSON.stringify({ cards: parsed }) }
      );
      toast.success(`Imported ${imported} cards${skipped > 0 ? `, ${skipped} skipped` : ''}`);
      const data = await apiFetch<{ deck: Deck; cards: Card[] }>(`/decks/${id}`);
      setCards(data.cards);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Import failed');
    }
  }

  return (
    <AppLayout>
      <button onClick={() => navigate('/dashboard')} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Dashboard
      </button>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl" style={{ background: deck.color }}>
              {deck.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">{deck.name}</h1>
              {deck.description && <p className="text-sm text-slate-400">{deck.description}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {cards.length > 0 && (
              <Button size="sm" variant="ghost" onClick={exportTSV} title="Export for Anki">
                <Download className="w-4 h-4" /> Export
              </Button>
            )}
            <label className="cursor-pointer">
              <Button size="sm" variant="ghost" onClick={() => document.getElementById('anki-import')?.click()} title="Import from Anki">
                <Upload className="w-4 h-4" /> Import
              </Button>
              <input id="anki-import" type="file" accept=".txt,.csv,.tsv" className="hidden" onChange={importTSV} />
            </label>
            <Button onClick={() => navigate(`/study/${deck.id}`)}>
              <Play className="w-4 h-4" /> Study Now
            </Button>
          </div>
        </div>
        <div className="flex gap-6 mt-5 pt-5 border-t border-slate-100 dark:border-slate-800">
          <div><div className="text-2xl font-black text-slate-900 dark:text-slate-100">{cards.length}</div><div className="text-xs text-slate-400">Total cards</div></div>
          <div><div className="text-2xl font-black text-indigo-600">{due}</div><div className="text-xs text-slate-400">Due today</div></div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="font-bold text-slate-900 dark:text-slate-100">All Cards ({cards.length})</h2>
          <Button size="sm" variant="ghost" onClick={() => setAdding(true)}><Plus className="w-4 h-4" /> Add Card</Button>
        </div>

        {/* Column headers */}
        <div className="grid grid-cols-[1fr_1fr_80px_80px] gap-4 px-6 py-2.5 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 text-xs font-bold text-slate-400 uppercase tracking-wider">
          <span>Front</span><span>Back</span><span>Level</span><span></span>
        </div>

        {/* Add row */}
        {adding && (
          <div className="grid grid-cols-[1fr_1fr_80px_80px] gap-4 px-6 py-3 border-b border-slate-100 dark:border-slate-800 bg-emerald-50 dark:bg-emerald-950 items-start">
            <textarea value={newFront} onChange={e => setNewFront(e.target.value)} rows={2} placeholder="Question…" className="w-full px-3 py-2 rounded-xl border border-emerald-200 text-sm bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none" />
            <textarea value={newBack}  onChange={e => setNewBack(e.target.value)}  rows={2} placeholder="Answer…"   className="w-full px-3 py-2 rounded-xl border border-emerald-200 text-sm bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none" />
            <div />
            <div className="flex flex-col gap-1.5">
              <Button size="sm" onClick={addCard} className="text-xs px-2 justify-center">Add</Button>
              <Button size="sm" variant="ghost" onClick={() => setAdding(false)} className="text-xs px-2 justify-center">Cancel</Button>
            </div>
          </div>
        )}

        {cards.length === 0 && !adding && (
          <div className="text-center py-16 text-slate-400"><p>No cards yet. Click "Add Card" to create one.</p></div>
        )}

        {cards.map(card => (
          <div key={card.id} className="grid grid-cols-[1fr_1fr_80px_80px] gap-4 px-6 py-3 border-b border-slate-100 dark:border-slate-800 items-center last:border-0">
            {editing === card.id ? (
              <>
                <textarea value={editFront} onChange={e => setEditFront(e.target.value)} rows={2} className="px-3 py-2 rounded-xl border border-indigo-200 text-sm bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none" />
                <textarea value={editBack}  onChange={e => setEditBack(e.target.value)}  rows={2} className="px-3 py-2 rounded-xl border border-indigo-200 text-sm bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none" />
                <div />
                <div className="flex flex-col gap-1.5">
                  <Button size="sm" onClick={() => saveEdit(card.id)} className="text-xs px-2 justify-center">Save</Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditing(null)} className="text-xs px-2 justify-center">Cancel</Button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-slate-800 dark:text-slate-200">{card.front}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{card.back}</p>
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold w-fit ${DIFF[card.difficulty] ?? ''}`}>{card.difficulty}</span>
                <div className="flex gap-1 justify-end">
                  <button onClick={() => { setEditing(card.id); setEditFront(card.front); setEditBack(card.back); }} className="p-1.5 rounded-lg text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => deleteCard(card.id)} className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </AppLayout>
  );
}
