require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const authRoutes = require('./routes/auth');
const pdfRoutes = require('./routes/Pdfs');
const highlightRoutes = require('./routes/Highlights');

const app = express();
app.use(express.json());

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, 'uploads');
app.use('/files', express.static(UPLOAD_DIR)); // serve uploaded PDFs

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/pdfs', pdfRoutes);
app.use('/api/highlights', highlightRoutes);

// DB connect
const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/pdf_annotator';
mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(()=> console.log('Connected to MongoDB'))
  .catch(err=> console.error(err));

const PORT = process.env.PORT || 4000;
app.listen(PORT, ()=> console.log(`Server running on ${PORT}`));
