import mongoose from 'mongoose'

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String },
    sku: { type: String, index: true },
    qty: { type: Number, default: 1 },
    price: { type: Number, default: 0 },
    originalPrice: { type: Number, default: 0 },
    option: { type: Object },
    cid: { type: String },
  },
  { _id: false }
)

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, index: true },
    status: { type: String, enum: ['pending','paid','shipped','delivered','cancelled','refunded'], default: 'pending', index: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    guestInfo: { type: Object },
    shippingAddress: { type: Object },
    items: { type: [orderItemSchema], default: [] },
    trackingNo: { type: String },
    trackingCompany: { type: String },
    lastTrackUpdatedAt: { type: Date },
    paymentMethod: { type: String },
    paymentAmount: { type: Number },
    records: { type: [Object], default: [] },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
)

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema)
export default Order
