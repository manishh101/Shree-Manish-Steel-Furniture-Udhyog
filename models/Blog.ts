import mongoose, { Schema, Document } from 'mongoose';

export interface IBlog extends Document {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  image: string;
  author: string;
  status: 'draft' | 'published';
  metaTitle?: string;
  metaDescription?: string;
  readTime: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const BlogSchema = new Schema<IBlog>(
  {
    title: {
      type: String,
      required: [true, 'Blog title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    slug: {
      type: String,
      required: [true, 'Blog slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true
    },
    content: {
      type: String,
      required: [true, 'Blog content is required']
    },
    excerpt: {
      type: String,
      required: [true, 'Blog excerpt is required'],
      trim: true,
      maxlength: [500, 'Excerpt cannot exceed 500 characters']
    },
    image: {
      type: String,
      default: '',
      trim: true
    },
    author: {
      type: String,
      default: 'Shree Manish Steel Furniture',
      trim: true
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
      index: true
    },
    metaTitle: {
      type: String,
      trim: true,
      maxlength: [200, 'Meta title cannot exceed 200 characters']
    },
    metaDescription: {
      type: String,
      trim: true,
      maxlength: [300, 'Meta description cannot exceed 300 characters']
    },
    readTime: {
      type: Number,
      default: 5
    },
    tags: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

// Index for query performance
BlogSchema.index({ status: 1, createdAt: -1 });

const Blog = mongoose.models.Blog || mongoose.model<IBlog>('Blog', BlogSchema);

export default Blog;
