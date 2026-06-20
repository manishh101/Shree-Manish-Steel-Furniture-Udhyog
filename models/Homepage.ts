import mongoose, { Schema, Document } from 'mongoose';

export interface IHomepage extends Document {
  // Hero Section
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  heroImage: string;
  heroButtonText: string;
  heroButtonLink: string;
  heroSecondaryButtonText: string;
  heroSecondaryButtonLink: string;
  
  // Features Section
  featuresTitle: string;
  featuresEnabled: boolean;
  features: {
    icon: string;
    title: string;
    description: string;
  }[];
  
  // Why Choose Us Section
  whyChooseUsTitle: string;
  whyChooseUsDescription: string;
  whyChooseUsEnabled: boolean;
  whyChooseUsItems: {
    icon: string;
    title: string;
    description: string;
  }[];
  
  // CTA Section
  ctaTitle: string;
  ctaDescription: string;
  ctaButtonText: string;
  ctaButtonLink: string;
  ctaSecondaryButtonText: string;
  ctaSecondaryButtonLink: string;
  ctaEnabled: boolean;
  
  // Testimonials Section
  testimonialsTitle: string;
  testimonialsSubtitle: string;
  testimonialsEnabled: boolean;
  
  // Services Section  
  servicesTitle: string;
  servicesSubtitle: string;
  servicesEnabled: boolean;
  
  // Location Section
  locationTitle: string;
  locationSubtitle: string;
  locationEnabled: boolean;
  
  // SEO
  metaTitle: string;
  metaDescription: string;
  
  lastUpdated: Date;
}

const HomepageSchema = new Schema<IHomepage>({
  // Hero Section
  heroTitle: { type: String, default: 'Shree Manish Steel' },
  heroSubtitle: { type: String, default: 'Furniture Udhyog' },
  heroDescription: { type: String, default: 'Quality Steel Furniture for Every Space' },
  heroImage: { type: String, default: '/images/home-page-1.png' },
  heroButtonText: { type: String, default: 'View Products' },
  heroButtonLink: { type: String, default: '/products' },
  heroSecondaryButtonText: { type: String, default: 'Contact Us' },
  heroSecondaryButtonLink: { type: String, default: '/contact' },
  
  // Features Section
  featuresTitle: { type: String, default: 'Why Choose Us?' },
  featuresEnabled: { type: Boolean, default: true },
  features: [{
    icon: { type: String, default: '' },
    title: { type: String, default: '' },
    description: { type: String, default: '' }
  }],
  
  // Why Choose Us Section
  whyChooseUsTitle: { type: String, default: "Nepal's Leading Steel Furniture Manufacturer" },
  whyChooseUsDescription: { type: String, default: 'Trusted by thousands of customers across Nepal for premium quality steel furniture at affordable prices.' },
  whyChooseUsEnabled: { type: Boolean, default: true },
  whyChooseUsItems: [{
    icon: { type: String, default: '' },
    title: { type: String, default: '' },
    description: { type: String, default: '' }
  }],
  
  // CTA Section
  ctaTitle: { type: String, default: 'Ready to Transform Your Space?' },
  ctaDescription: { type: String, default: 'Contact us today to discuss your furniture needs or visit our showroom to see our products in person.' },
  ctaButtonText: { type: String, default: 'Contact Us' },
  ctaButtonLink: { type: String, default: '/contact' },
  ctaSecondaryButtonText: { type: String, default: 'Request Custom Order' },
  ctaSecondaryButtonLink: { type: String, default: '/custom-order' },
  ctaEnabled: { type: Boolean, default: true },
  
  // Testimonials Section
  testimonialsTitle: { type: String, default: 'What Our Customers Say' },
  testimonialsSubtitle: { type: String, default: 'Discover why our customers trust us with their furniture needs.' },
  testimonialsEnabled: { type: Boolean, default: true },
  
  // Services Section
  servicesTitle: { type: String, default: 'Our Services' },
  servicesSubtitle: { type: String, default: 'Comprehensive furniture solutions tailored to your needs' },
  servicesEnabled: { type: Boolean, default: true },
  
  // Location Section
  locationTitle: { type: String, default: 'Visit Our Showroom' },
  locationSubtitle: { type: String, default: 'Experience our furniture collection in person at our Biratnagar showroom.' },
  locationEnabled: { type: Boolean, default: true },
  
  // SEO
  metaTitle: { type: String, default: 'Shree Manish Steel Furniture - Quality Steel & Wooden Furniture in Nepal' },
  metaDescription: { type: String, default: 'Premium quality powder-coated steel furniture manufacturer in Biratnagar, Nepal. Almirahs, office furniture and more.' },
  
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

// Ensure only one document exists
HomepageSchema.statics.getSingleton = async function() {
  let doc = await this.findOne();
  if (!doc) {
    doc = await this.create({});
  }
  return doc;
};

export default mongoose.models.Homepage || mongoose.model<IHomepage>('Homepage', HomepageSchema);
