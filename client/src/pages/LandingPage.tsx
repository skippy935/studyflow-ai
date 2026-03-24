import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Zap, Moon, Sun } from 'lucide-react';
import IntroSequence       from '../components/landing/IntroSequence';
import HeroSection         from '../components/landing/HeroSection';
import FeaturesSection     from '../components/landing/FeaturesSection';
import PricingSection      from '../components/landing/PricingSection';
import TestimonialsSection from '../components/landing/TestimonialsSection';
import FooterSection       from '../components/landing/FooterSection';
import ExitIntentPopup     from '../components/landing/ExitIntentPopup';
import { useTranslation }  from '../i18n';

const seen = sessionStorage.getItem('sb_intro_seen');

export default function LandingPage() {
  const [showIntro, setShowIntro] = useState(!seen);
  const { t, lang, setLang }      = useTranslation();
  const navigate = useNavigate();
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('sb_theme', next ? 'dark' : 'light');
  }

  function doneIntro() {
    sessionStorage.setItem('sb_intro_seen', '1');
    setShowIntro(false);
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Cinematic intro */}
      <AnimatePresence>{showIntro && <IntroSequence onDone={doneIntro} />}</AnimatePresence>

      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
              <Zap className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="font-extrabold text-slate-900 dark:text-slate-100 text-lg tracking-tight">StudyBuild</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setLang(lang === 'en' ? 'de' : 'en')} className="text-xs font-bold px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-indigo-600 transition-colors">
              {lang === 'en' ? 'DE' : 'EN'}
            </button>
            <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500">
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button onClick={() => navigate('/login')} className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              {t.nav.signIn}
            </button>
            <button onClick={() => navigate('/register')} className="text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl transition-colors shadow-sm">
              {t.nav.getStarted}
            </button>
          </div>
        </div>
      </nav>

      <HeroSection />
      <FeaturesSection />
      <PricingSection />
      <TestimonialsSection />

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-r from-indigo-600 to-purple-700 px-6 text-center">
        <h2 className="text-4xl font-extrabold text-white mb-3">{t.cta.heading}</h2>
        <p className="text-indigo-200 text-lg mb-8">{t.cta.sub}</p>
        <button onClick={() => navigate('/register')}
          className="inline-block bg-white text-indigo-600 font-bold px-8 py-4 rounded-2xl text-base hover:bg-indigo-50 transition-all hover:scale-105 shadow-xl">
          {t.cta.btn}
        </button>
      </section>

      <FooterSection />
      <ExitIntentPopup />
    </div>
  );
}
