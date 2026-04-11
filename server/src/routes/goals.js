import express from 'express';
import Goal from '../models/Goal.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get all goals
router.get('/', authMiddleware, async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user.id }).sort({ deadline: 1 });
    res.json(goals);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Add a goal
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, targetAmount, deadline, category } = req.body;
    const newGoal = new Goal({
      user: req.user.id,
      title,
      targetAmount,
      deadline,
      category
    });
    const goal = await newGoal.save();
    res.json(goal);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Update goal progress (optional convenience)
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { $set: req.body },
      { new: true }
    );
    res.json(goal);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

export default router;
