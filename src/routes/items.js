// MongoDB CRUD (Create, Read, Update, Delete) on "items"
const express = require('express');
const mongoose = require('mongoose');
const Item = require('../models/Item');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

const canAccess = (user, item) => user.role === 'admin' || item.owner.equals(user._id);
const validId = (id) => mongoose.isValidObjectId(id);

// CREATE
router.post('/', async (req, res, next) => {
  try {
    const { title, description } = req.body || {};
    if (!title) return res.status(400).json({ error: 'title required' });
    const item = await Item.create({ title, description, owner: req.user._id });
    res.status(201).json(item);
  } catch (err) { next(err); }
});

// READ all (own items; admin sees all)
router.get('/', async (req, res, next) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { owner: req.user._id };
    res.json(await Item.find(filter).sort({ createdAt: -1 }));
  } catch (err) { next(err); }
});

// READ one
router.get('/:id', async (req, res, next) => {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    if (!canAccess(req.user, item)) return res.status(403).json({ error: 'Forbidden' });
    res.json(item);
  } catch (err) { next(err); }
});

// UPDATE
router.put('/:id', async (req, res, next) => {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    if (!canAccess(req.user, item)) return res.status(403).json({ error: 'Forbidden' });
    const { title, description } = req.body || {};
    if (title !== undefined) item.title = title;
    if (description !== undefined) item.description = description;
    await item.save();
    res.json(item);
  } catch (err) { next(err); }
});

// DELETE
router.delete('/:id', async (req, res, next) => {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    if (!canAccess(req.user, item)) return res.status(403).json({ error: 'Forbidden' });
    await item.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
});

module.exports = router;
