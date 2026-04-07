const express = require('express');
const PredictionHistory = require('../models/PredictionHistory');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// ── GET /history — Fetch all predictions for the authenticated user ─────────
router.get('/', authMiddleware, async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip  = (page - 1) * limit;

    const [records, total] = await Promise.all([
      PredictionHistory.find({ user_email: req.user.email })
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit),
      PredictionHistory.countDocuments({ user_email: req.user.email })
    ]);

    return res.json({
      records,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error('History fetch error:', err);
    return res.status(500).json({ error: 'Failed to fetch history.' });
  }
});

// ── POST /history — Save a new prediction record ───────────────────────────
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { type, inputs, outputs } = req.body;

    if (!type || !inputs || !outputs) {
      return res.status(400).json({ error: 'type, inputs, and outputs are required.' });
    }

    const record = await PredictionHistory.create({
      user_email: req.user.email,
      type,
      inputs,
      outputs
    });

    return res.status(201).json({ success: true, record });
  } catch (err) {
    console.error('History save error:', err);
    return res.status(500).json({ error: 'Failed to save prediction.' });
  }
});

// ── DELETE /history/:id — Delete a single record ───────────────────────────
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const record = await PredictionHistory.findOneAndDelete({
      _id: req.params.id,
      user_email: req.user.email
    });
    if (!record) return res.status(404).json({ error: 'Record not found.' });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete record.' });
  }
});

module.exports = router;
