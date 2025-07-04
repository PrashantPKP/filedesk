const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const File = require("../models/File");
const Folder = require("../models/Folder");

const router = express.Router();

// Ensure uploads directory path is absolute
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve("uploads"));
  },
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// Unified upload route (handles both file and link uploads)
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const isLink = req.headers["content-type"] === "application/json";

    const data = isLink ? req.body : req.body;

    const fileData = {
      name: data.name || req.file?.originalname,
      type: data.type || (req.file?.mimetype?.startsWith("image/") ? "Image" : "PDF"),
      folder: data.folder || "",
      tags: Array.isArray(data.tags)
        ? data.tags
        : typeof data.tags === "string"
        ? JSON.parse(data.tags)
        : [],
      read: data.read === "true" || data.read === true,
      url: data.url || `/uploads/${req.file?.filename}`,
    };

    const file = await File.create(fileData);
    return res.status(200).json({ success: true, file });
  } catch (err) {
    console.error("Upload error:", err.message);
    return res.status(500).json({ success: false, message: "File upload failed" });
  }
});

// Add this route to fetch all files
router.get('/', async (req, res) => {
  try {
    const files = await File.find().sort({ uploadDate: -1 });
    res.status(200).json(files);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch files' });
  }
});

// Add this route to delete a file by ID
router.delete('/:id', async (req, res) => {
  try {
    const file = await File.findByIdAndDelete(req.params.id);
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }
    // Delete the physical file if it exists and is not a link
    if (file.url && file.url.startsWith('/uploads/')) {
      const filePath = path.resolve('uploads', file.url.replace('/uploads/', ''));
      fs.unlink(filePath, (err) => {
        if (err && err.code !== 'ENOENT') {
          console.error('Failed to delete file from uploads:', err);
        }
      });
    }
    res.status(200).json({ success: true, message: 'File deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete file' });
  }
});

// Add this route to update a file's folder
router.put('/:id/folder', async (req, res) => {
  try {
    const { folder } = req.body;
    const file = await File.findByIdAndUpdate(req.params.id, { folder }, { new: true });
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }
    res.status(200).json({ success: true, file });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update folder' });
  }
});

// Add this route to toggle the read status of a file
router.put('/:id/toggle-read', async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }
    file.read = !file.read;
    await file.save();
    res.status(200).json({ success: true, file });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to toggle read status' });
  }
});

// Add this route to update a file's tags
router.put('/:id/tags', async (req, res) => {
  try {
    const { tags } = req.body;
    const file = await File.findByIdAndUpdate(req.params.id, { tags }, { new: true });
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }
    res.status(200).json({ success: true, file });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update tags' });
  }
});

// Folder management routes
router.get('/folders', async (req, res) => {
  try {
    const folders = await Folder.find();
    res.status(200).json(folders);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch folders' });
  }
});

router.post('/folders', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Folder name required' });
    const existing = await Folder.findOne({ name });
    if (existing) return res.status(400).json({ success: false, message: 'Folder already exists' });
    const folder = await Folder.create({ name });
    res.status(201).json(folder);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create folder' });
  }
});

router.delete('/folders/:id', async (req, res) => {
  try {
    const folder = await Folder.findByIdAndDelete(req.params.id);
    if (!folder) return res.status(404).json({ success: false, message: 'Folder not found' });
    // Delete all files in this folder
    const filesToDelete = await File.find({ folder: folder.name });
    for (const file of filesToDelete) {
      // Remove physical file if it exists
      if (file.url && file.url.startsWith('/uploads/')) {
        const filePath = path.resolve('uploads', file.url.replace('/uploads/', ''));
        fs.unlink(filePath, (err) => {
          if (err && err.code !== 'ENOENT') {
            console.error('Failed to delete file from uploads:', err);
          }
        });
      }
      await file.deleteOne();
    }
    res.status(200).json({ success: true, message: 'Folder and its files deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete folder' });
  }
});

module.exports = router;

