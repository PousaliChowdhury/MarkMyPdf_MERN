const mongoose = require('mongoose');

const PdfSchema = new mongoose.Schema({
  uuid: { type: String, required: true, unique: true },
  originalName: { type: String, required: true },
  storagePath: { type: String, required: true }, // server file path
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  size: Number,
  pages: Number, // optional, can fill on upload
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Pdf', PdfSchema);
