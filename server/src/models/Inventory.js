import mongoose from 'mongoose'

const InventorySchema = new mongoose.Schema(
  {
    sku: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    qty: { type: Number, default: 0 },
    reserved: { type: Number, default: 0 },
    warehouseId: { type: String },
    updatedAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
)

const Inventory = mongoose.models.Inventory || mongoose.model('Inventory', InventorySchema)
export default Inventory
