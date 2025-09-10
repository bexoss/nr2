import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    provider: { type: String, required: true, enum: ['google', 'facebook', 'line', 'local'] },
    providerId: { type: String, required: true, index: true },
    email: { type: String, index: true },
    name: { type: String },
    username: { type: String, unique: true, sparse: true },
    passwordHash: { type: String },
    isAdmin: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

userSchema.index({ provider: 1, providerId: 1 }, { unique: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
