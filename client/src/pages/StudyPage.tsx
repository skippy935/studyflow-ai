import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import Button    from '../components/ui/Button';
import Spinner   from '../components/ui/Spinner';
import { apiFetch } from '../lib/api';
import { useTranslation } from '../i18n';
import toast from 'react-hot-toast';
import type { Deck, Card } from '../types';

const DIFF_COLOR = { easy: 'bg-emerald-100 text-emerald-700', medium: 'bg-amber-100 text-amber-700', hard: 'bg-red-100 text-red-700' };

export default function StudyPage() {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t }    = useTranslation();
  const [deck, setDeck]     = useState<Deck | null>(null);
  const [cards, setCards]   = useState<Card[]>([]);
  const [index, setIndex]   = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [done, setDone]       = useState(false);
  const [ratings, setRatings] = useState({ 0: 0, 1: 0, 2: 0, 3: 0 });

  useEffect(() => {
    apiFetch<{ deck: Deck; cards: Card[] }>(`/decks/${id}/due`)
      .then(d => { setDeck(d.deck); setCards(d.cards); })
      .finally(() => setLoading(false));
  }, [id]);

  const rateCard = useCallback(async (rating: 0 | 1 | 2 | 3) => {
    const card = cards[index];
    setRatings(r => ({ ...r, [rating]: r[rating] + 1 }));
    apiFetch(`/cards/${card.id}/review`, { method: 'POST', body: JSON.stringify({ rating }) }).catch(() => {});
    const next = index + 1;
    if (next >= cards.length) {
      setDone(true);
      apiFetch<{ xp?: number; newBadges?: string[] }>('/ai/study-sessions', { method: 'POST', body: JSON.stringify({ deck_id: id, cards_studied: cards.length, again_count: ratings[0], hard_count: ratings[1], good_count: ratings[2], easy_count: ratings[3] }) })
        .then(d => { if (d.newBadges?.length) d.newBadges.forEach(b => toast.success(`🏅 Badge unlocked: ${b.replace(/_/g, ' ')}`, { duration: 4000 })); })
        .catch(() => {});
    } else {
      setIndex(next);
      setFlipped(false);
    }
  }, [cards, index, id, ratings]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Space') { e.preventDefault(); if (!flipped) setFlipped(true); }
      if (flipped) {
        if (e.key === '1') rateCard(0);
        if (e.key === '2') rateCard(1);
        if (e.key === '3') rateCard(2);
        if (e.key === '4') rateCard(3);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [flipped, rateCard]);

  if (loading) return <AppLayout><div className="flex justify-center py-20"><Spinner size="lg" /></div></AppLayout>;

  const card = cards[index];
  const pct  = cards.length ? Math.round((index / cards.length) * 100) : 0;

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate(`/deck/${id}`)} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> {deck?.name}
        </button>

        {/* Empty */}
        {!loading && cards.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">{t.study.allCaughtUp}</h2>
            <p className="text-slate-500 mb-6">{t.study.allCaughtUpDesc}</p>
            <Button variant="ghost" onClick={() => navigate(`/deck/${id}`)}>{t.study.backToDeck}</Button>
          </div>
        )}

        {/* Done */}
        {done && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10">
            <div className="text-5xl mb-5">🎉</div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-2">{t.study.sessionComplete}</h2>
            <p className="text-slate-500 mb-8">{t.study.greatWork}</p>
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 mb-8 inline-block min-w-64">
              <div className="text-4xl font-black text-slate-900 dark:text-slate-100 mb-1">{cards.length}</div>
              <div className="text-sm text-slate-400 mb-5">{t.study.reviewed}</div>
              <div className="grid grid-cols-4 gap-3">
                {[{ label: t.study.again, val: ratings[0], color: 'text-red-500' }, { label: t.study.hard, val: ratings[1], color: 'text-amber-500' }, { label: t.study.good, val: ratings[2], color: 'text-blue-500' }, { label: t.study.easy, val: ratings[3], color: 'text-emerald-500' }].map(({ label, val, color }) => (
                  <div key={label}><div className={`text-xl font-black ${color}`}>{val}</div><div className="text-xs text-slate-400">{label}</div></div>
                ))}
              </div>
            </div>
            <div className="flex gap-3 justify-center">
              <Button variant="ghost" onClick={() => navigate(`/deck/${id}`)}>{t.study.backToDeck}</Button>
              <Button onClick={() => navigate('/dashboard')}>Dashboard</Button>
            </div>
          </motion.div>
        )}

        {/* Study */}
        {!done && cards.length > 0 && card && (
          <>
            {/* Progress */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <motion.div animate={{ width: `${pct}%` }} className="h-full bg-indigo-600 rounded-full" />
              </div>
              <span className="text-xs font-bold text-slate-400 tabular-nums">{index + 1} / {cards.length}</span>
            </div>

            {/* Difficulty badge */}
            <div className="mb-3">
              <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${DIFF_COLOR[card.difficulty]}`}>{card.difficulty}</span>
            </div>

            {/* Card */}
            <div className="card-scene" style={{ height: '280px' }} onClick={() => !flipped && setFlipped(true)}>
              <div className={`card-inner ${flipped ? 'flipped' : ''}`} style={{ height: '100%' }}>
                <div className="card-face bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center p-8 cursor-pointer">
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-4">{t.study.question}</div>
                  <p className="text-xl font-semibold text-slate-900 dark:text-slate-100 text-center leading-relaxed">{card.front}</p>
                  <p className="absolute bottom-5 text-xs text-slate-300">{t.study.showAnswer} · Space</p>
                </div>
                <div className="card-face card-face--back bg-indigo-600 rounded-3xl shadow-sm flex flex-col items-center justify-center p-8">
                  <div className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-4">{t.study.answer}</div>
                  <p className="text-xl font-semibold text-white text-center leading-relaxed">{card.back}</p>
                </div>
              </div>
            </div>

            {/* Buttons */}
            {!flipped ? (
              <div className="text-center mt-6">
                <Button variant="ghost" size="lg" onClick={() => setFlipped(true)}>{t.study.showAnswer}</Button>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
                <p className="text-center text-xs text-slate-400 mb-3">{t.study.ratingPrompt}</p>
                <div className="grid grid-cols-4 gap-2">
                  {[{ label: t.study.again, rating: 0, cls: 'border-red-200 hover:bg-red-50 hover:border-red-400 text-red-600' }, { label: t.study.hard, rating: 1, cls: 'border-amber-200 hover:bg-amber-50 hover:border-amber-400 text-amber-600' }, { label: t.study.good, rating: 2, cls: 'border-blue-200 hover:bg-blue-50 hover:border-blue-400 text-blue-600' }, { label: t.study.easy, rating: 3, cls: 'border-emerald-200 hover:bg-emerald-50 hover:border-emerald-400 text-emerald-600' }].map(({ label, rating, cls }) => (
                    <button key={rating} onClick={() => rateCard(rating as 0 | 1 | 2 | 3)}
                      className={`py-3 rounded-2xl border-2 font-semibold text-sm transition-all ${cls}`}>{label}</button>
                  ))}
                </div>
                <p className="text-center text-xs text-slate-300 mt-2">1 · 2 · 3 · 4</p>
              </motion.div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
