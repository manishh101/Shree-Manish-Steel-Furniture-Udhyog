import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { connectDB } from '@/lib/db';
import About from '@/models/About';

// Disable caching to ensure real-time updates from admin
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'About Us - Best Furniture Manufacturer in Biratnagar',
  description: 'Shree Manish Steel Furniture - Trusted furniture manufacturer in Biratnagar since 2009. Quality steel and wood furniture for homes and offices. Visit our showroom in Biratnagar.',
  keywords: ['furniture manufacturer Biratnagar', 'about Manish Steel', 'furniture company Nepal', 'steel furniture factory'],
};

// Default content - fallback if database fetch fails
const defaultContent = {
  heroTitle: "About Our Company",
  heroDescription: "Shree Manish Steel Furniture Industry is a leading manufacturer of high-quality steel and wooden furniture in Nepal, dedicated to providing durable and stylish solutions for homes and offices.",
  storyTitle: "Our Story",
  storyImage: "",
  storyContent: [
    "Founded over a decade ago, Shree Manish Steel Furniture Industry began with a simple mission: to create high-quality, affordable furniture for Nepali homes and businesses. What started as a small workshop has grown into one of the most trusted furniture manufacturers in the region.",
    "Our journey has been defined by a commitment to craftsmanship, innovation, and customer satisfaction. We take pride in our Nepali heritage and continue to support local communities through employment opportunities and sustainable business practices.",
    "Today, we offer a comprehensive range of steel and wooden furniture solutions, from household almirahs to complete office setups, all designed with the unique needs of our customers in mind."
  ],
  yearsExperience: "10+",
  happyCustomers: "1000+",
  vision: "To be the leading furniture manufacturer in Nepal, recognized for quality, innovation, and customer service. We envision a future where every Nepali home and office is furnished with our durable, stylish, and affordable products.",
  mission: "To create furniture that combines functionality, durability, and aesthetic appeal at competitive prices. We are committed to using quality materials, employing skilled craftsmen, and maintaining high standards of production to deliver products that exceed customer expectations.",
  coreValues: [
    {
      title: "Quality",
      description: "We never compromise on the quality of our materials or craftsmanship, ensuring products that last for generations.",
      icon: "quality"
    },
    {
      title: "Innovation",
      description: "We continuously explore new designs, technologies, and processes to improve our products and meet evolving customer needs.",
      icon: "innovation"
    },
    {
      title: "Integrity",
      description: "We conduct our business with honesty, transparency, and ethical practices, building trust with customers, employees, and partners.",
      icon: "integrity"
    },
    {
      title: "Customer Focus",
      description: "We prioritize customer satisfaction by listening to feedback, providing excellent service, and creating products that meet real needs.",
      icon: "customer"
    }
  ],
  workshopTitle: "Our Workshop & Team",
  workshopDescription: "Take a glimpse into our production facility and meet the skilled craftsmen behind our quality furniture.",
  workshopImages: [] as string[]
};

// Fetch about content from database
async function getAboutContent() {
  try {
    await connectDB();
    const aboutData = await About.findOne().lean();
    
    if (aboutData) {
      return {
        heroTitle: aboutData.heroTitle || defaultContent.heroTitle,
        heroDescription: aboutData.heroDescription || defaultContent.heroDescription,
        storyTitle: aboutData.storyTitle || defaultContent.storyTitle,
        storyImage: aboutData.storyImage || defaultContent.storyImage,
        storyContent: aboutData.storyContent?.length ? aboutData.storyContent : defaultContent.storyContent,
        yearsExperience: aboutData.yearsExperience || defaultContent.yearsExperience,
        happyCustomers: aboutData.happyCustomers || defaultContent.happyCustomers,
        vision: aboutData.vision || defaultContent.vision,
        mission: aboutData.mission || defaultContent.mission,
        coreValues: aboutData.coreValues?.length ? aboutData.coreValues : defaultContent.coreValues,
        workshopTitle: aboutData.workshopTitle || defaultContent.workshopTitle,
        workshopDescription: aboutData.workshopDescription || defaultContent.workshopDescription,
        workshopImages: aboutData.workshopImages?.length ? aboutData.workshopImages : defaultContent.workshopImages
      };
    }
    
    return defaultContent;
  } catch (error) {
    console.error('Error fetching about content:', error);
    return defaultContent;
  }
}

