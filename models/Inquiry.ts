import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IInquiry extends Document {
  name: string;
  email: string;
  phone: string;
  message: string;
  category: 'product' | 'service' | 'support' | 'business' | 'general';
  status: 'new' | 'read' | 'replied' | 'archived';
  createdAt: Date;
  productId?: mongoose.Types.ObjectId;
  ipAddress?: string;
}

const InquirySchema = new Schema<IInquiry>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    match: [/.+\@.+\..+/, 'Please enter a valid email address']
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['product', 'service', 'support', 'business', 'general'],
    default: 'general'
  },
  status: {
    type: String,
    enum: ['new', 'read', 'replied', 'archived'],
    default: 'new'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: false
  },
  ipAddress: {
    type: String,
    required: false
  }
});

// Add indexes
InquirySchema.index({ createdAt: -1 });
InquirySchema.index({ status: 1 });
InquirySchema.index({ category: 1 });

const Inquiry: Model<IInquiry> = mongoose.models.Inquiry || mongoose.model<IInquiry>('Inquiry', InquirySchema);

export default Inquiry;
