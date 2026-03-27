import { Router } from 'express';
import multer from 'multer';
import Anthropic from '@anthropic-ai/sdk';
import { auth, AuthRequest } from '../middleware/auth';

const router = Router();
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });

router.post('/', auth, upload.single('file'), async (req: AuthRequest, res) => {
  try {
    if (!req.file) { res.status(400).json({ error: 'No file provided' }); return; }

    const ext = (req.file.originalname.split('.').pop() || '').toLowerCase();
    const fileName = req.file.originalname;
    let text = '';
    let pageCount: number | undefined;

    if (ext === 'pdf') {
      const pdfParse = require('pdf-parse');
      const data = await pdfParse(req.file.buffer);
      text = data.text.trim();
      pageCount = data.numpages;

    } else if (ext === 'docx' || ext === 'doc') {
      try {
        const mammoth = require('mammoth');
        const result = await mammoth.extractRawText({ buffer: req.file.buffer });
        text = result.value.trim();
      } catch {
        res.status(422).json({ error: 'DOCX support unavailable. Try PDF or TXT.' }); return;
      }

    } else if (ext === 'txt' || ext === 'md') {
      text = req.file.buffer.toString('utf-8').trim();

    } else if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
      const base64 = req.file.buffer.toString('base64');
      const mediaType = req.file.mimetype as 'image/jpeg' | 'image/png' | 'image/webp';
      const response = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 4096,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
            { type: 'text', text: `Extract ALL text from this image of student notes or study material.
Preserve the structure (headings, bullet points, numbered lists) as closely as possible.
Output ONLY the extracted text — no commentary, no description of the image.
If you cannot read something clearly, write [illegible] in its place.` }
          ]
        }]
      });
      text = response.content[0]?.type === 'text' ? response.content[0].text.trim() : '';

    } else {
      res.status(422).json({ error: `Unsupported file type: .${ext}. Supported: PDF, DOCX, TXT, MD, JPG, PNG` }); return;
    }

    const wordCount = text.split(/\s+/).filter(Boolean).length;

    if (wordCount > 50000) {
      res.status(422).json({ error: 'File too long. Maximum 50,000 words. Upload a specific chapter or section.' }); return;
    }
    if (wordCount < 50) {
      res.status(422).json({ error: 'Not enough content extracted. Minimum 50 words needed.' }); return;
    }

    const fileType = ['jpg', 'jpeg', 'png', 'webp'].includes(ext) ? 'image'
      : (ext === 'docx' || ext === 'doc') ? 'docx'
      : ext;

    res.json({ text, wordCount, pageCount, fileName, fileType });
  } catch (err: unknown) {
    console.error('Extraction error:', err);
    res.status(500).json({ error: 'Extraction failed: ' + String(err) });
  }
});

export default router;
