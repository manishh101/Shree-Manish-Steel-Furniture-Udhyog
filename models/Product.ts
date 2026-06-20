import mongoose, { Schema, Document, Model } from 'mongoose';
import './Category';
import './Subcategory';

export interface IProduct extends Document {
  name: string;
  slug?: string;
  description: string;
  categoryId: mongoose.Types.ObjectId;
  subcategoryId?: mongoose.Types.ObjectId;
  category?: string;
  subcategory?: string;
  features: string[];
  faqs?: {
    question: string;
    answer: string;
  }[];
  specifications: {
    material?: string;
    dimensions?: string;
    guarantee?: string;
    modelType?: string;
    modelWidth?: string;
    hangers?: string;
    noOfDoors?: string;
    typeOfPaint?: string;
    brand?: string;
  };
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
  colorName?: string;
  colorHex?: string;
  colorVariants?: {
    label: string;
    hex?: string;
    productId?: mongoose.Types.ObjectId | string;
    image?: string;
  }[];
  isAvailable: boolean;
  dateAdded: Date;
  featured: boolean;
  salesCount: number;
  rating: number;
  reviewCount: number;
  stock: number;
  manufacturerDetails?: {
    name?: string;
    address?: string;
    email?: string;
    countryOfOrigin?: string;
  } | string;
  
  // SEO Enhancement Fields
  metaTitle?: string;            // Custom meta title (optional override)
  metaDescription?: string;      // Custom meta description
  focusKeywords?: string[];      // Primary SEO keywords
  dualKeywords?: {               // Formal/colloquial keyword pairs
    formal: string;
    colloquial: string;
  }[];
  contentQualityScore?: number;  // 0-100 score for content quality
  lastSEOAudit?: Date;          // Last SEO review date
}

const ProductSchema = new Schema<IProduct>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    index: true,
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
  faqs: [{
    question: { type: String, required: true },
    answer: { type: String, required: true }
  }],
  specifications: {
    material: { type: String, default: "" },
    dimensions: { type: String, default: "" },
    guarantee: { type: String, default: "" },
    modelType: { type: String, default: "" },
    modelWidth: { type: String, default: "" },
    hangers: { type: String, default: "" },
    noOfDoors: { type: String, default: "" },
    typeOfPaint: { type: String, default: "" },
    brand: { type: String, default: "" }
  },
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
  colorName: {
    type: String,
    trim: true
  },
  colorHex: {
    type: String,
    trim: true
  },
  colorVariants: [{
    label: {
      type: String,
      trim: true
    },
    hex: {
      type: String,
      trim: true
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product'
    },
    image: {
      type: String,
      trim: true
    }
  }],
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
  },
  manufacturerDetails: {
    type: Schema.Types.Mixed,
    default: {
      name: "Shree Manish Steel Furniture Udhyog",
      address: "Biratnagar, Morang",
      email: "shreemanishfurniture@gmail.com",
      countryOfOrigin: "Nepal"
    }
  },
  
  // SEO Enhancement Fields
  metaTitle: {
    type: String,
    trim: true
  },
  metaDescription: {
    type: String,
    trim: true
  },
  focusKeywords: [{
    type: String,
    trim: true
  }],
  dualKeywords: [{
    formal: {
      type: String,
      trim: true
    },
    colloquial: {
      type: String,
      trim: true
    }
  }],
  contentQualityScore: {
    type: Number,
    min: 0,
    max: 100
  },
  lastSEOAudit: {
    type: Date
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
  // Generate slug if name modified or slug is empty
  if (this.isModified('name') || !this.slug) {
    const generateSlug = (text: string): string => {
      return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // remove non-alphanumeric except spaces and hyphens
        .replace(/[\s_]+/g, '-')   // replace spaces/underscores with hyphens
        .replace(/-+/g, '-');      // remove duplicate hyphens
    };

    let baseSlug = generateSlug(this.name);
    if (!baseSlug.endsWith('-biratnagar') && !baseSlug.includes('biratnagar')) {
      baseSlug = `${baseSlug}-biratnagar`;
    }

    let uniqueSlug = baseSlug;
    let counter = 1;
    const ProductModel = this.constructor as mongoose.Model<any>;

    while (true) {
      const existing = await ProductModel.findOne({
        slug: uniqueSlug,
        _id: { $ne: this._id }
      });
      if (!existing) {
        break;
      }
      if (baseSlug.endsWith('-biratnagar')) {
        const prefix = baseSlug.slice(0, -11); // remove '-biratnagar'
        uniqueSlug = `${prefix}-${counter}-biratnagar`;
      } else {
        uniqueSlug = `${baseSlug}-${counter}`;
      }
      counter++;
    }
    this.slug = uniqueSlug;
  }

  // Populate category/subcategory names when the ID changes or name is missing
  if (this.categoryId && (this.isModified('categoryId') || !this.category)) {
    const Category = mongoose.model('Category');
    const category = await Category.findById(this.categoryId);
    if (category) {
      this.category = (category as any).name;
    }
  }

  if (this.subcategoryId && (this.isModified('subcategoryId') || !this.subcategory)) {
    const Subcategory = mongoose.model('Subcategory');
    const subcategory = await Subcategory.findById(this.subcategoryId);
    if (subcategory) {
      this.subcategory = (subcategory as any).name;
    }
  }
});

const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
