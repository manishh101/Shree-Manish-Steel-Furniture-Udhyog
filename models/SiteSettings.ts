import mongoose, { Schema, Document, Model } from 'mongoose';

// Service Area interface
export interface IServiceArea {
  name: string;
  type: 'city' | 'district' | 'province';
  priority: 'primary' | 'secondary';
  deliveryAvailable: boolean;
}

// LocalBusiness information interface
export interface ILocalBusinessInfo {
  name: string;
  legalName: string;
  address: {
    street: string;
    city: string;
    region: string;
    postalCode: string;
    country: string;
  };
  geo: {
    latitude: number;
    longitude: number;
  };
  contacts: {
    phones: string[];
    whatsapp: string;
    email: string;
  };
  openingHours: string[];
  socialProfiles: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
    twitter?: string;
  };
}

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
  
  // SEO Configuration
  businessInfo?: ILocalBusinessInfo;
  serviceAreas?: IServiceArea[];
  defaultTitleSuffix?: string;
  defaultDescription?: string;
  defaultKeywords?: string[];
  ogImage?: string;
  googleAnalyticsId?: string;
  googleSearchConsoleId?: string;
  priceRange?: string;
  currencyAccepted?: string;
  paymentAccepted?: string[];
  
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
  // SEO Configuration
  businessInfo: {
    type: {
      name: { type: String, trim: true },
      legalName: { type: String, trim: true },
      address: {
        street: { type: String, trim: true },
        city: { type: String, trim: true },
        region: { type: String, trim: true },
        postalCode: { type: String, trim: true },
        country: { type: String, trim: true }
      },
      geo: {
        latitude: { type: Number },
        longitude: { type: Number }
      },
      contacts: {
        phones: { type: [String] },
        whatsapp: { type: String, trim: true },
        email: { type: String, trim: true }
      },
      openingHours: { type: [String] },
      socialProfiles: {
        facebook: { type: String, trim: true },
        instagram: { type: String, trim: true },
        youtube: { type: String, trim: true },
        twitter: { type: String, trim: true }
      }
    },
    required: false,
    default: undefined
  },
  serviceAreas: {
    type: [{
      name: { type: String, required: true, trim: true },
      type: { 
        type: String, 
        required: true, 
        enum: ['city', 'district', 'province'],
        trim: true 
      },
      priority: { 
        type: String, 
        required: true, 
        enum: ['primary', 'secondary'],
        trim: true 
      },
      deliveryAvailable: { type: Boolean, required: true, default: true }
    }],
    default: []
  },
  defaultTitleSuffix: {
    type: String,
    trim: true,
    default: ' | Shree Manish Steel Furniture'
  },
  defaultDescription: {
    type: String,
    trim: true,
    default: 'Quality powder-coated steel furniture manufacturer in Biratnagar, Nepal. Almirahs, tables, racks and custom furniture with free delivery.'
  },
  defaultKeywords: {
    type: [String],
    default: ['steel furniture', 'furniture Nepal', 'Biratnagar furniture', 'steel almirah', 'office furniture']
  },
  ogImage: {
    type: String,
    trim: true,
    default: ''
  },
  googleAnalyticsId: {
    type: String,
    trim: true,
    default: 'G-TGW5L8QT90'
  },
  googleSearchConsoleId: {
    type: String,
    trim: true,
    default: ''
  },
  priceRange: {
    type: String,
    trim: true,
    default: 'Rs. 2,000 - Rs. 100,000'
  },
  currencyAccepted: {
    type: String,
    trim: true,
    default: 'NPR'
  },
  paymentAccepted: {
    type: [String],
    default: ['Cash', 'eSewa', 'Khalti', 'Bank Transfer']
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
