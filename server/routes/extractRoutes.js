const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const auth    = require('../middleware/auth');
const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const upload  = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });

// POST /api/extract  — extract text from uploaded file
router.post('/', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file provided' });

    const ext      = (req.file.originalname.split('.').pop() || '').toLowerCase();
    const fileName = req.file.originalname;
    let text = '', pageCount;

    // ── PDF ──────────────────────────────────────────────────
    if (ext === 'pdf') {
      const pdfParse = require('pdf-parse');
      const data = await pdfParse(req.file.buffer);
      text      = data.text.trim();
      pageCount = data.numpages;

    // ── DOCX / DOC ───────────────────────────────────────────
    } else if (ext === 'docx' || ext === 'doc') {
      let mammoth;
      try { mammoth = require('mammoth'); } catch {
        return res.status(422).json({ error: 'DOCX support requires: npm install mammoth' });
      }
      const result = await mammoth.extractRawText({ buffer: req.file.buffer });
      text = result.value.trim();

    // ── TXT / MD ─────────────────────────────────────────────
    } else if (ext === 'txt' || ext === 'md') {
      text = req.file.buffer.toString('utf-8').trim();

    // ── Images (Anthropic vision) ─────────────────────────────
    } else if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
      const base64    = req.file.buffer.toString('base64');
      const mediaType = req.file.mimetype;
      const response  = await client.messages.create({
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
      text = response.content[0]?.text?.trim() ?? '';

    } else {
      return res.status(422).json({ error: `Unsupported file type: .${ext}. Supported: PDF, DOCX, TXT, MD, JPG, PNG` });
    }

    const wordCount = text.split(/\s+/).filter(Boolean).length;

    if (wordCount > 50000) {
      return res.status(422).json({ error: 'File too long. Maximum 50,000 words. Upload a specific chapter or section.' });
    }
    if (wordCount < 50) {
      return res.status(422).json({ error: 'Not enough content extracted. Minimum 50 words needed.' });
    }

    const fileType = ['jpg','jpeg','png','webp'].includes(ext) ? 'image'
      : (ext === 'docx' || ext === 'doc') ? 'docx'
      : ext;

    res.json({ text, wordCount, pageCount, fileName, fileType });
  } catch (err) {
    console.error('Extraction error:', err.message);
    res.status(500).json({ error: 'Extraction failed: ' + err.message });
  }
});

module.exports = router;
