import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ email, password: hashedPassword, name });
    await user.save();

    const payload = { user: { id: user.id, role: user.role } };
    const defaultSecret = 'smartbusinessdashdefaultsecret123';
    jwt.sign(payload, process.env.JWT_SECRET || defaultSecret, { expiresIn: '5h' }, (err, token) => {
        if (err) throw err;
        res.json({ token, user: { id: user.id, email, name, role: user.role } });
    });
  } catch (err) {
    console.error('Auth Error:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid Credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid Credentials' });

    const payload = { user: { id: user.id, role: user.role } };
    const defaultSecret = 'smartbusinessdashdefaultsecret123';
    jwt.sign(payload, process.env.JWT_SECRET || defaultSecret, { expiresIn: '5h' }, (err, token) => {
        if (err) throw err;
        res.json({ token, user: { id: user.id, email, name: user.name, role: user.role } });
    });
  } catch (err) {
    console.error('Auth Error:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

export default router;
