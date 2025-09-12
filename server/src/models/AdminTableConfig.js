import mongoose from 'mongoose'

const AdminTableConfigSchema = new mongoose.Schema(
  {
    table: { type: String, required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    columns: { type: [String], default: [] },
  },
  { timestamps: true }
)
AdminTableConfigSchema.index({ table: 1, userId: 1 }, { unique: true })

const AdminTableConfig = mongoose.models.AdminTableConfig || mongoose.model('AdminTableConfig', AdminTableConfigSchema)
export default AdminTableConfig
