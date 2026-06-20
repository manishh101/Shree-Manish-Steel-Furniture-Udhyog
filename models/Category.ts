import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IKeywordPair {
  formal: string;
  colloquial: string;
}

export interface IFAQ {
  question: string;
  answer: string;
}

export interface ICategory extends Document {
  name: string;
  description: string;
  displayOrder: number;
  dateAdded: Date;
  // SEO fields
  metaTitle?: string;
  metaDescription?: string;
  focusKeywords: string[];
  dualKeywords: IKeywordPair[];
  faqs: IFAQ[];
}

const CategorySchema = new Schema<ICategory>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  dateAdded: {
    type: Date,
    default: Date.now
  },
  // SEO fields
  metaTitle: {
    type: String,
    trim: true
  },
  metaDescription: {
    type: String,
    trim: true
  },
  focusKeywords: {
    type: [String],
    default: []
  },
  dualKeywords: {
    type: [{
      formal: {
        type: String,
        required: true
      },
      colloquial: {
        type: String,
        required: true
      }
    }],
    default: []
  },
  faqs: {
    type: [{
      question: {
        type: String,
        required: true
      },
      answer: {
        type: String,
        required: true
      }
    }],
    default: []
  }
});

// Create indexes
CategorySchema.index({ name: 1 }, { unique: true });
CategorySchema.index({ displayOrder: 1 });

// Virtual property to get subcategories
CategorySchema.virtual('subcategories', {
  ref: 'Subcategory',
  localField: '_id',
  foreignField: 'categoryId'
});

const Category: Model<ICategory> = mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);

export default Category;
