import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, CheckCircle } from 'lucide-react';
import { useTranslation } from '../../i18n';

export default function HeroSection() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <section className="relative pt-32 pb-24 px-6 text-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/80 via-transparent to-transparent dark:from-indigo-950/30 pointer-events-none" />
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-400/10 dark:bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-4xl mx-auto">
        {/* Badge */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-bold px-4 py-2 rounded-full mb-8">
          <Zap className="w-3 h-3 fill-current" /> {t.hero.badge}
        </motion.div>

        {/* Headline */}
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="text-5xl sm:text-6xl lg:text-7xl font-black text-slate-900 dark:text-slate-100 leading-[1.1] tracking-tight mb-6">
          {t.hero.title}<br />
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {t.hero.titleHighlight}
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          {t.hero.subtitle}
        </motion.p>

        {/* CTAs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <button onClick={() => navigate('/register')}
            className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-base shadow-xl shadow-indigo-200 dark:shadow-indigo-900 transition-all hover:scale-105 active:scale-95">
            {t.hero.cta}
          </button>
          <button onClick={() => navigate('/login')}
            className="w-full sm:w-auto px-8 py-4 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-2xl text-base hover:border-indigo-300 hover:text-indigo-600 transition-all">
            {t.hero.login}
          </button>
        </motion.div>

        {/* Trust badges */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400">
          {[t.hero.trust1, t.hero.trust2].map(text => (
            <span key={text} className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-500" /> {text}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
