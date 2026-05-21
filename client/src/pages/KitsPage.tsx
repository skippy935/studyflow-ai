import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Lock, Star, ChevronRight, BookOpen, HelpCircle, Layers, FileText, Calendar, Zap, Filter, X, RotateCcw, CheckCircle, XCircle } from 'lucide-react';
import { useTranslation } from '../i18n';

interface KitContent {
  studyGuide: string;
  flashcards: { front: string; back: string }[];
  quiz: { q: string; opts: string[]; correct: number; exp: string }[];
}
import AppLayout from '../components/layout/AppLayout';
import Spinner from '../components/ui/Spinner';
import { apiFetch } from '../lib/api';
import toast from 'react-hot-toast';

interface Kit {
  id: string;
  name: string;
  subject: string;
  subjectCategory: string;
  grade: string;
  duration: number;
  difficulty: 'Basis' | 'Standard' | 'Erweitert';
  tags: string[];
  includes: string[];
  description: string;
  isPro: boolean;
  isPopular?: boolean;
  locked: boolean;
  emoji: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  all: 'Alle Fächer',
  math: '🔢 Mathematik',
  science: '🔬 Naturwissenschaften',
  humanities: '🌍 Geistes- & Sozialwiss.',
  languages: '📖 Sprachen',
  digital: '💻 Informatik',
  specialty: '🎯 Spezial-Kits',
};

const DIFFICULTY_COLORS: Record<string, string> = {
  Basis: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400',
  Standard: 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400',
  Erweitert: 'bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-400',
};

const INCLUDE_ICONS: Record<string, typeof BookOpen> = {
  'Study Guide': BookOpen,
  'Quiz': HelpCircle,
  'Flashcards': Layers,
  'Klassenarbeit': FileText,
  'Lernplan': Calendar,
};

function includeIcon(label: string) {
  for (const [key, Icon] of Object.entries(INCLUDE_ICONS)) {
    if (label.toLowerCase().includes(key.toLowerCase())) return Icon;
  }
  return FileText;
}

