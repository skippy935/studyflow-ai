import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { useTranslation } from '../../i18n';

export default function TestimonialsSection() {
  const { t } = useTranslation();
  const items = t.testimonials.items;
  const [index, setIndex] = useState(0);

  const prev = () => setIndex(i => (i - 1 + items.length) % items.length);
  const next = () => setIndex(i => (i + 1) % items.length);

  return (
    <section className="py-24 px-6 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100 mb-12">{t.testimonials.heading}</h2>
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div key={index}
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="bg-white dark:bg-slate-800 rounded-3xl p-10 shadow-sm border border-slate-100 dark:border-slate-700">
              <div className="flex justify-center gap-1 mb-6">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />)}
              </div>
              <p className="text-xl text-slate-700 dark:text-slate-300 leading-relaxed mb-6 italic">"{items[index].quote}"</p>
              <div>
                <p className="font-bold text-slate-900 dark:text-slate-100">{items[index].name}</p>
                <p className="text-sm text-slate-400">{items[index].role}</p>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-center gap-4 mt-8">
            <button onClick={prev} className="p-2 rounded-full border border-slate-200 dark:border-slate-700 hover:border-indigo-400 hover:text-indigo-600 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex gap-2">
              {items.map((_, i) => (
                <button key={i} onClick={() => setIndex(i)} className={`w-2 h-2 rounded-full transition-all ${i === index ? 'bg-indigo-600 w-6' : 'bg-slate-300 dark:bg-slate-600'}`} />
              ))}
            </div>
            <button onClick={next} className="p-2 rounded-full border border-slate-200 dark:border-slate-700 hover:border-indigo-400 hover:text-indigo-600 transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
