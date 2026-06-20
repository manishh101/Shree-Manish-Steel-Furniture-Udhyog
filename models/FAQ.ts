import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFAQItem {
  question: string;
  answer: string;
}

export interface IFAQ extends Document {
  question: string;
  answer: string;
  category: 'general' | 'delivery' | 'payment' | 'warranty' | 'custom_orders';
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const FAQSchema = new Schema<IFAQ>({
  question: {
    type: String,
    required: [true, 'Question is required'],
    trim: true,
  },
  answer: {
    type: String,
    required: [true, 'Answer is required'],
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['general', 'delivery', 'payment', 'warranty', 'custom_orders'],
    lowercase: true,
    trim: true,
  },
  displayOrder: {
    type: Number,
    default: 0,
  }
}, {
  timestamps: true
});

// Compound index for quick querying by category and ordering
FAQSchema.index({ category: 1, displayOrder: 1 });

const FAQ: Model<IFAQ> = mongoose.models.FAQ || mongoose.model<IFAQ>('FAQ', FAQSchema);

export default FAQ;
