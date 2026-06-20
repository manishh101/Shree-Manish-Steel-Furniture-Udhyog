import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IURLRedirect extends Document {
  from: string;
  to: string;
  permanent: boolean;
  createdAt: Date;
  hits: number;
  lastHit?: Date;
}

const URLRedirectSchema = new Schema<IURLRedirect>({
  from: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    index: true
  },
  to: {
    type: String,
    required: true,
    trim: true
  },
  permanent: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  hits: {
    type: Number,
    default: 0
  },
  lastHit: {
    type: Date
  }
});

// Create indexes for fast lookup
URLRedirectSchema.index({ from: 1 });
URLRedirectSchema.index({ createdAt: -1 });
URLRedirectSchema.index({ hits: -1 });

// Clear the model if it exists to ensure schema updates are picked up (important for dev hot-reloads)
if (mongoose.models.URLRedirect) {
  delete mongoose.models.URLRedirect;
}

const URLRedirect: Model<IURLRedirect> = mongoose.model<IURLRedirect>('URLRedirect', URLRedirectSchema);

export default URLRedirect;
