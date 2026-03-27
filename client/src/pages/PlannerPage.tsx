import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Check, Calendar, Layers, BookOpen, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import AppLayout from '../components/layout/AppLayout';
import Button from '../components/ui/Button';
import { apiFetch } from '../lib/api';
import type { Deck } from '../types';

interface StudyTask {
  id: number;
  title: string;
  notes: string;
  dueDate: string | null;
  done: boolean;
  deckId: number | null;
  deck: { id: number; name: string; color: string } | null;
  createdAt: string;
}

type Filter = 'active' | 'done' | 'all';

function dueBadge(dueDate: string | null, done: boolean): { label: string; cls: string } | null {
  if (!dueDate || done) return null;
  const due  = new Date(dueDate);
  const now  = new Date();
  const diff = Math.ceil((due.getTime() - now.setHours(0,0,0,0)) / 86400000);
  if (diff < 0)  return { label: `${Math.abs(diff)}d overdue`, cls: 'bg-red-100 dark:bg-red-950 text-red-600' };
  if (diff === 0) return { label: 'Due today',                  cls: 'bg-orange-100 dark:bg-orange-950 text-orange-600' };
  if (diff <= 3)  return { label: `Due in ${diff}d`,             cls: 'bg-amber-100 dark:bg-amber-950 text-amber-600' };
  return { label: new Date(dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), cls: 'bg-slate-100 dark:bg-slate-800 text-slate-500' };
}

