const express = require('express');
const User = require('../models/User');
const PredictionHistory = require('../models/PredictionHistory');

const router = express.Router();

// Simple admin key check middleware
const ADMIN_KEY = process.env.ADMIN_KEY || 'admin_ai_twin_2024';

const verifyAdmin = (req, res, next) => {
  const key = req.headers['x-admin-key'] || req.query.key;
  if (key !== ADMIN_KEY) {
    return res.status(403).json({ error: 'Unauthorized. Invalid admin key.' });
  }
  next();
};

// GET /admin/users — List all registered users
router.get('/users', verifyAdmin, async (req, res) => {
  try {
    const users = await User.find({}, '-password_hash')
      .sort({ created_at: -1 })
      .lean();

    res.json({ success: true, count: users.length, users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /admin/stats — Overall platform stats
router.get('/stats', verifyAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPredictions = await PredictionHistory.countDocuments();

    // Users by type
    const byType = await User.aggregate([
      { $group: { _id: '$user_type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Users by auth provider
    const byProvider = await User.aggregate([
      { $group: { _id: { $ifNull: ['$auth_provider', 'local'] }, count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Users by gender
    const byGender = await User.aggregate([
      { $group: { _id: '$gender', count: { $sum: 1 } } }
    ]);

    // Recent 7-day signups
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentSignups = await User.countDocuments({ created_at: { $gte: weekAgo } });

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalPredictions,
        recentSignups,
        byType: byType.map(t => ({ type: t._id, count: t.count })),
        byProvider: byProvider.map(p => ({ provider: p._id, count: p.count })),
        byGender: byGender.map(g => ({ gender: g._id, count: g.count })),
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /admin/users/:id — Remove a user
router.delete('/users/:id', verifyAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    await PredictionHistory.deleteMany({ userId: req.params.id });
    res.json({ success: true, message: 'User and their history deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
