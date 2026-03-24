import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../i18n';

export default function PricingSection() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const plans = [
    { key: 'free' as const,    price: '€0',    cta: t.pricing.freeCta,    highlight: false },
    { key: 'premium' as const, price: '€9.99', cta: t.pricing.premiumCta, highlight: true },
    { key: 'student' as const, price: '€4.99', cta: t.pricing.studentCta, highlight: false },
  ];

  const names = { free: t.pricing.free, premium: t.pricing.premium, student: t.pricing.student };
  const allFeatures = {
    free:    t.pricing.features.free,
    premium: t.pricing.features.premium,
    student: t.pricing.features.student,
  };

  return (
    <section className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100 mb-3">{t.pricing.heading}</h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg">{t.pricing.sub}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {plans.map(({ key, price, cta, highlight }, i) => (
            <motion.div key={key}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className={`relative rounded-3xl p-8 border-2 transition-all ${highlight ? 'border-indigo-600 bg-indigo-600 text-white shadow-2xl shadow-indigo-200 dark:shadow-indigo-900 scale-105' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'}`}>
              {highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold px-4 py-1.5 rounded-full">
                  {t.pricing.popular}
                </div>
              )}
              <div className={`text-sm font-bold mb-2 ${highlight ? 'text-indigo-200' : 'text-slate-500 dark:text-slate-400'}`}>{names[key]}</div>
              <div className="flex items-baseline gap-1 mb-6">
                <span className={`text-4xl font-black ${highlight ? 'text-white' : 'text-slate-900 dark:text-slate-100'}`}>{price}</span>
                <span className={`text-sm ${highlight ? 'text-indigo-200' : 'text-slate-400'}`}>{t.pricing.perMonth}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {allFeatures[key].map((f, fi) => (
                  <li key={fi} className={`flex items-center gap-2.5 text-sm ${highlight ? 'text-indigo-100' : 'text-slate-600 dark:text-slate-300'}`}>
                    <Check className={`w-4 h-4 flex-shrink-0 ${highlight ? 'text-white' : 'text-emerald-500'}`} />
                    {f}
                  </li>
                ))}
              </ul>
              <button onClick={() => navigate('/register')}
                className={`w-full py-3 rounded-2xl font-semibold text-sm transition-all hover:scale-105 active:scale-95 ${highlight ? 'bg-white text-indigo-600 hover:bg-indigo-50' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
                {cta}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
