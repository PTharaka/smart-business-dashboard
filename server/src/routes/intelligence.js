import express from 'express';
import Sale from '../models/Sale.js';
import Expense from '../models/Expense.js';
import Goal from '../models/Goal.js';
import { authMiddleware } from '../middleware/auth.js';
import { analyzeIntelligence } from '../utils/businessIntelligence.js';

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const [sales, expenses, goals] = await Promise.all([
      Sale.find({ user: req.user.id }),
      Expense.find({ user: req.user.id }),
      Goal.find({ user: req.user.id })
    ]);

    const intelligence = analyzeIntelligence(sales, expenses, goals);
    res.json(intelligence);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

export default router;
