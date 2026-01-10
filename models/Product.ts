import mongoose, { Schema, Document, Model } from 'mongoose';
import './Category';
import './Subcategory';

export interface IProduct extends Document {
  name: string;
  description: string;
  categoryId: mongoose.Types.ObjectId;
  subcategoryId?: mongoose.Types.ObjectId;
  category?: string;
  subcategory?: string;
  features: string[];
  specifications: {
    label: string;
    value: string;
  }[];
  deliveryInformation: {
    estimatedDelivery: string;
    shippingCost: string;
    availableLocations: string[];
    specialInstructions?: string;
  };
  image: string;
  images: string[];
  isMostSelling: boolean;
  isTopProduct: boolean;
  usedAsCategoryThumbnail: boolean;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  material?: string;
  colors: string[];
  isAvailable: boolean;
  dateAdded: Date;
  featured: boolean;
  salesCount: number;
  rating: number;
  reviewCount: number;
  stock: number;
}

const ProductSchema = new Schema<IProduct>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: 'Category'
  },
  subcategoryId: {
    type: Schema.Types.ObjectId,
    ref: 'Subcategory'
  },
  category: {
    type: String
  },
  subcategory: {
    type: String
  },
  features: [{
    type: String
  }],
  specifications: [{
    label: {
      type: String,
      required: true
    },
    value: {
      type: String,
      required: true
    }
  }],
  deliveryInformation: {
    estimatedDelivery: {
      type: String,
      default: "7-10 business days"
    },
    shippingCost: {
      type: String,
      default: "Free shipping"
    },
    availableLocations: [{
      type: String
    }],
    specialInstructions: {
      type: String
    }
  },
  image: {
    type: String,
    required: true
  },
  images: [{
    type: String
  }],
  isMostSelling: {
    type: Boolean,
    default: false
  },
  isTopProduct: {
    type: Boolean,
    default: false
  },
  usedAsCategoryThumbnail: {
    type: Boolean,
    default: false
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  },
  material: String,
  colors: [String],
  isAvailable: {
    type: Boolean,
    default: true
  },
  dateAdded: {
    type: Date,
    default: Date.now
  },
  featured: {
    type: Boolean,
    default: false
  },
  salesCount: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 4.5,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  stock: {
    type: Number,
    default: 100
  }
});

// Create indexes
ProductSchema.index({ categoryId: 1 });
ProductSchema.index({ subcategoryId: 1 });
ProductSchema.index({ name: 'text', description: 'text' });
ProductSchema.index({ dateAdded: -1 });
ProductSchema.index({ isAvailable: 1 });
ProductSchema.index({ featured: 1 });
ProductSchema.index({ salesCount: -1 });
ProductSchema.index({ rating: -1 });
ProductSchema.index({ isMostSelling: 1 });
ProductSchema.index({ isTopProduct: 1 });
ProductSchema.index({ usedAsCategoryThumbnail: 1, categoryId: 1 });

// Pre-save middleware to automatically populate category and subcategory names
ProductSchema.pre('save', async function () {
  // Only populate if the IDs are set but names are not
  if (this.categoryId && !this.category) {
    const Category = mongoose.model('Category');
    const category = await Category.findById(this.categoryId);
    if (category) {
      this.category = (category as any).name;
    }
  }

  if (this.subcategoryId && !this.subcategory) {
    const Subcategory = mongoose.model('Subcategory');
    const subcategory = await Subcategory.findById(this.subcategoryId);
    if (subcategory) {
      this.subcategory = (subcategory as any).name;
    }
  }
});

const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
