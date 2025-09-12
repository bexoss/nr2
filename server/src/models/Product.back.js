import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    sku: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    price: { type: Number, required: true }, // base currency: JPY
    image: { type: String },
    description: { type: String },
    shippingFee: { type: Number, default: 0 },
    maxQtyPerUser: { type: Number, default: 0 }, // 0 means no limit
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
export default Product;
