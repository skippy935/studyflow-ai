import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import Button    from '../components/ui/Button';
import Spinner   from '../components/ui/Spinner';
import { apiFetch } from '../lib/api';
import type { Summary } from '../types';

function renderMarkdown(md: string): string {
  return md
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-6 mb-3">$1</h2>')
    .replace(/^### (.+)$/gm,'<h3 class="text-base font-bold text-slate-800 dark:text-slate-200 mt-4 mb-2">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g,'<strong class="font-semibold text-slate-900 dark:text-slate-100">$1</strong>')
    .replace(/^- (.+)$/gm,'<li class="text-slate-700 dark:text-slate-300 ml-4 list-disc">$1</li>')
    .replace(/^(\d+)\. (.+)$/gm,'<li class="text-slate-700 dark:text-slate-300 ml-4 list-decimal"><strong>$1.</strong> $2</li>')
    .replace(/\n\n/g,'</p><p class="text-slate-600 dark:text-slate-400 leading-relaxed">')
    .replace(/^([^<\n].+)$/gm, line => line.startsWith('<') ? line : `<p class="text-slate-600 dark:text-slate-400 leading-relaxed">${line}</p>`)
    .replace(/<p[^>]*><\/p>/g,'');
}

export default function SummaryPage() {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<{ summary: Summary }>(`/summaries/${id}`)
      .then(d => setSummary(d.summary))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <AppLayout><div className="flex justify-center py-20"><Spinner size="lg" /></div></AppLayout>;
  if (!summary) return <AppLayout><p className="text-slate-500">Summary not found.</p></AppLayout>;

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </button>
          <Button variant="ghost" size="sm" onClick={() => window.print()}>
            <Printer className="w-4 h-4" /> Print
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mb-1">{summary.title}</h1>
          {summary.topic && <p className="text-sm text-slate-400">{summary.topic}</p>}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8">
          <div
            className="prose-content"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(summary.content) }}
          />
        </div>
      </div>
    </AppLayout>
  );
}
