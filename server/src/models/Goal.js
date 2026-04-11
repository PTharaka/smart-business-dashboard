import mongoose from 'mongoose';

const GoalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  targetAmount: { type: Number, required: true },
  currentAmount: { type: Number, default: 0 },
  deadline: { type: Date, required: true },
  category: { type: String, enum: ['Revenue', 'Profit', 'Expense Reduction'], default: 'Revenue' },
  status: { type: String, enum: ['active', 'completed', 'failed'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Goal', GoalSchema);
