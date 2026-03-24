import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';
import { useTranslation } from '../../i18n';

interface Props { onDone: () => void; }

function Particle({ style }: { style: React.CSSProperties }) {
  return <div className="particle" style={style} />;
}

const TAGLINE_EN = 'Learn smarter. Not harder.';
const TAGLINE_DE = 'Lerne smarter. Nicht härter.';

export default function IntroSequence({ onDone }: Props) {
  const { lang } = useTranslation();
  const tagline = lang === 'de' ? TAGLINE_DE : TAGLINE_EN;
  const [charIndex, setCharIndex] = useState(0);
  const [showCTA, setShowCTA] = useState(false);

  const particles = Array.from({ length: 20 }, (_, i) => ({
    width:  `${Math.random() * 6 + 2}px`,
    height: `${Math.random() * 6 + 2}px`,
    left:   `${Math.random() * 100}%`,
    animationDuration: `${Math.random() * 8 + 6}s`,
    animationDelay:    `${Math.random() * 4}s`,
    opacity: Math.random() * 0.7 + 0.3,
  }));

  useEffect(() => {
    if (charIndex < tagline.length) {
      const t = setTimeout(() => setCharIndex(i => i + 1), 55);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => setShowCTA(true), 300);
      return () => clearTimeout(t);
    }
  }, [charIndex, tagline.length]);

  // Auto-dismiss after 5s
  useEffect(() => {
    const t = setTimeout(onDone, 5000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center overflow-hidden cursor-pointer"
      onClick={onDone}
    >
      {/* Particles */}
      {particles.map((p, i) => <Particle key={i} style={p} />)}

      {/* Radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.15)_0%,transparent_70%)]" />

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, type: 'spring', damping: 15 }}
        className="flex flex-col items-center mb-8"
      >
        <motion.div
          animate={{ boxShadow: ['0 0 20px rgba(99,102,241,0.4)', '0 0 60px rgba(99,102,241,0.8)', '0 0 20px rgba(99,102,241,0.4)'] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl flex items-center justify-center mb-5"
        >
          <Zap className="w-10 h-10 text-white fill-white" />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-4xl font-black text-white tracking-tight"
        >
          StudyBuild
        </motion.h1>
      </motion.div>

      {/* Typewriter tagline */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0 }}
        className="text-xl text-slate-300 font-medium mb-10 min-h-[28px]"
      >
        {tagline.slice(0, charIndex)}
        <span className="inline-block w-0.5 h-5 bg-indigo-400 ml-0.5 animate-pulse align-middle" />
      </motion.p>

      {/* CTA */}
      <AnimatePresence>
        {showCTA && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0, boxShadow: ['0 0 0 0 rgba(99,102,241,0.4)', '0 0 0 12px rgba(99,102,241,0)', '0 0 0 0 rgba(99,102,241,0)'] }}
            transition={{ boxShadow: { duration: 1.5, repeat: Infinity } }}
            exit={{ opacity: 0 }}
            onClick={onDone}
            className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-2xl text-base transition-colors"
          >
            Get Started →
          </motion.button>
        )}
      </AnimatePresence>

      {/* Skip hint */}
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }} className="absolute bottom-8 text-slate-600 text-sm">
        Click anywhere to skip
      </motion.p>
    </motion.div>
  );
}
