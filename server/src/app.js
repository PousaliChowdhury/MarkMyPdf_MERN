const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("../routes/Authenticate");
const pdfRoutes = require("../routes/Pdfs");
const highlightRoutes = require("../routes/Highlights");
const logger = require("./utils/logger");

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, "..", "uploads");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(logger);

// Serve uploaded files
app.use("/files", express.static(UPLOAD_DIR));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/pdfs", pdfRoutes);
app.use("/api/highlights", highlightRoutes);

module.exports = app;
