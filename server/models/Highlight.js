const mongoose = require('mongoose');

const HighlightSchema = new mongoose.Schema({
  pdfUuid: { type: String, required: true, index: true }, // matches Pdf.uuid
  page: { type: Number, required: true },
  text: { type: String },
  rect: {
    x: Number,
    y: Number,
    width: Number,
    height: Number
  },
  tool: { type: String, default: "highlighter" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Highlight', HighlightSchema);
