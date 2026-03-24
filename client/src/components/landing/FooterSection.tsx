import { Zap } from 'lucide-react';
import { useTranslation } from '../../i18n';

export default function FooterSection() {
  const { t } = useTranslation();
  return (
    <footer className="py-10 border-t border-slate-100 dark:border-slate-800 px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white fill-white" />
          </div>
          <span className="font-bold text-slate-700 dark:text-slate-300">StudyBuild</span>
        </div>
        <p className="text-sm text-slate-400">{t.footer.copy}</p>
      </div>
    </footer>
  );
}
