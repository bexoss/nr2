import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    name: { type: String },
    price: { type: Number, default: 0 },
    qty: { type: Number, default: 1 },
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
    items: { type: [cartItemSchema], default: [] },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

cartSchema.index({ user: 1 }, { unique: true });

const Cart = mongoose.models.Cart || mongoose.model('Cart', cartSchema);
export default Cart;

