// File-sharing server: upload (auth) -> get a public share link -> anyone can download
const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const File = require('../models/File');
const { authenticate } = require('../middleware/auth');

const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (req, file, cb) =>
    cb(null, crypto.randomBytes(12).toString('hex') + path.extname(file.originalname)),
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10 MB

const router = express.Router();

// public download via share link (no login needed)
router.get('/share/:shareId', async (req, res, next) => {
  try {
    const file = await File.findOne({ shareId: req.params.shareId });
    if (!file) return res.status(404).json({ error: 'Link not found' });
    res.download(path.join(UPLOAD_DIR, file.storedName), file.originalName);
  } catch (err) { next(err); }
});

router.use(authenticate);

router.post('/', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Send a multipart field named "file"' });
    const shareId = crypto.randomBytes(8).toString('hex');
    const doc = await File.create({
      originalName: req.file.originalname,
      storedName: req.file.filename,
      mimeType: req.file.mimetype,
      size: req.file.size,
      shareId,
      owner: req.user._id,
    });
    res.status(201).json({ id: doc._id, name: doc.originalName, shareUrl: `/api/files/share/${shareId}` });
  } catch (err) { next(err); }
});

router.get('/', async (req, res, next) => {
  try {
    const files = await File.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json(files.map((f) => ({ id: f._id, name: f.originalName, size: f.size, shareUrl: `/api/files/share/${f.shareId}` })));
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ error: 'Not found' });
    if (!file.owner.equals(req.user._id) && req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    fs.unlink(path.join(UPLOAD_DIR, file.storedName), () => {});
    await file.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
});

module.exports = router;
