import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICustomOrder extends Document {
  name: string;
  email: string;
  phone: string;
  address: string;
  productType: 'household' | 'office' | 'wood' | 'other' | 'steel';
  dimensions?: {
    width?: string;
    height?: string;
    depth?: string;
  };
  color?: 'blue' | 'brown' | 'maroon' | 'pink' | 'water-blue' | 'grey' | 'other' | null;
  budget?: 'under-10000' | '10000-20000' | '20000-30000' | '30000-50000' | 'above-50000' | null;
  requirements: string;
  status: 'new' | 'in-progress' | 'quoted' | 'approved' | 'manufacturing' | 'completed' | 'delivered' | 'cancelled';
  adminNotes?: string;
  quotedPrice?: number;
  quotedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CustomOrderSchema = new Schema<ICustomOrder>({
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
  address: {
    type: String,
    required: true,
    trim: true
  },
  productType: {
    type: String,
    required: true,
    enum: ['household', 'office', 'wood', 'other', 'steel']
  },
  dimensions: {
    width: {
      type: String,
      required: false
    },
    height: {
      type: String,
      required: false
    },
    depth: {
      type: String,
      required: false
    }
  },
  color: {
    type: String,
    required: false,
    enum: ['blue', 'brown', 'maroon', 'pink', 'water-blue', 'grey', 'other', null],
    default: null
  },
  budget: {
    type: String,
    required: false,
    enum: ['under-10000', '10000-20000', '20000-30000', '30000-50000', 'above-50000', null],
    default: null
  },
  requirements: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['new', 'in-progress', 'quoted', 'approved', 'manufacturing', 'completed', 'delivered', 'cancelled'],
    default: 'new'
  },
  adminNotes: {
    type: String,
    required: false
  },
  quotedPrice: {
    type: Number,
    required: false
  },
  quotedAt: {
    type: Date,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
CustomOrderSchema.pre('save', function(this: ICustomOrder) {
  this.updatedAt = new Date();
});

const CustomOrder: Model<ICustomOrder> = mongoose.models.CustomOrder || mongoose.model<ICustomOrder>('CustomOrder', CustomOrderSchema);

export default CustomOrder;
