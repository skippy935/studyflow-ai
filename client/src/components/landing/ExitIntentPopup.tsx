import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../i18n';

export default function ExitIntentPopup() {
  const { lang } = useTranslation();
  const navigate  = useNavigate();
  const [show, setShow] = useState(false);
  const dismissed = sessionStorage.getItem('exit_popup_dismissed');

  useEffect(() => {
    if (dismissed) return;
    const handler = (e: MouseEvent) => {
      if (e.clientY <= 20 && !show) setShow(true);
    };
    document.addEventListener('mouseleave', handler);
    return () => document.removeEventListener('mouseleave', handler);
  }, [show, dismissed]);

  function dismiss() {
    setShow(false);
    sessionStorage.setItem('exit_popup_dismissed', '1');
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={dismiss}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25 }}
            onClick={e => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-2xl max-w-md w-full text-center"
          >
            <button onClick={dismiss} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
              <X className="w-4 h-4 text-slate-400" />
            </button>
            <div className="text-4xl mb-4">⏳</div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-2">
              {lang === 'de' ? 'Warte!' : 'Wait!'}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {lang === 'de'
                ? 'Erhalte 30 Tage Premium statt 14, wenn du dich jetzt anmeldest.'
                : 'Get 30 days Premium instead of 14 if you sign up right now.'}
            </p>
            <button onClick={() => { dismiss(); navigate('/register'); }}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl mb-3 transition-all hover:scale-105">
              {lang === 'de' ? 'Angebot einlösen →' : 'Claim offer →'}
            </button>
            <button onClick={dismiss} className="text-sm text-slate-400 hover:text-slate-600 transition-colors">
              {lang === 'de' ? 'Nein, danke' : 'No thanks'}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
