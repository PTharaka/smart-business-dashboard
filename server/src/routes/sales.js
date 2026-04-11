import express from 'express';
import Sale from '../models/Sale.js';
import { authMiddleware } from '../middleware/auth.js';
import { predictNextPeriod } from '../utils/aiPredictor.js';

const router = express.Router();

router.use(authMiddleware);

// Bulk creation for CSV import
router.post('/bulk', async (req, res) => {
  try {
    const { salesData } = req.body;
    if (!Array.isArray(salesData)) return res.status(400).json({ message: 'Invalid data format' });

    const formattedData = salesData.map(item => ({
      user: req.user.id,
      amount: Number(item.amount),
      category: item.category || 'General',
      product: item.product || 'Unknown',
      date: item.date ? new Date(item.date) : new Date()
    }));

    await Sale.insertMany(formattedData);
    res.json({ message: 'Successfully imported records', count: formattedData.length });
  } catch (err) {
    res.status(500).json({ message: 'Server Error during import' });
  }
});

// Get all sales for a user
router.get('/', async (req, res) => {
  try {
    const sales = await Sale.find({ user: req.user.id }).sort({ date: 1 });
    res.json(sales);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Add a new sale
router.post('/', async (req, res) => {
  try {
    const { amount, date, category, product } = req.body;
    const newSale = new Sale({
      user: req.user.id,
      amount,
      date: date || new Date(),
      category,
      product
    });
    const sale = await newSale.save();
    res.json(sale);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Update a sale
router.put('/:id', async (req, res) => {
  try {
    let sale = await Sale.findById(req.params.id);
    if (!sale) return res.status(404).json({ message: 'Sale not found' });
    if (sale.user.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

    sale = await Sale.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    res.json(sale);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Delete a sale
router.delete('/:id', async (req, res) => {
  try {
    let sale = await Sale.findById(req.params.id);
    if (!sale) return res.status(404).json({ message: 'Sale not found' });
    if (sale.user.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

    await Sale.findByIdAndDelete(req.params.id);
    res.json({ message: 'Sale removed' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get AI Prediction
router.get('/prediction', async (req, res) => {
  try {
    const sales = await Sale.find({ user: req.user.id }).sort({ date: 1 });
    const prediction = predictNextPeriod(sales);
    res.json(prediction);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

export default router;
