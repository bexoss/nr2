import mongoose from 'mongoose'

const CampaignSchema = new mongoose.Schema(
  {
    cid: { type: String, unique: true, index: true, required: true },
    name: { type: String, required: true },
    influencerEmail: { type: String, unique: true },
    commissionRate: { type: Number, default: 0.15 },
    startsAt: { type: Date },
    expiresAt: { type: Date },
    landingPath: { type: String },
    fallbackPath: { type: String },
    meta: { type: Object },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
)

const Campaign = mongoose.models.Campaign || mongoose.model('Campaign', CampaignSchema)
export default Campaign
