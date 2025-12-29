import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISubcategory extends Document {
  name: string;
  description: string;
  categoryId: mongoose.Types.ObjectId;
  displayOrder: number;
  dateAdded: Date;
}

const SubcategorySchema = new Schema<ISubcategory>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  dateAdded: {
    type: Date,
    default: Date.now
  }
});

// Create indexes
SubcategorySchema.index({ categoryId: 1 });
SubcategorySchema.index({ categoryId: 1, name: 1 }, { unique: true });
SubcategorySchema.index({ displayOrder: 1 });

const Subcategory: Model<ISubcategory> = mongoose.models.Subcategory || mongoose.model<ISubcategory>('Subcategory', SubcategorySchema);

export default Subcategory;
