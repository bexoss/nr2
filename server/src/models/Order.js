import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    name: { type: String },
    price: { type: Number, default: 0 },
    qty: { type: Number, default: 1 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
    items: { type: [orderItemSchema], default: [] },
    total: { type: Number, default: 0 },
    status: { type: String, default: 'PLACED' },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
export default Order;

