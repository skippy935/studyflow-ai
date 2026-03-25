import { Router, Response } from 'express';
import multer from 'multer';
import { auth, AuthRequest } from '../middleware/auth';
import { uploadToCloudinary, extractTextFromFile } from '../services/uploadService';
import { YoutubeTranscript } from 'youtube-transcript';

const router  = Router();
const storage = multer.memoryStorage();
const upload  = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['application/pdf', 'text/plain', 'image/jpeg', 'image/png', 'image/webp'];
    cb(null, allowed.includes(file.mimetype));
  }
});

router.post('/', auth, upload.single('file'), async (req: AuthRequest, res: Response) => {
  if (!req.file) { res.status(400).json({ error: 'No file uploaded' }); return; }

  try {
    const url  = await uploadToCloudinary(req.file.buffer, req.file.originalname, req.file.mimetype);
    const text = await extractTextFromFile(req.file.buffer, req.file.mimetype);
    res.json({ url, text, filename: req.file.originalname, mimetype: req.file.mimetype });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

router.post('/youtube', auth, async (req: AuthRequest, res: Response) => {
  const { url } = req.body || {};
  if (!url) { res.status(400).json({ error: 'YouTube URL required' }); return; }

  const match = url.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  if (!match) { res.status(400).json({ error: 'Invalid YouTube URL' }); return; }

  try {
    const transcript = await YoutubeTranscript.fetchTranscript(match[1]);
    const text = transcript.map((t: { text: string }) => t.text).join(' ');
    if (!text.trim()) { res.status(422).json({ error: 'No transcript available for this video' }); return; }
    res.json({ text, videoId: match[1] });
  } catch {
    res.status(422).json({ error: 'Could not fetch transcript. The video may have no captions.' });
  }
});

export default router;