export default function PlannerPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [tasks,  setTasks]  = useState<StudyTask[]>([]);
  const [decks,  setDecks]  = useState<Deck[]>([]);
  const [filter, setFilter] = useState<Filter>('active');
  const [loading, setLoading] = useState(true);

  // New task form state
  const [showForm,  setShowForm]  = useState(false);
  const [newTitle,  setNewTitle]  = useState('');
  const [newDue,    setNewDue]    = useState('');
  const [newDeckId, setNewDeckId] = useState<string>('');
  const [newNotes,  setNewNotes]  = useState('');
  const [saving,    setSaving]    = useState(false);

  useEffect(() => {
    Promise.all([
      apiFetch<{ tasks: StudyTask[] }>('/planner').then(d => setTasks(d.tasks)),
      apiFetch<{ decks: Deck[] }>('/decks').then(d => setDecks(d.decks)),
    ]).finally(() => setLoading(false));
  }, []);

  // Pre-fill from examiner gap analysis CTA: ?gaps=Concept+A,Concept+B
  useEffect(() => {
    const gaps = searchParams.get('gaps');
    if (!gaps) return;
    const titles = gaps.split(',').map(g => g.trim()).filter(Boolean);
    if (titles.length === 0) return;
    (async () => {
      const created: StudyTask[] = [];
      for (const title of titles) {
        try {
          const data = await apiFetch<{ task: StudyTask }>('/planner', {
            method: 'POST',
            body: JSON.stringify({ title }),
          });
          created.push(data.task);
        } catch {}
      }
      if (created.length > 0) {
        setTasks(prev => [...created, ...prev]);
        toast.success(`${created.length} gap${created.length > 1 ? 's' : ''} added to planner`);
        setFilter('active');
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function addTask() {
    if (!newTitle.trim()) { toast.error('Enter a task title'); return; }
    setSaving(true);
    try {
      const data = await apiFetch<{ task: StudyTask }>('/planner', {
        method: 'POST',
        body: JSON.stringify({
          title:  newTitle.trim(),
          notes:  newNotes.trim(),
          dueDate: newDue || null,
          deckId:  newDeckId || null,
        }),
      });
      setTasks(prev => [data.task, ...prev]);
      setNewTitle(''); setNewDue(''); setNewDeckId(''); setNewNotes('');
      setShowForm(false);
      toast.success('Task added');
    } catch {
      toast.error('Failed to add task');
    } finally {
      setSaving(false);
    }
  }

  async function toggleDone(task: StudyTask) {
    try {
      const data = await apiFetch<{ task: StudyTask }>(`/planner/${task.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ done: !task.done }),
      });
      setTasks(prev => prev.map(t => t.id === task.id ? data.task : t));
    } catch {
      toast.error('Failed to update task');
    }
  }

  async function deleteTask(id: number) {
    await apiFetch(`/planner/${id}`, { method: 'DELETE' });
    setTasks(prev => prev.filter(t => t.id !== id));
    toast.success('Task removed');
  }

  const filtered = tasks.filter(t =>
    filter === 'all'    ? true :
    filter === 'done'   ? t.done :
    /* active */          !t.done
  );

  const overdue  = filtered.filter(t => !t.done && t.dueDate && new Date(t.dueDate) < new Date());
  const today    = filtered.filter(t => !t.done && t.dueDate && dueBadge(t.dueDate, false)?.label === 'Due today');
  const upcoming = filtered.filter(t => !t.done && (!t.dueDate || (dueBadge(t.dueDate, false) && !overdue.includes(t) && !today.includes(t))));
  const done     = filtered.filter(t => t.done);

  const activeDone = tasks.filter(t => t.done).length;
  const activeTotal = tasks.length;

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-indigo-600" /> Study Planner
            </h1>
            {activeTotal > 0 && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {activeDone} of {activeTotal} tasks complete
              </p>
            )}
          </div>
          <Button size="sm" onClick={() => setShowForm(v => !v)}>
            <Plus className="w-4 h-4" /> Add Task
          </Button>
        </div>

        {/* Add task form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-5">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 space-y-3">
                <input
                  autoFocus
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addTask()}
                  placeholder="Task title (e.g. Revise Chapter 4 — Cell Division)"
                  className="w-full text-sm font-medium bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none border-b border-slate-100 dark:border-slate-800 pb-2"
                />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Due date (optional)</label>
                    <input
                      type="date"
                      value={newDue}
                      onChange={e => setNewDue(e.target.value)}
                      className="w-full text-sm bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl px-3 py-2 outline-none border border-slate-100 dark:border-slate-700"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Link to deck (optional)</label>
                    <div className="relative">
                      <select
                        value={newDeckId}
                        onChange={e => setNewDeckId(e.target.value)}
                        className="w-full text-sm bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl px-3 py-2 outline-none border border-slate-100 dark:border-slate-700 appearance-none pr-8">
                        <option value="">No deck</option>
                        {decks.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                      <ChevronDown className="absolute right-2 top-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
                <textarea
                  value={newNotes}
                  onChange={e => setNewNotes(e.target.value)}
                  placeholder="Notes (optional)"
                  rows={2}
                  className="w-full text-sm bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl px-3 py-2 outline-none border border-slate-100 dark:border-slate-700 resize-none"
                />
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
                  <Button size="sm" loading={saving} onClick={addTask}>Add Task</Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filter tabs */}
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mb-5 w-fit">
          {(['active', 'done', 'all'] as Filter[]).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all capitalize ${filter === f ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
              {f} {f === 'active' ? `(${tasks.filter(t => !t.done).length})` : f === 'done' ? `(${activeDone})` : `(${activeTotal})`}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20 text-slate-400">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-950 rounded-2xl flex items-center justify-center text-2xl mb-4">📋</div>
            <p className="text-slate-400 mb-3">
              {filter === 'done' ? 'No completed tasks yet.' : filter === 'active' ? 'All clear! No pending tasks.' : 'No tasks yet.'}
            </p>
            <Button variant="ghost" size="sm" onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4" /> Add your first task
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {filter === 'active' && overdue.length > 0 && (
              <TaskGroup label="Overdue" labelCls="text-red-500" tasks={overdue}
                onToggle={toggleDone} onDelete={deleteTask} onNavigate={navigate} />
            )}
            {filter === 'active' && today.length > 0 && (
              <TaskGroup label="Due Today" labelCls="text-orange-500" tasks={today}
                onToggle={toggleDone} onDelete={deleteTask} onNavigate={navigate} />
            )}
            {filter === 'active' && upcoming.length > 0 && (
              <TaskGroup label="Upcoming" labelCls="text-slate-500 dark:text-slate-400" tasks={upcoming}
                onToggle={toggleDone} onDelete={deleteTask} onNavigate={navigate} />
            )}
            {(filter === 'done' || filter === 'all') && done.length > 0 && (
              <TaskGroup label="Completed" labelCls="text-emerald-500" tasks={done}
                onToggle={toggleDone} onDelete={deleteTask} onNavigate={navigate} />
            )}
            {filter === 'all' && upcoming.length > 0 && (
              <TaskGroup label="Active" labelCls="text-slate-500 dark:text-slate-400" tasks={[...overdue, ...today, ...upcoming]}
                onToggle={toggleDone} onDelete={deleteTask} onNavigate={navigate} />
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function TaskGroup({ label, labelCls, tasks, onToggle, onDelete, onNavigate }: {
  label: string;
  labelCls: string;
  tasks: StudyTask[];
  onToggle: (t: StudyTask) => void;
  onDelete: (id: number) => void;
  onNavigate: ReturnType<typeof useNavigate>;
}) {
  return (
    <div>
      <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${labelCls}`}>{label}</p>
      <div className="space-y-2">
        {tasks.map(task => <TaskRow key={task.id} task={task} onToggle={onToggle} onDelete={onDelete} onNavigate={onNavigate} />)}
      </div>
    </div>
  );
}

function TaskRow({ task, onToggle, onDelete, onNavigate }: {
  task: StudyTask;
  onToggle: (t: StudyTask) => void;
  onDelete: (id: number) => void;
  onNavigate: ReturnType<typeof useNavigate>;
}) {
  const badge = dueBadge(task.dueDate, task.done);
  return (
    <motion.div layout initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
      className={`flex items-start gap-3 p-4 rounded-2xl border transition-all ${task.done ? 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 opacity-60' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:shadow-sm'}`}>

      {/* Checkbox */}
      <button
        onClick={() => onToggle(task)}
        className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${task.done ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 dark:border-slate-600 hover:border-indigo-400'}`}>
        {task.done && <Check className="w-3 h-3 text-white" />}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${task.done ? 'line-through text-slate-400' : 'text-slate-900 dark:text-slate-100'}`}>
          {task.title}
        </p>
        {task.notes && (
          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{task.notes}</p>
        )}
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {badge && (
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badge.cls}`}>
              {badge.label}
            </span>
          )}
          {task.deck && (
            <button
              onClick={() => onNavigate(`/deck/${task.deck!.id}`)}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-600 transition-colors">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: task.deck.color }} />
              <Layers className="w-3 h-3" />
              {task.deck.name}
            </button>
          )}
          {task.deck && (
            <button
              onClick={() => onNavigate(`/study/${task.deck!.id}`)}
              className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 transition-colors">
              <BookOpen className="w-3 h-3" /> Study now
            </button>
          )}
        </div>
      </div>

      {/* Delete */}
      <button
        onClick={() => onDelete(task.id)}
        className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors flex-shrink-0">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}
