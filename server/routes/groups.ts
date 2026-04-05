import { Router } from 'express';
import prisma from '../lib/prisma';
import { auth, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(auth);
const p = prisma as any;

function randomCode(len = 6): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// GET /api/groups — list groups I own or am member of
router.get('/', async (req: AuthRequest, res) => {
  try {
    const memberships = await p.studyGroupMember.findMany({
      where: { userId: req.userId! },
      include: {
        group: {
          include: {
            owner: { select: { id: true, displayName: true } },
            _count: { select: { members: true, sharedDecks: true } },
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    });
    const groups = memberships.map((m: any) => ({ ...m.group, joinedAt: m.joinedAt }));
    res.json({ groups });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// POST /api/groups — create a group
router.post('/', async (req: AuthRequest, res) => {
  const { name, description = '' } = req.body || {};
  if (!name?.trim()) { res.status(400).json({ error: 'name required' }); return; }
  try {
    let joinCode = randomCode();
    // Ensure unique
    while (await p.studyGroup.findUnique({ where: { joinCode } })) {
      joinCode = randomCode();
    }
    const group = await p.studyGroup.create({
      data: {
        name: name.trim(),
        description: description.trim(),
        joinCode,
        ownerId: req.userId!,
        members: { create: { userId: req.userId! } },
      },
      include: {
        owner: { select: { id: true, displayName: true } },
        _count: { select: { members: true, sharedDecks: true } },
      },
    });
    res.status(201).json({ group });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// POST /api/groups/join { joinCode }
router.post('/join', async (req: AuthRequest, res) => {
  const { joinCode } = req.body || {};
  if (!joinCode) { res.status(400).json({ error: 'joinCode required' }); return; }
  try {
    const group = await p.studyGroup.findUnique({ where: { joinCode: joinCode.trim().toUpperCase() } });
    if (!group) { res.status(404).json({ error: 'No group found with that code' }); return; }

    await p.studyGroupMember.upsert({
      where: { groupId_userId: { groupId: group.id, userId: req.userId! } },
      update: {},
      create: { groupId: group.id, userId: req.userId! },
    });
    res.json({ group });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// GET /api/groups/:id — group detail with members + shared decks
router.get('/:id', async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id);
  try {
    const membership = await p.studyGroupMember.findFirst({ where: { groupId: id, userId: req.userId! } });
    if (!membership) { res.status(403).json({ error: 'Not a member of this group' }); return; }

    const group = await p.studyGroup.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, displayName: true } },
        members: {
          include: { user: { select: { id: true, displayName: true, xp: true, streak: true } } },
          orderBy: { joinedAt: 'asc' },
        },
        sharedDecks: {
          include: {
            deck: { select: { id: true, name: true, color: true, _count: { select: { cards: true } } } },
          },
          orderBy: { sharedAt: 'desc' },
        },
      },
    });
    res.json({ group });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// POST /api/groups/:id/share { deckId } — share a deck with the group
router.post('/:id/share', async (req: AuthRequest, res) => {
  const groupId = parseInt(req.params.id);
  const { deckId } = req.body || {};
  if (!deckId) { res.status(400).json({ error: 'deckId required' }); return; }
  try {
    const membership = await p.studyGroupMember.findFirst({ where: { groupId, userId: req.userId! } });
    if (!membership) { res.status(403).json({ error: 'Not a member of this group' }); return; }

    const deck = await p.deck.findFirst({ where: { id: parseInt(deckId), userId: req.userId! } });
    if (!deck) { res.status(404).json({ error: 'Deck not found or not yours' }); return; }

    const shared = await p.sharedDeck.upsert({
      where: { groupId_deckId: { groupId, deckId: deck.id } },
      update: { sharedBy: req.userId!, sharedAt: new Date() },
      create: { groupId, deckId: deck.id, sharedBy: req.userId! },
      include: { deck: { select: { id: true, name: true, color: true, _count: { select: { cards: true } } } } },
    });
    res.json({ shared });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// DELETE /api/groups/:id/leave — leave a group
router.delete('/:id/leave', async (req: AuthRequest, res) => {
  const groupId = parseInt(req.params.id);
  try {
    const group = await p.studyGroup.findUnique({ where: { id: groupId } });
    if (group?.ownerId === req.userId) {
      res.status(400).json({ error: 'Owner cannot leave — delete the group instead' }); return;
    }
    await p.studyGroupMember.deleteMany({ where: { groupId, userId: req.userId! } });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// DELETE /api/groups/:id — delete group (owner only)
router.delete('/:id', async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id);
  try {
    const group = await p.studyGroup.findUnique({ where: { id } });
    if (!group || group.ownerId !== req.userId) {
      res.status(403).json({ error: 'Only the owner can delete a group' }); return;
    }
    await p.studyGroup.delete({ where: { id } });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
