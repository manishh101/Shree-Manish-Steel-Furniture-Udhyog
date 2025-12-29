import mongoose, { Schema, Document } from 'mongoose';

export interface IService extends Document {
  title: string;
  description: string;
  icon: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema = new Schema<IService>(
  {
    title: {
      type: String,
      required: [true, 'Service title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Service description is required'],
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    icon: {
      type: String,
      default: '🔧',
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    order: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Index for ordering
ServiceSchema.index({ order: 1 });
ServiceSchema.index({ isActive: 1 });

// Check if model already exists (for hot reloading in development)
const Service = mongoose.models.Service || mongoose.model<IService>('Service', ServiceSchema);

export default Service;
