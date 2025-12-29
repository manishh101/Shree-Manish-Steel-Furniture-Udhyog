import mongoose, { Schema, Document, Model } from 'mongoose';

// Gallery Image Interface
export interface IGalleryImage {
  title: string;
  description?: string;
  src: string;
  alt: string;
  category: string;
  featured: boolean;
  tags: string[];
  order: number;
  createdAt: Date;
}

// Gallery Section Interface
export interface IGallerySection extends Document {
  name: string;
  description?: string;
  category: string;
  featured: boolean;
  order: number;
  images: IGalleryImage[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Gallery Config Interface
export interface IGalleryConfig extends Document {
  title: string;
  subtitle: string;
  layout: 'grid' | 'masonry' | 'slider';
  showFilters: boolean;
  showStats: boolean;
  heroImage?: string;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Gallery Image Schema
const GalleryImageSchema = new Schema<IGalleryImage>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  src: {
    type: String,
    required: true
  },
  alt: {
    type: String,
    required: true
  },
  category: {
    type: String,
    default: 'general'
  },
  featured: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  order: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Gallery Section Schema
const GallerySectionSchema = new Schema<IGallerySection>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0
  },
  images: [GalleryImageSchema],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Gallery Config Schema
const GalleryConfigSchema = new Schema<IGalleryConfig>({
  title: {
    type: String,
    default: 'Our Gallery'
  },
  subtitle: {
    type: String,
    default: 'Discover our craftsmanship through stunning visuals'
  },
  layout: {
    type: String,
    enum: ['grid', 'masonry', 'slider'],
    default: 'grid'
  },
  showFilters: {
    type: Boolean,
    default: true
  },
  showStats: {
    type: Boolean,
    default: true
  },
  heroImage: {
    type: String
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

const GallerySection: Model<IGallerySection> = mongoose.models.GallerySection || mongoose.model<IGallerySection>('GallerySection', GallerySectionSchema);
const GalleryConfig: Model<IGalleryConfig> = mongoose.models.GalleryConfig || mongoose.model<IGalleryConfig>('GalleryConfig', GalleryConfigSchema);

export { GallerySection, GalleryConfig };
