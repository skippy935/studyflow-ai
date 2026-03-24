import { Router, Request, Response } from 'express';
import multer from 'multer';
import { auth, AuthRequest } from '../middleware/auth';
import { uploadToCloudinary, extractTextFromFile } from '../services/uploadService';

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

export default router;
