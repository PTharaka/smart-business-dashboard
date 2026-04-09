import mongoose from 'mongoose';

const SaleSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  date: { type: Date, required: true, default: Date.now },
  category: { type: String, required: true },
  product: { type: String, required: true },
});

export default mongoose.model('Sale', SaleSchema);
