import mongoose from 'mongoose'

const productSchema = new mongoose.Schema(
  {
    sku: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    option: { type: String },
    title: { type: String },
    content: { type: String },
    active: { type: Boolean, default: true },
    price: { type: Number, required: true },
    shippingFee: { type: Number, default: 0 },
    reviewLink: { type: [String], default: [] },
    maxQtyPerUser: { type: Number, default: 100 },
    maxQtyPerOrder: { type: Number, default: 100 },
    cid: { type: String },
    rankingScore: { type: Number, default: 0, min: 0, max: 100 },
    tags: { type: [String], default: [] },
    image: { type: String },
    description: { type: String },
  },
  { timestamps: true }
)

productSchema.index({ active: 1, rankingScore: -1 })
productSchema.index({ name: 'text', option: 'text', title: 'text', tags: 'text' })

const Product = mongoose.models.Product || mongoose.model('Product', productSchema)
export default Product
