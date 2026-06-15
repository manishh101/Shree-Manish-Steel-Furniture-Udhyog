import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISiteSettings extends Document {
  // Contact Information
  phone: string;
  phones?: string[];
  email: string;
  address: string;
  businessHours: string;
  
  // Social Media Links
  social: {
    whatsapp?: string;
    viber?: string;
    facebook?: string;
    instagram?: string;
    tiktok?: string;
    twitter?: string;
    youtube?: string;
  };
  
  // Map
  mapUrl?: string;
  
  // Business Info
  businessName: string;
  tagline?: string;
  logo?: string;
  
  // Meta Info
  updatedAt: Date;
  updatedBy?: mongoose.Types.ObjectId;
}

const SiteSettingsSchema = new Schema<ISiteSettings>({
  phone: {
    type: String,
    required: true,
    trim: true,
    default: '+977 9824336371'
  },
  phones: {
    type: [String],
    default: ['+977 9824336371']
  },
  email: {
    type: String,
    required: true,
    trim: true,
    default: 'shreemanishfurniture@gmail.com'
  },
  address: {
    type: String,
    required: true,
    trim: true,
    default: 'Dharan Rd, Biratnagar 56613, Nepal'
  },
  businessHours: {
    type: String,
    trim: true,
    default: 'Sunday - Friday: 8:00 AM - 7:00 PM\nSaturday: 8:00 AM - 12:00 PM'
  },
  social: {
    whatsapp: { type: String, trim: true, default: '' },
    viber: { type: String, trim: true, default: '' },
    facebook: { type: String, trim: true, default: '' },
    instagram: { type: String, trim: true, default: '' },
    tiktok: { type: String, trim: true, default: '' },
    twitter: { type: String, trim: true, default: '' },
    youtube: { type: String, trim: true, default: '' }
  },
  mapUrl: {
    type: String,
    trim: true,
    default: ''
  },
  businessName: {
    type: String,
    required: true,
    trim: true,
    default: 'Shree Manish Steel Furniture Udhyog'
  },
  tagline: {
    type: String,
    trim: true,
    default: 'Quality Steel Furniture for Your Home & Office'
  },
  logo: {
    type: String,
    trim: true,
    default: ''
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false
  }
});

// Ensure only one settings document exists
SiteSettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

const SiteSettings: Model<ISiteSettings> = mongoose.models.SiteSettings || mongoose.model<ISiteSettings>('SiteSettings', SiteSettingsSchema);

export default SiteSettings;
