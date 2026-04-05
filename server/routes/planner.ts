import { Router } from 'express';
import prisma from '../lib/prisma';
import { auth, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(auth);

const p = prisma as any;

// GET /api/planner — list tasks
router.get('/', async (req: AuthRequest, res) => {
  try {
    const tasks = await p.studyTask.findMany({
      where: { userId: req.userId! },
      include: { deck: { select: { id: true, name: true, color: true } } },
      orderBy: [{ done: 'asc' }, { dueDate: 'asc' }, { createdAt: 'asc' }],
    });
    res.json({ tasks });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// POST /api/planner — create task
router.post('/', async (req: AuthRequest, res) => {
  const { title, notes = '', dueDate, deckId } = req.body || {};
  if (!title?.trim()) { res.status(400).json({ error: 'Title is required' }); return; }
  try {
    const task = await p.studyTask.create({
      data: {
        userId: req.userId!,
        title:  title.trim(),
        notes:  notes.trim(),
        dueDate: dueDate ? new Date(dueDate) : null,
        deckId:  deckId  ? parseInt(deckId)  : null,
      },
      include: { deck: { select: { id: true, name: true, color: true } } },
    });
    res.status(201).json({ task });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// PATCH /api/planner/:id — update done / title / dueDate / deckId
router.patch('/:id', async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id);
  try {
    const task = await p.studyTask.findFirst({ where: { id, userId: req.userId! } });
    if (!task) { res.status(404).json({ error: 'Task not found' }); return; }

    const { done, title, notes, dueDate, deckId } = req.body || {};
    const updated = await p.studyTask.update({
      where: { id },
      data: {
        ...(done      !== undefined ? { done }                         : {}),
        ...(title     !== undefined ? { title: title.trim() }         : {}),
        ...(notes     !== undefined ? { notes: notes.trim() }         : {}),
        ...(dueDate   !== undefined ? { dueDate: dueDate ? new Date(dueDate) : null } : {}),
        ...(deckId    !== undefined ? { deckId: deckId ? parseInt(deckId) : null }    : {}),
      },
      include: { deck: { select: { id: true, name: true, color: true } } },
    });
    res.json({ task: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// DELETE /api/planner/:id
router.delete('/:id', async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id);
  try {
    await p.studyTask.deleteMany({ where: { id, userId: req.userId! } });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// GET /api/planner/exams — upcoming exam dates from decks
router.get('/exams', async (req: AuthRequest, res) => {
  try {
    const decks = await p.deck.findMany({
      where: { userId: req.userId!, examDate: { not: null, gte: new Date() } },
      select: { id: true, name: true, color: true, examDate: true },
      orderBy: { examDate: 'asc' },
    });
    res.json({ exams: decks });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch exams' });
  }
});

// POST /api/planner/smart-schedule — generate study plan for an exam
router.post('/smart-schedule', async (req: AuthRequest, res) => {
  const { deckId, examDate, sessionsPerDay = 1 } = req.body || {};
  if (!deckId || !examDate) { res.status(400).json({ error: 'deckId and examDate required' }); return; }

  try {
    const deck = await p.deck.findFirst({
      where: { id: parseInt(deckId), userId: req.userId! },
      include: { _count: { select: { cards: true } } },
    });
    if (!deck) { res.status(404).json({ error: 'Deck not found' }); return; }

    const exam = new Date(examDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysUntilExam = Math.ceil((exam.getTime() - today.getTime()) / 86400000);

    if (daysUntilExam <= 0) { res.status(400).json({ error: 'Exam date must be in the future' }); return; }

    const cardCount = deck._count.cards;
    // Spread cards over available days, skip weekends option
    const studyDays = Math.max(1, daysUntilExam - 1); // leave exam day free
    const cardsPerSession = Math.ceil(cardCount / (studyDays * sessionsPerDay));

    // Generate tasks for each study day
    const tasks: Array<{ title: string; notes: string; dueDate: Date; deckId: number }> = [];
    for (let d = 0; d < studyDays; d++) {
      const date = new Date(today);
      date.setDate(today.getDate() + d + 1);
      const dayNum = d + 1;
      const isReview = d >= studyDays - Math.ceil(studyDays * 0.25); // last 25% = review sessions
      tasks.push({
        title: isReview
          ? `Review: ${deck.name} — Session ${dayNum}`
          : `Study: ${deck.name} — Session ${dayNum} (~${cardsPerSession} cards)`,
        notes: isReview
          ? 'Final review session — focus on weak cards'
          : `Cover ${cardsPerSession} new cards from this deck`,
        dueDate: date,
        deckId: deck.id,
      });
    }

    // Bulk create tasks
    const created = await Promise.all(
      tasks.map(t => p.studyTask.create({
        data: { userId: req.userId!, ...t },
        include: { deck: { select: { id: true, name: true, color: true } } },
      }))
    );

    res.json({ tasks: created, message: `${created.length} study sessions scheduled until ${exam.toDateString()}` });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// GET /api/planner/export.ics — export tasks + exam dates as iCal
router.get('/export.ics', async (req: AuthRequest, res) => {
  try {
    const [tasks, decks] = await Promise.all([
      p.studyTask.findMany({
        where: { userId: req.userId!, done: false, dueDate: { not: null } },
        include: { deck: { select: { name: true } } },
      }),
      p.deck.findMany({
        where: { userId: req.userId!, examDate: { not: null } },
        select: { id: true, name: true, examDate: true },
      }),
    ]);

    function icsDate(d: Date): string {
      return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    }

    function icsEscape(s: string): string {
      return s.replace(/[\\;,]/g, c => '\\' + c).replace(/\n/g, '\\n');
    }

    const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2)}@studyflow`;

    const lines: string[] = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//StudyFlow AI//Study Planner//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:StudyFlow Study Plan',
    ];

    for (const task of tasks) {
      if (!task.dueDate) continue;
      const dateStr = task.dueDate.toISOString().split('T')[0].replace(/-/g, '');
      lines.push(
        'BEGIN:VEVENT',
        `UID:task-${task.id}-${uid()}`,
        `DTSTAMP:${icsDate(new Date())}`,
        `DTSTART;VALUE=DATE:${dateStr}`,
        `DTEND;VALUE=DATE:${dateStr}`,
        `SUMMARY:${icsEscape('📚 ' + task.title)}`,
        task.deck ? `DESCRIPTION:${icsEscape('Deck: ' + task.deck.name)}` : 'DESCRIPTION:',
        'CATEGORIES:STUDY',
        'END:VEVENT',
      );
    }

    for (const deck of decks) {
      if (!deck.examDate) continue;
      const dateStr = deck.examDate.toISOString().split('T')[0].replace(/-/g, '');
      lines.push(
        'BEGIN:VEVENT',
        `UID:exam-${deck.id}-${uid()}`,
        `DTSTAMP:${icsDate(new Date())}`,
        `DTSTART;VALUE=DATE:${dateStr}`,
        `DTEND;VALUE=DATE:${dateStr}`,
        `SUMMARY:${icsEscape('🎓 EXAM: ' + deck.name)}`,
        'DESCRIPTION:Exam day — good luck!',
        'CATEGORIES:EXAM',
        `BEGIN:VALARM`,
        `TRIGGER:-P1D`,
        `ACTION:DISPLAY`,
        `DESCRIPTION:Exam tomorrow: ${icsEscape(deck.name)}`,
        `END:VALARM`,
        'END:VEVENT',
      );
    }

    lines.push('END:VCALENDAR');

    const icsContent = lines.join('\r\n');
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="studyflow.ics"');
    res.send(icsContent);
  } catch (err) {
    res.status(500).json({ error: 'Failed to export calendar' });
  }
});

export default router;