export default function KitsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [kits, setKits] = useState<Kit[]>([]);
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [difficulty, setDifficulty] = useState('all');
  const [freeOnly, setFreeOnly] = useState(false);
  const [selected, setSelected] = useState<Kit | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [kitContent, setKitContent] = useState<KitContent | null>(null);
  const [contentLoading, setContentLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'guide' | 'cards' | 'quiz'>('info');
  const [cardIndex, setCardIndex] = useState(0);
  const [cardFlipped, setCardFlipped] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);

  useEffect(() => {
    load();
  }, [search, category, difficulty, freeOnly]);

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (category !== 'all') params.set('subject', category);
      if (difficulty !== 'all') params.set('difficulty', difficulty);
      if (freeOnly) params.set('free', 'true');
      const data = await apiFetch<{ kits: Kit[]; total: number; isPro: boolean }>(`/kits?${params}`);
      setKits(data.kits);
      setIsPro(data.isPro);
    } catch { toast.error('Kits konnten nicht geladen werden'); }
    finally { setLoading(false); }
  }

  async function openKit(kit: Kit) {
    if (kit.locked) {
      window.dispatchEvent(new CustomEvent('upgrade-required', {
        detail: { message: 'Upgrade auf LearnPro für Zugriff auf alle 100+ Kits.' }
      }));
      return;
    }
    setSelected(kit);
    setActiveTab('info');
    setKitContent(null);
    setCardIndex(0); setCardFlipped(false);
    setQuizIndex(0); setQuizAnswer(null); setQuizScore(0);
    setContentLoading(true);
    try {
      const data = await apiFetch<KitContent>(`/kits/${kit.id}/content`);
      setKitContent(data);
    } catch { /* content unavailable — that's ok */ }
    finally { setContentLoading(false); }
  }

  const freeCount = kits.filter(k => !k.isPro).length;
  const proCount = kits.filter(k => k.isPro).length;

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Zap className="w-5 h-5 text-white fill-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                {t.kits.title}
              </h1>
              <p className="text-sm text-slate-500">100+ fertige Lernpakete für alle Fächer</p>
            </div>
          </div>

          {/* Stats bar */}
          <div className="flex items-center gap-4 mt-4 flex-wrap">
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
              {freeCount} {t.kits.freeStat}
            </span>
            <span className="text-xs font-semibold text-violet-600 bg-violet-50 dark:bg-violet-950 px-3 py-1.5 rounded-full flex items-center gap-1">
              <Star className="w-3 h-3" /> {proCount} {t.kits.proStat}
            </span>
            {!isPro && (
              <button
                onClick={() => navigate('/billing')}
                className="text-xs font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-600 px-3 py-1.5 rounded-full hover:opacity-90 transition-opacity flex items-center gap-1"
              >
                <Zap className="w-3 h-3 fill-white" /> {t.kits.upgradeCta}
              </button>
            )}
          </div>
        </div>

        {/* Search + Filter bar */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Kit suchen… (z.B. Mathe, Python, Klimawandel)"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(f => !f)}
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${showFilters ? 'bg-indigo-50 dark:bg-indigo-950 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-400' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50'}`}
          >
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 mb-4 space-y-4">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{t.kits.subject}</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => setCategory(val)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${category === val ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-indigo-400'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{t.kits.difficulty}</p>
              <div className="flex flex-wrap gap-2">
                {['all', 'Basis', 'Standard', 'Erweitert'].map(d => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${difficulty === d ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-indigo-400'}`}
                  >
                    {d === 'all' ? t.kits.all : d === 'Basis' ? t.kits.basis : d === 'Erweitert' ? t.kits.erweitert : t.kits.standard}
                  </button>
                ))}
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={freeOnly} onChange={e => setFreeOnly(e.target.checked)} className="rounded accent-indigo-600" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t.kits.freeStat}</span>
            </label>
          </div>
        )}

        {/* Category pills (quick filter) */}
        {!showFilters && (
          <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-hide">
            {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
              <button
                key={val}
                onClick={() => setCategory(val)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${category === val ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-indigo-400'}`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : kits.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-semibold">{t.kits.noKits}</p>
            <p className="text-sm mt-1">{t.kits.noKitsDesc}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {kits.map(kit => (
              <button
                key={kit.id}
                onClick={() => openKit(kit)}
                className={`group text-left bg-white dark:bg-slate-900 rounded-2xl border shadow-sm p-4 transition-all hover:shadow-md hover:-translate-y-0.5 relative ${kit.locked ? 'opacity-75' : ''} ${kit.isPopular ? 'border-indigo-300 dark:border-indigo-700 ring-1 ring-indigo-200 dark:ring-indigo-800' : 'border-slate-100 dark:border-slate-800'}`}
              >
                {kit.isPopular && (
                  <span className="absolute -top-2 left-4 text-xs font-bold bg-indigo-600 text-white px-2 py-0.5 rounded-full">{t.kits.popular}</span>
                )}

                <div className="flex items-start justify-between mb-3">
                  <span className="text-2xl">{kit.emoji}</span>
                  <div className="flex items-center gap-1.5">
                    {kit.locked && <Lock className="w-3.5 h-3.5 text-slate-400" />}
                    {kit.isPro && !kit.locked && <Star className="w-3.5 h-3.5 text-violet-500" />}
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${DIFFICULTY_COLORS[kit.difficulty]}`}>
                      {kit.difficulty}
                    </span>
                  </div>
                </div>

                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm leading-snug mb-1 group-hover:text-indigo-600 transition-colors">
                  {kit.name}
                </h3>
                <p className="text-xs text-slate-500 mb-3 line-clamp-2">{kit.description}</p>

                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{kit.subject} · {t.kits.grade} {kit.grade}</span>
                  <span className="flex items-center gap-1">
                    <span>⏱</span> {kit.duration} Min
                  </span>
                </div>

                <div className="flex flex-wrap gap-1 mt-3">
                  {kit.includes.slice(0, 3).map(inc => {
                    const Icon = includeIcon(inc);
                    const label = inc.replace(/\s*\(.*?\)/, '').trim();
                    return (
                      <span key={inc} className="flex items-center gap-0.5 text-xs text-slate-500 bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 rounded-lg">
                        <Icon className="w-2.5 h-2.5" /> {label}
                      </span>
                    );
                  })}
                  {kit.includes.length > 3 && (
                    <span className="text-xs text-slate-400 bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 rounded-lg">+{kit.includes.length - 3}</span>
                  )}
                </div>

                {kit.locked && (
                  <div className="absolute inset-0 rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-[1px] flex items-center justify-center">
                    <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 shadow-sm">
                      <Lock className="w-3.5 h-3.5 text-violet-600" />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">PRO freischalten</span>
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Kit Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
          onClick={e => { if (e.target === e.currentTarget) setSelected(null); }}>
          <div className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg max-h-[92vh] flex flex-col shadow-2xl">

            {/* Header */}
            <div className="px-6 pt-6 pb-0 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selected.emoji}</span>
                  <div>
                    <h2 className="font-extrabold text-slate-900 dark:text-slate-100 text-lg leading-snug">{selected.name}</h2>
                    <p className="text-xs text-slate-500">{selected.subject} · Kl. {selected.grade} · {selected.duration} Min</p>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600 p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 -mb-px">
                {([
                  { id: 'info', label: t.kits.tabInfo },
                  { id: 'guide', label: t.kits.tabGuide, disabled: !kitContent },
                  { id: 'cards', label: `${t.kits.tabCards}${kitContent ? ` (${kitContent.flashcards.length})` : ''}`, disabled: !kitContent },
                  { id: 'quiz',  label: `${t.kits.tabQuiz}${kitContent ? ` (${kitContent.quiz.length})` : ''}`,  disabled: !kitContent },
                ] as const).map(tab => (
                  <button
                    key={tab.id}
                    disabled={'disabled' in tab && tab.disabled}
                    onClick={() => { setActiveTab(tab.id); setCardIndex(0); setCardFlipped(false); setQuizIndex(0); setQuizAnswer(null); setQuizScore(0); }}
                    className={`px-3 py-2 text-xs font-semibold border-b-2 transition-all whitespace-nowrap disabled:opacity-40 ${activeTab === tab.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto">
              {contentLoading && (
                <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>
              )}

              {/* INFO tab */}
              {!contentLoading && activeTab === 'info' && (
                <div className="px-6 py-5 space-y-5">
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{selected.description}</p>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-3">{t.kits.kitContains}</h3>
                    <div className="space-y-2">
                      {selected.includes.map(inc => {
                        const Icon = includeIcon(inc);
                        return (
                          <div key={inc} className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                            <div className="w-7 h-7 bg-indigo-50 dark:bg-indigo-950 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Icon className="w-3.5 h-3.5 text-indigo-600" />
                            </div>
                            {inc}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.tags.map(tag => (
                      <span key={tag} className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">#{tag}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* GUIDE tab */}
              {!contentLoading && activeTab === 'guide' && kitContent && (
                <div className="px-6 py-5">
                  <div className="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-mono bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                    {kitContent.studyGuide}
                  </div>
                </div>
              )}

              {/* FLASHCARDS tab */}
              {!contentLoading && activeTab === 'cards' && kitContent && (
                <div className="px-6 py-5">
                  <div className="text-xs text-slate-400 text-center mb-3">Karte {cardIndex + 1} von {kitContent.flashcards.length}</div>
                  <button
                    onClick={() => setCardFlipped(f => !f)}
                    className="w-full min-h-[180px] bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950 dark:to-violet-950 border border-indigo-200 dark:border-indigo-800 rounded-2xl p-6 text-center cursor-pointer hover:shadow-md transition-all"
                  >
                    <div className="text-xs font-semibold text-indigo-500 mb-3">{cardFlipped ? 'ANTWORT' : 'FRAGE'}</div>
                    <p className="text-slate-800 dark:text-slate-100 font-semibold text-sm leading-relaxed whitespace-pre-wrap">
                      {cardFlipped ? kitContent.flashcards[cardIndex].back : kitContent.flashcards[cardIndex].front}
                    </p>
                    <p className="text-xs text-slate-400 mt-4">Tippen zum Umdrehen</p>
                  </button>
                  <div className="flex items-center justify-between mt-4">
                    <button
                      onClick={() => { setCardIndex(i => Math.max(0, i - 1)); setCardFlipped(false); }}
                      disabled={cardIndex === 0}
                      className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >← Zurück</button>
                    <button onClick={() => { setCardIndex(0); setCardFlipped(false); }} className="p-2 text-slate-400 hover:text-slate-600">
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => { setCardIndex(i => Math.min(kitContent.flashcards.length - 1, i + 1)); setCardFlipped(false); }}
                      disabled={cardIndex === kitContent.flashcards.length - 1}
                      className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >Weiter →</button>
                  </div>
                </div>
              )}

              {/* QUIZ tab */}
              {!contentLoading && activeTab === 'quiz' && kitContent && (
                <div className="px-6 py-5">
                  {quizIndex < kitContent.quiz.length ? (
                    <>
                      <div className="text-xs text-slate-400 mb-2">Frage {quizIndex + 1} von {kitContent.quiz.length} · Punkte: {quizScore}</div>
                      <p className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-4">{kitContent.quiz[quizIndex].q}</p>
                      <div className="space-y-2">
                        {kitContent.quiz[quizIndex].opts.map((opt, i) => {
                          const isSelected = quizAnswer === i;
                          const isCorrect = i === kitContent.quiz[quizIndex].correct;
                          const revealed = quizAnswer !== null;
                          return (
                            <button
                              key={i}
                              onClick={() => {
                                if (quizAnswer !== null) return;
                                setQuizAnswer(i);
                                if (i === kitContent.quiz[quizIndex].correct) setQuizScore(s => s + 1);
                              }}
                              className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                                !revealed ? 'border-slate-200 dark:border-slate-700 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950' :
                                isCorrect ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' :
                                isSelected ? 'border-red-400 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300' :
                                'border-slate-100 dark:border-slate-800 opacity-50'
                              }`}
                            >
                              <span className="flex items-center gap-2">
                                {revealed && isCorrect && <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
                                {revealed && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />}
                                {opt}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                      {quizAnswer !== null && (
                        <div className="mt-3 bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                          <p className="text-xs text-slate-600 dark:text-slate-400">{kitContent.quiz[quizIndex].exp}</p>
                          <button
                            onClick={() => { setQuizIndex(i => i + 1); setQuizAnswer(null); }}
                            className="mt-3 w-full py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700"
                          >{quizIndex + 1 < kitContent.quiz.length ? 'Nächste Frage →' : 'Auswertung →'}</button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-3">{quizScore === kitContent.quiz.length ? '🏆' : quizScore >= kitContent.quiz.length * 0.7 ? '🎉' : '📚'}</div>
                      <p className="font-extrabold text-2xl text-slate-900 dark:text-slate-100">{quizScore}/{kitContent.quiz.length}</p>
                      <p className="text-slate-500 text-sm mt-1">
                        {quizScore === kitContent.quiz.length ? 'Perfekt! Alle Fragen richtig.' : quizScore >= kitContent.quiz.length * 0.7 ? 'Gut gemacht! Fast geschafft.' : 'Noch etwas üben – du schaffst das!'}
                      </p>
                      <button onClick={() => { setQuizIndex(0); setQuizAnswer(null); setQuizScore(0); }} className="mt-5 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700">
                        Nochmal versuchen
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* CTA */}
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex gap-3">
              <button
                onClick={() => { setSelected(null); navigate('/create'); }}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 fill-white" /> Mit diesem Kit lernen
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => { setSelected(null); navigate('/examiner'); }}
                className="px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                🎓 Prüfung
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
