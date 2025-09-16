const express = require('express');
const router = express.Router();
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/Auth');
const Pdf = require('../models/Pdf');
const Highlight = require('../models/Highlight');

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    // we will still store original name in DB
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2,10)}${path.extname(file.originalname)}`;
    cb(null, unique);
  }
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      cb(new Error('Only PDFs allowed'), false);
    } else cb(null, true);
  },
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const generatedUuid = uuidv4();
    const pdf = await Pdf.create({
      uuid: generatedUuid,
      originalName: file.originalname,
      storagePath: file.filename,
      owner: req.user._id,
      size: file.size
    });
    res.json({ pdf });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Upload failed' });
  }
});

router.get('/', auth, async (req, res) => {
  const list = await Pdf.find({ owner: req.user._id }).sort({ createdAt: -1 });
  res.json({ pdfs: list });
});

router.get('/:uuid', auth, async (req, res) => {
  const pdf = await Pdf.findOne({ uuid: req.params.uuid, owner: req.user._id });
  if (!pdf) return res.status(404).json({ message: 'Not found' });
  res.json({ pdf });
});

router.delete('/:uuid', auth, async (req, res) => {
  const pdf = await Pdf.findOne({ uuid: req.params.uuid, owner: req.user._id });
  if (!pdf) return res.status(404).json({ message: 'Not found' });
  // delete file
  const filePath = path.join(UPLOAD_DIR, pdf.storagePath);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  await Highlight.deleteMany({ pdfUuid: pdf.uuid, owner: req.user._id });
  await pdf.deleteOne();
  res.json({ ok: true });
});

router.patch('/rename/:uuid', auth, async (req, res) => {
  try {
    let { newName } = req.body;
    if (!newName || typeof newName !== 'string' || !newName.trim())
      return res.status(400).json({ message: 'New name is required' });

    newName = newName.trim();
    if (!newName.toLowerCase().endsWith('.pdf')) newName += '.pdf';

    const pdf = await Pdf.findOne({ uuid: req.params.uuid, owner: req.user._id });
    if (!pdf) return res.status(404).json({ message: 'PDF not found' });

    const oldPath = path.join(UPLOAD_DIR, pdf.storagePath);
    const newStorageName = `${Date.now()}-${Math.random().toString(36).slice(2,10)}.pdf`;
    const newPath = path.join(UPLOAD_DIR, newStorageName);

    try {
      if (fs.existsSync(oldPath)) fs.renameSync(oldPath, newPath);
    } catch (err) {
      console.error('File rename error:', err);
      return res.status(500).json({ message: 'File rename failed' });
    }

    pdf.originalName = newName;
    pdf.storagePath = newStorageName;
    await pdf.save();

    res.json({ pdf });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Rename failed' });
  }
});




module.exports = router;
