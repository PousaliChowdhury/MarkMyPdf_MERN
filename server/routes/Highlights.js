const express = require('express');
const router = express.Router();
const auth = require('../middleware/Auth');
const Highlight = require('../models/Highlight');

router.get('/:pdfUuid', auth, async (req, res) => {
  const pdfUuid = req.params.pdfUuid;
  const highlights = await Highlight.find({ pdfUuid, owner: req.user._id }).sort({ createdAt: 1 });
  res.json({ highlights });
});

router.post('/', auth, async (req, res) => {
  const { pdfUuid, page, text, rect, color, notes } = req.body;
  if (!pdfUuid || page == null || !rect) return res.status(400).json({ message: 'Missing fields' });
  const h = await Highlight.create({
    pdfUuid, page, text, rect, color, notes, owner: req.user._id
  });
  res.json({ highlight: h });
});

router.patch('/:id', auth, async (req, res) => {
  const update = req.body;
  const h = await Highlight.findOneAndUpdate({ _id: req.params.id, owner: req.user._id }, update, { new: true });
  if (!h) return res.status(404).json({ message: 'Not found' });
  res.json({ highlight: h });
});

router.delete('/:id', auth, async (req, res) => {
  const h = await Highlight.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
  if (!h) return res.status(404).json({ message: 'Not found' });
  res.json({ ok: true });
});

module.exports = router;
