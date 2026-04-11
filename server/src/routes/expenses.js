import express from 'express';
import Expense from '../models/Expense.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get all expenses
router.get('/', authMiddleware, async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user.id }).sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Add an expense
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { amount, category, description } = req.body;
    const newExpense = new Expense({
      user: req.user.id,
      amount,
      category,
      description
    });
    const expense = await newExpense.save();
    res.json(expense);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

export default router;
