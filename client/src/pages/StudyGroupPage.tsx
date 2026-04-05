import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, Copy, LogIn, BookOpen, Trash2, LogOut, Trophy } from 'lucide-react';
import toast from 'react-hot-toast';
import AppLayout from '../components/layout/AppLayout';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import { apiFetch } from '../lib/api';
import { levelFromXP } from '../lib/xp';
import type { Deck } from '../types';

interface GroupSummary {
  id: number;
  name: string;
  description: string;
  joinCode: string;
  owner: { id: number; displayName: string };
  _count: { members: number; sharedDecks: number };
  joinedAt: string;
}

interface GroupDetail {
  id: number;
  name: string;
  description: string;
  joinCode: string;
  ownerId: number;
  owner: { id: number; displayName: string };
  members: Array<{ id: number; userId: number; joinedAt: string; user: { id: number; displayName: string; xp: number; streak: number } }>;
  sharedDecks: Array<{ id: number; deckId: number; sharedAt: string; deck: { id: number; name: string; color: string; _count: { cards: number } } }>;
}

export default function StudyGroupPage() {
  const navigate = useNavigate();
  const [groups, setGroups]   = useState<GroupSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<GroupDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Create form
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName]     = useState('');
  const [newDesc, setNewDesc]     = useState('');
  const [creating, setCreating]   = useState(false);

  // Join form
  const [showJoin, setShowJoin] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining]   = useState(false);

  // Share deck
  const [myDecks, setMyDecks] = useState<Deck[]>([]);
  const [shareDeckId, setShareDeckId] = useState('');
  const [sharing, setSharing] = useState(false);

  const myUserId = (() => {
    try { return JSON.parse(atob(localStorage.getItem('token')?.split('.')[1] ?? '')).sub as number; } catch { return 0; }
  })();

  useEffect(() => {
    Promise.all([
      apiFetch<{ groups: GroupSummary[] }>('/groups').then(d => setGroups(d.groups)),
      apiFetch<{ decks: Deck[] }>('/decks').then(d => setMyDecks(d.decks)),
    ]).catch(() => {}).finally(() => setLoading(false));
  }, []);

  async function loadDetail(id: number) {
    setDetailLoading(true);
    try {
      const d = await apiFetch<{ group: GroupDetail }>(`/groups/${id}`);
      setSelected(d.group);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load group');
    } finally {
      setDetailLoading(false);
    }
  }

  async function createGroup() {
    if (!newName.trim()) { toast.error('Enter a group name'); return; }
    setCreating(true);
    try {
      const d = await apiFetch<{ group: GroupSummary }>('/groups', {
        method: 'POST',
        body: JSON.stringify({ name: newName.trim(), description: newDesc.trim() }),
      });
      setGroups(prev => [d.group, ...prev]);
      setNewName(''); setNewDesc(''); setShowCreate(false);
      toast.success('Group created!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    } finally {
      setCreating(false);
    }
  }

  async function joinGroup() {
    if (!joinCode.trim()) { toast.error('Enter a join code'); return; }
    setJoining(true);
    try {
      const d = await apiFetch<{ group: GroupSummary }>('/groups/join', {
        method: 'POST',
        body: JSON.stringify({ joinCode: joinCode.trim().toUpperCase() }),
      });
      setGroups(prev => prev.some(g => g.id === d.group.id) ? prev : [d.group, ...prev]);
      setJoinCode(''); setShowJoin(false);
      toast.success(`Joined "${d.group.name}"!`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    } finally {
      setJoining(false);
    }
  }

  async function shareDeck() {
    if (!selected || !shareDeckId) return;
    setSharing(true);
    try {
      await apiFetch(`/groups/${selected.id}/share`, {
        method: 'POST',
        body: JSON.stringify({ deckId: parseInt(shareDeckId) }),
      });
      toast.success('Deck shared with group');
      setShareDeckId('');
      await loadDetail(selected.id);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    } finally {
      setSharing(false);
    }
  }

  async function leaveGroup(id: number) {
    if (!confirm('Leave this group?')) return;
    try {
      await apiFetch(`/groups/${id}/leave`, { method: 'DELETE' });
      setGroups(prev => prev.filter(g => g.id !== id));
      if (selected?.id === id) setSelected(null);
      toast.success('Left group');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    }
  }

  async function deleteGroup(id: number) {
    if (!confirm('Delete this group? This cannot be undone.')) return;
    try {
      await apiFetch(`/groups/${id}`, { method: 'DELETE' });
      setGroups(prev => prev.filter(g => g.id !== id));
      if (selected?.id === id) setSelected(null);
      toast.success('Group deleted');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    }
  }

  if (loading) return <AppLayout><div className="flex justify-center py-20"><Spinner size="lg" /></div></AppLayout>;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-950 rounded-2xl flex items-center justify-center">
              <Users className="w-5 h-5 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">Study Groups</h1>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => { setShowJoin(v => !v); setShowCreate(false); }}>
              <LogIn className="w-4 h-4" /> Join
            </Button>
            <Button size="sm" onClick={() => { setShowCreate(v => !v); setShowJoin(false); }}>
              <Plus className="w-4 h-4" /> Create
            </Button>
          </div>
        </div>

        {/* Create form */}
        {showCreate && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 mb-5 space-y-3">
            <p className="font-bold text-slate-800 dark:text-slate-200">New Study Group</p>
            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Group name"
              className="w-full text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2 outline-none border border-slate-200 dark:border-slate-700" />
            <input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Description (optional)"
              className="w-full text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2 outline-none border border-slate-200 dark:border-slate-700" />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button size="sm" loading={creating} onClick={createGroup}>Create Group</Button>
            </div>
          </div>
        )}

        {/* Join form */}
        {showJoin && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 mb-5 space-y-3">
            <p className="font-bold text-slate-800 dark:text-slate-200">Join a Group</p>
            <input value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} placeholder="Enter 6-character code"
              maxLength={6}
              className="w-full text-sm font-mono tracking-widest bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2 outline-none border border-slate-200 dark:border-slate-700 uppercase" />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowJoin(false)}>Cancel</Button>
              <Button size="sm" loading={joining} onClick={joinGroup}>Join</Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Group list */}
          <div className="space-y-3">
            {groups.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-semibold">No groups yet</p>
                <p className="text-sm mt-1">Create one or join with a code.</p>
              </div>
            ) : groups.map(g => (
              <button key={g.id} onClick={() => loadDetail(g.id)}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${selected?.id === g.id ? 'border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-950' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-sm'}`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">{g.name}</p>
                    {g.description && <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{g.description}</p>}
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                      <span>{g._count.members} member{g._count.members !== 1 ? 's' : ''}</span>
                      <span>{g._count.sharedDecks} deck{g._count.sharedDecks !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-300 dark:text-slate-600 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">{g.joinCode}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Group detail */}
          <div>
            {detailLoading ? (
              <div className="flex justify-center py-10"><Spinner /></div>
            ) : selected ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-extrabold text-slate-900 dark:text-slate-100">{selected.name}</p>
                    {selected.description && <p className="text-xs text-slate-400 mt-0.5">{selected.description}</p>}
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => { navigator.clipboard.writeText(selected.joinCode); toast.success('Code copied!'); }}
                      className="flex items-center gap-1 text-xs font-mono font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-2 py-1 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors">
                      {selected.joinCode} <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Members */}
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Members</p>
                  <div className="space-y-1.5">
                    {selected.members.map(m => (
                      <div key={m.id} className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {m.user.displayName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {m.user.displayName}
                            {m.userId === selected.ownerId && <span className="ml-1 text-xs text-amber-500">owner</span>}
                          </p>
                        </div>
                        <span className="text-xs text-slate-400 flex items-center gap-0.5">
                          <Trophy className="w-3 h-3 text-indigo-400" /> Lv {levelFromXP(m.user.xp)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shared decks */}
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Shared Decks</p>
                  {selected.sharedDecks.length === 0 ? (
                    <p className="text-xs text-slate-400">No decks shared yet.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {selected.sharedDecks.map(sd => (
                        <button key={sd.id} onClick={() => navigate(`/deck/${sd.deck.id}`)}
                          className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left">
                          <div className="w-6 h-6 rounded-lg flex-shrink-0" style={{ background: sd.deck.color }} />
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex-1 truncate">{sd.deck.name}</p>
                          <span className="text-xs text-slate-400">{sd.deck._count.cards} cards</span>
                          <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Share a deck */}
                {myDecks.length > 0 && (
                  <div className="flex gap-2">
                    <select value={shareDeckId} onChange={e => setShareDeckId(e.target.value)}
                      className="flex-1 text-sm bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl px-3 py-2 outline-none border border-slate-200 dark:border-slate-700">
                      <option value="">Share a deck…</option>
                      {myDecks.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                    <Button size="sm" loading={sharing} disabled={!shareDeckId} onClick={shareDeck}>Share</Button>
                  </div>
                )}

                {/* Leave / Delete */}
                <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  {selected.ownerId !== myUserId ? (
                    <button onClick={() => leaveGroup(selected.id)}
                      className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-500 transition-colors">
                      <LogOut className="w-3.5 h-3.5" /> Leave group
                    </button>
                  ) : (
                    <button onClick={() => deleteGroup(selected.id)}
                      className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" /> Delete group
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                <Users className="w-8 h-8 mb-2 opacity-30" />
                <p className="text-sm">Select a group to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
