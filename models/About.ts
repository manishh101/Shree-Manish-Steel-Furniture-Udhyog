import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICoreValue {
  title: string;
  description: string;
  icon: string;
}

export interface IAbout extends Document {
  heroTitle: string;
  heroDescription: string;
  storyTitle: string;
  storyImage: string;
  storyContent: string[];
  yearsExperience: string;
  happyCustomers: string;
  vision: string;
  mission: string;
  coreValues: ICoreValue[];
  workshopTitle: string;
  workshopDescription: string;
  workshopImages: string[];
  lastUpdated: Date;
}

const AboutSchema = new Schema<IAbout>({
  heroTitle: {
    type: String,
    required: [true, 'Hero title is required'],
    default: 'About Our Company'
  },
  heroDescription: {
    type: String,
    required: [true, 'Hero description is required'],
    default: 'Shree Manish Steel Furnitry Industry is a leading manufacturer of high-quality steel and wooden furniture in Nepal.'
  },
  storyTitle: {
    type: String,
    default: 'Our Story'
  },
  storyImage: {
    type: String,
    default: '/images/furniture-1.jpg'
  },
  storyContent: [{
    type: String,
    required: true
  }],
  yearsExperience: {
    type: String,
    default: '10+'
  },
  happyCustomers: {
    type: String,
    default: '1000+'
  },
  vision: {
    type: String,
    required: [true, 'Vision statement is required'],
    default: 'To be the leading furniture manufacturer in Nepal, recognized for quality, innovation, and customer service.'
  },
  mission: {
    type: String,
    required: [true, 'Mission statement is required'],
    default: 'To create furniture that combines functionality, durability, and aesthetic appeal at competitive prices.'
  },
  coreValues: [{
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      default: 'CheckBadgeIcon'
    }
  }],
  workshopTitle: {
    type: String,
    default: 'Our Workshop & Team'
  },
  workshopDescription: {
    type: String,
    default: 'Take a glimpse into our production facility and meet the skilled craftsmen behind our quality furniture.'
  },
  workshopImages: [{
    type: String
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

const About: Model<IAbout> = mongoose.models.About || mongoose.model<IAbout>('About', AboutSchema);

export default About;