// Icon component for core values
function CoreValueIcon({ type }: { type: string }) {
  const iconClass = "h-10 w-10 text-primary";
  
  switch (type?.toLowerCase()) {
    case 'quality':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      );
    case 'innovation':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      );
    case 'integrity':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      );
    case 'customer':
    case 'customer focus':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      );
    default:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      );
  }
}

export default async function AboutPage() {
  const content = await getAboutContent();
  
  return (
    <div className="min-h-screen">
      {/* Enhanced Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-48 translate-x-48"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-32 -translate-x-32"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight animate-fadeIn">
            {content.heroTitle}
          </h1>
          <p className="text-lg md:text-xl max-w-3xl leading-relaxed opacity-90 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            {content.heroDescription}
          </p>
        </div>
      </section>
      
      {/* Enhanced Company Introduction */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl transform rotate-3"></div>
                {content.storyImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={content.storyImage} 
                    alt="Our Story" 
                    className="relative rounded-xl shadow-2xl w-full h-96 object-cover transform -rotate-1 hover:rotate-0 transition-transform duration-500"
                  />
                ) : (
                  <div className="relative rounded-xl shadow-2xl w-full transform -rotate-1 hover:rotate-0 transition-transform duration-500 bg-gradient-to-br from-primary/10 to-accent/10 h-96 flex items-center justify-center">
                    <div className="text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-primary/40 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span className="text-primary/60 font-medium">Shree Manish Steel</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="lg:w-1/2">
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  {content.storyTitle}
                </h2>
                {content.storyContent.map((paragraph, idx) => (
                  <p key={idx} className="text-gray-600 leading-relaxed text-lg">
                    {paragraph}
                  </p>
                ))}
                
                {/* Stats */}
                <div className="grid grid-cols-2 gap-6 pt-8">
                  <div className="text-center p-4 bg-primary/5 rounded-xl">
                    <div className="text-3xl font-bold text-primary mb-2">
                      {content.yearsExperience}
                    </div>
                    <div className="text-gray-600">Years Experience</div>
                  </div>
                  <div className="text-center p-4 bg-primary/5 rounded-xl">
                    <div className="text-3xl font-bold text-primary mb-2">
                      {content.happyCustomers}
                    </div>
                    <div className="text-gray-600">Happy Customers</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Enhanced Vision & Mission */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-primary/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Vision & Mission</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Driving our company forward with clear purpose and unwavering commitment to excellence.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Vision */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 h-full">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center mb-6 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
              <p className="text-gray-600 leading-relaxed">
                {content.vision}
              </p>
            </div>
            
            {/* Mission */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 h-full">
              <div className="w-20 h-20 bg-gradient-to-br from-accent to-accent/80 rounded-2xl flex items-center justify-center mb-6 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed">
                {content.mission}
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Enhanced Core Values */}
      {content.coreValues.length > 0 && (
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Core Values</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                The principles that guide everything we do and shape our company culture.
              </p>
            </div>
            
            <div className={`grid grid-cols-1 sm:grid-cols-2 ${content.coreValues.length >= 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-' + content.coreValues.length} gap-8`}>
              {content.coreValues.map((value, idx) => (
                <div key={idx} className="text-center p-6 group hover:bg-gray-50 rounded-2xl transition-colors duration-300">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <CoreValueIcon type={value.icon || value.title} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
      
      {/* Workshop Section */}
      {content.workshopImages && content.workshopImages.length > 0 && (
        <section className="py-20 bg-gradient-to-br from-gray-50 to-primary/5">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{content.workshopTitle}</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                {content.workshopDescription}
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {content.workshopImages.filter(img => img).map((image, idx) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  key={idx}
                  src={image} 
                  alt={`Workshop ${idx + 1}`}
                  className="w-full h-48 md:h-64 object-cover rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300"
                />
              ))}
            </div>
          </div>
        </section>
      )}
      
      {/* Call to Action */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="bg-gradient-to-br from-primary/5 to-accent/5 p-8 rounded-2xl max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Work With Us?</h3>
              <p className="text-gray-600 mb-6">
                Experience the quality and craftsmanship that sets us apart. Contact us today to discuss your furniture needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/contact" 
                  className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                  Contact Us
                </Link>
                <Link 
                  href="/products" 
                  className="border border-primary text-primary px-8 py-3 rounded-lg hover:bg-primary hover:text-white transition-colors font-medium"
                >
                  View Products
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
