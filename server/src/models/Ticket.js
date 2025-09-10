import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    author: { type: String, enum: ['user', 'admin'], required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: { type: String, default: '' },
    attachments: { type: [String], default: [] },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ticketSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    subject: { type: String, required: true },
    category: { type: String, enum: ['order', 'product', 'payment', 'account', 'other'], default: 'other' },
    priority: { type: String, enum: ['low', 'normal', 'high'], default: 'normal' },
    status: { type: String, enum: ['open', 'pending', 'resolved', 'closed'], default: 'open', index: true },
    messages: { type: [messageSchema], default: [] },
  },
  { timestamps: true }
);

const Ticket = mongoose.models.Ticket || mongoose.model('Ticket', ticketSchema);
export default Ticket;

