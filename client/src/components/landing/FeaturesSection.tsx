import { motion } from 'framer-motion';
import { Layers, HelpCircle, FileText, Globe, Moon, Upload } from 'lucide-react';
import { useTranslation } from '../../i18n';

const icons = [Layers, HelpCircle, FileText, Globe, Moon, Upload];
const colors = ['from-indigo-500 to-purple-500', 'from-purple-500 to-pink-500', 'from-emerald-500 to-teal-500', 'from-sky-500 to-blue-500', 'from-slate-500 to-slate-700', 'from-orange-500 to-amber-500'];

export default function FeaturesSection() {
  const { t } = useTranslation();
  const features = [
    { title: t.features.f1title, desc: t.features.f1desc },
    { title: t.features.f2title, desc: t.features.f2desc },
    { title: t.features.f3title, desc: t.features.f3desc },
    { title: t.features.f4title, desc: t.features.f4desc },
    { title: t.features.f5title, desc: t.features.f5desc },
    { title: t.features.f6title, desc: t.features.f6desc },
  ];

  return (
    <section className="py-24 px-6 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100 mb-3">{t.features.heading}</h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg">{t.features.sub}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => {
            const Icon = icons[i];
            return (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="bg-white dark:bg-slate-800 rounded-2xl p-7 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 bg-gradient-to-br ${colors[i]} rounded-xl flex items-center justify-center mb-5`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg mb-2">{f.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
