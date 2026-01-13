'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { testimonials } from '@/data/testimonials';
import ScrollAnimator from '@/components/ScrollAnimator';
import CleanTopProductsSection from '@/components/CleanTopProductsSection';
import CleanMostSellingSection from '@/components/CleanMostSellingSection';
import OptimizedImage from '@/components/common/OptimizedImage';
import EnhancedOptimizedImage from '@/components/common/EnhancedOptimizedImage';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { servicesAPI, Service, homepageAPI, HomepageData } from '@/services/api';

interface Category {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  image?: string;
}

// Category thumbnail cache
const categoryThumbnailCache: Record<string, string> = {};

// Default homepage content
const defaultHomepageContent: Partial<HomepageData> = {
  heroTitle: 'Shree Manish Steel',
  heroSubtitle: 'Furniture Udhyog',
  heroDescription: 'Quality Steel Furniture for Every Space',
  heroImage: '/images/home-page-1.png',
  heroButtonText: 'View Products',
  heroButtonLink: '/products',
  heroSecondaryButtonText: 'Contact Us',
  heroSecondaryButtonLink: '/contact',
  featuresTitle: 'Why Choose Us?',
  featuresEnabled: true,
  whyChooseUsTitle: "Nepal's Leading Steel Furniture Manufacturer",
  whyChooseUsDescription: 'Trusted by thousands of customers across Nepal for premium quality steel furniture at affordable prices.',
  whyChooseUsEnabled: true,
  whyChooseUsItems: [
    { icon: '🏆', title: '15+ Years Experience', description: 'Trusted manufacturing expertise' },
    { icon: '🚚', title: 'Fast Delivery', description: 'Across Biratnagar, Dharan, Itahari & nearby places' },
    { icon: '💎', title: 'Premium Quality', description: '5-year warranty & free installation' }
  ],
  ctaTitle: 'Ready to Transform Your Space?',
  ctaDescription: 'Contact us today to discuss your furniture needs or visit our showroom to see our products in person.',
  ctaButtonText: 'Contact Us',
  ctaButtonLink: '/contact',
  ctaSecondaryButtonText: 'Request Custom Order',
  ctaSecondaryButtonLink: '/custom-order',
  ctaEnabled: true,
  testimonialsTitle: 'What Our Customers Say',
  testimonialsSubtitle: 'Discover why our customers trust us with their furniture needs.',
  testimonialsEnabled: true,
  servicesTitle: 'Our Services',
  servicesSubtitle: 'Comprehensive furniture solutions tailored to your needs',
  servicesEnabled: true,
  locationTitle: 'Visit Our Showroom',
  locationSubtitle: 'Experience our furniture collection in person at our Biratnagar showroom.',
  locationEnabled: true,
};

export default function HomePage() {
  const router = useRouter();
  const { settings } = useSiteSettings();

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryThumbnails, setCategoryThumbnails] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [currentTestimonialPage, setCurrentTestimonialPage] = useState(0);
  const [testimonialsPerPage, setTestimonialsPerPage] = useState(3);

  // Homepage content from database
  const [homepageContent, setHomepageContent] = useState<Partial<HomepageData>>(defaultHomepageContent);
  const [imageKey, setImageKey] = useState(0);

  // Services state - fetch from database
  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);

  // Fetch homepage content from database
  useEffect(() => {
    const fetchHomepageContent = async () => {
      try {
        const response = await homepageAPI.getContent();
        if (response?.success && response.data) {
          setHomepageContent({ ...defaultHomepageContent, ...response.data });
          setImageKey(Date.now());
        }
      } catch (error) {
        console.error('Error fetching homepage content:', error);
        // Keep default content on error
      }
    };

    fetchHomepageContent();
  }, []);

  // Fetch services from database
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setServicesLoading(true);
        const response = await servicesAPI.getAll(true); // Get active services only
        if (response.success && response.services) {
          setServices(response.services);
        }
      } catch (error) {
        console.error('Error fetching services:', error);
        // Use fallback services if API fails
        setServices([
          { _id: '1', title: 'Custom Manufacturing', description: 'We create custom steel furniture tailored to your specific requirements and space.', icon: '🏭', isActive: true, order: 1 },
          { _id: '2', title: 'Free Consultation', description: 'Our experts provide free consultation to help you choose the perfect furniture.', icon: '💬', isActive: true, order: 2 },
          { _id: '3', title: 'Installation Service', description: 'Professional installation service included with every purchase.', icon: '🔧', isActive: true, order: 3 },
          { _id: '4', title: 'After-Sales Support', description: '5-year warranty and dedicated after-sales support for all products.', icon: '🛡️', isActive: true, order: 4 },
          { _id: '5', title: 'Bulk Orders', description: 'Special pricing for bulk orders for offices, schools, and institutions.', icon: '📦', isActive: true, order: 5 },
          { _id: '6', title: 'Fast Delivery', description: 'Quick delivery across Biratnagar, Dharan, Itahari and nearby areas.', icon: '🚚', isActive: true, order: 6 }
        ]);
      } finally {
        setServicesLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Fetch categories and their thumbnails
  useEffect(() => {
    const fetchCategoryThumbnail = async (categoryId: string, categoryName: string): Promise<string | null> => {
      try {
        // Check cache first
        if (categoryThumbnailCache[categoryId]) {
          return categoryThumbnailCache[categoryId];
        }

        // Fetch a product from this category to use its image
        const response = await fetch(`/api/products?category=${categoryId}&limit=1`);
        const data = await response.json();

        if (data.products && data.products.length > 0 && data.products[0].image) {
          const imageUrl = data.products[0].image;
          categoryThumbnailCache[categoryId] = imageUrl;
          return imageUrl;
        }

        return null;
      } catch (error) {
        console.error(`Error fetching thumbnail for ${categoryName}:`, error);
        return null;
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        if (data && Array.isArray(data)) {
          setCategories(data);

          // Fetch thumbnails for each category
          const thumbnails: Record<string, string> = {};
          await Promise.all(
            data.map(async (category: Category) => {
              const categoryId = category._id || category.id || '';
              const thumbnail = await fetchCategoryThumbnail(categoryId, category.name);
              if (thumbnail) {
                thumbnails[categoryId] = thumbnail;
              }
            })
          );
          setCategoryThumbnails(thumbnails);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Handle responsive testimonials per page
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        const newPerPage = window.innerWidth >= 1024 ? 3 : window.innerWidth >= 768 ? 2 : 1;
        setTestimonialsPerPage(newPerPage);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const totalPages = Math.ceil(testimonials.length / testimonialsPerPage);

  const nextTestimonialPage = () => {
    setCurrentTestimonialPage(prev => (prev + 1) % totalPages);
  };

  const prevTestimonialPage = () => {
    setCurrentTestimonialPage(prev => (prev - 1 + totalPages) % totalPages);
  };

  const visibleTestimonials = testimonials.slice(
    currentTestimonialPage * testimonialsPerPage,
    (currentTestimonialPage * testimonialsPerPage) + testimonialsPerPage
  );

  const handleCategoryClick = (categoryId: string) => {
    router.push(`/products?category=${categoryId}`);
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="min-h-[85vh] flex items-center justify-center bg-background py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-10">
            {/* Left Content */}
            <div className="md:w-[48%] lg:w-[45%] mb-10 md:mb-0 animate-fadeIn">
              {/* Premium Typography for Shree Manish Steel Furniture Udhyog */}
              <div className="text-center md:text-left">
                <p className="text-xs md:text-sm text-primary/80 font-medium tracking-widest uppercase mb-2 animate-fadeIn">
                  {homepageContent.heroSubtitle || 'Furniture Udhyog'}
                </p>
                <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-primary leading-tight animate-slideInLeft" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {homepageContent.heroTitle || 'Shree Manish Steel'}
                </h1>
                {/* <p className="text-sm md:text-base lg:text-lg text-gray-600 mt-4 max-w-md animate-fadeIn" style={{animationDelay: '0.2s'}}>
                  Quality Steel Furniture for Every Space - Built to Last
                </p> */}
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-6 md:mt-8 animate-slideInLeft" style={{ animationDelay: '0.3s' }}>
                <Link
                  href={homepageContent.heroButtonLink || '/products'}
                  className="bg-primary text-white font-semibold px-6 py-2.5 md:px-8 md:py-3 rounded-lg hover:bg-primary/90 transition-all duration-300 shadow-md hover:shadow-lg text-sm md:text-base"
                  style={{ minWidth: '140px', textAlign: 'center' }}
                >
                  {homepageContent.heroButtonText || 'View Products'}
                </Link>
                <Link
                  href={homepageContent.heroSecondaryButtonLink || '/contact'}
                  className="bg-white text-primary font-semibold px-6 py-2.5 md:px-8 md:py-3 rounded-lg border-2 border-primary hover:bg-primary/5 transition-all duration-300 shadow-sm text-sm md:text-base"
                  style={{ minWidth: '140px', textAlign: 'center' }}
                >
                  {homepageContent.heroSecondaryButtonText || 'Contact Us'}
                </Link>
              </div>
            </div>


            {/* Right Image */}
            <div className="w-full md:w-[52%] lg:w-[55%] animate-fadeIn mt-8 md:mt-0" style={{ animationDelay: '0.4s' }}>
              <div className="relative w-full h-[350px] sm:h-[400px] md:h-[450px] lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl bg-gray-100">
                <Image
                  key={imageKey}
                  src={(homepageContent.heroImage && homepageContent.heroImage.trim() !== '') ? homepageContent.heroImage : '/images/home-page-1.png'}
                  alt="Manish Steel Furniture Collection"
                  fill
                  priority
                  quality={90}
                  className="object-cover transition-opacity duration-700"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 800px"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (!target.src.includes('home-page-1.png')) {
                      target.src = '/images/home-page-1.png';
                    }
                  }}
                />
                {/* Decorative Elements */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

                <div className="absolute -bottom-2 -right-2 md:-bottom-4 md:-right-4 bg-accent w-16 h-16 md:w-24 md:h-24 rounded-full flex items-center justify-center text-primary font-bold text-xs md:text-lg z-10 shadow-lg animate-bounce-slow">
                  New<br />Designs
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      {homepageContent.featuresEnabled !== false && (
        <section className="py-12 md:py-16 bg-primary text-white">
          <div className="container mx-auto px-4">
            <ScrollAnimator animation="fadeUp">
              <div className="text-center mb-10 md:mb-12">
                <h4 className="text-xs md:text-sm font-medium tracking-widest uppercase text-white/70 mb-2">Our Promise</h4>
                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold">{homepageContent.featuresTitle || 'Why Choose Us?'}</h2>
              </div>
            </ScrollAnimator>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
              {[
                { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', title: 'Premium Quality', desc: '100% Premium Quality Products.' },
                { icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01', title: 'Modern Design', desc: 'Contemporary and stylish designs.' },
                { icon: 'M13 10V3L4 14h7v7l9-11h-7z', title: 'Fast Delivery', desc: 'Quick delivery across Nepal.' },
                { icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z', title: 'Customer Support', desc: 'Response, Service & Support.' }
              ].map((feature, index) => (
                <div key={index} className="bg-white/10 p-4 md:p-6 rounded-lg backdrop-blur-sm h-full flex flex-col items-center text-center" style={{ animationDelay: `${0.1 + (index * 0.1)}s` }}>
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-accent rounded-full flex items-center justify-center mb-3 md:mb-4 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-7 md:w-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                    </svg>
                  </div>
                  <h3 className="text-base md:text-lg font-semibold mb-1.5 flex-shrink-0">{feature.title}</h3>
                  <p className="text-xs md:text-sm text-white/80 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Category Display Section */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-10">
            <h4 className="text-xs md:text-sm font-medium tracking-widest uppercase text-gray-500 mb-2">Explore Categories</h4>
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-primary animate-fadeIn">
              Browse Our Collections
            </h2>
          </div>

          {/* Mobile Scroll Indicator */}
          <div className="md:hidden text-center mb-4">
            <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
              </svg>
              Swipe to see more
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </p>
          </div>

          {/* Categories Grid */}
          {loading ? (
            <div className="flex md:grid overflow-x-auto md:overflow-x-visible gap-8 md:grid-cols-2 lg:grid-cols-3 snap-x snap-mandatory md:snap-none pb-4 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0">
              {[1, 2, 3].map((index) => (
                <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden flex-shrink-0 w-[85vw] md:w-auto snap-center">
                  <div className="aspect-[4/3] bg-gray-200 animate-pulse"></div>
                  <div className="p-6">
                    <div className="bg-gray-200 h-6 rounded mb-2 animate-pulse"></div>
                    <div className="bg-gray-200 h-4 rounded mb-4 w-3/4 animate-pulse"></div>
                    <div className="bg-gray-200 h-8 rounded w-1/3 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex md:grid overflow-x-auto md:overflow-x-visible gap-8 md:grid-cols-2 lg:grid-cols-3 snap-x snap-mandatory md:snap-none pb-4 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0">
              {categories.map((category, index) => {
                const categoryId = category._id || category.id || '';
                const thumbnailUrl = categoryThumbnails[categoryId];
                // Use local furniture image instead of placehold.co to avoid flower/external images
                const fallbackImages = ['/images/furniture-1.jpg', '/images/furniture-2.jpg'];
                const fallbackUrl = fallbackImages[index % fallbackImages.length];

                return (
                  <div
                    key={categoryId}
                    className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl animate-fadeInUp group flex-shrink-0 w-[85vw] md:w-auto snap-center"
                    style={{ animationDelay: `${0.1 + (index * 0.1)}s` }}
                  >
                    <div className="relative w-full overflow-hidden bg-gray-100" style={{ aspectRatio: '1/1' }}>
                      <EnhancedOptimizedImage
                        src={thumbnailUrl || fallbackUrl}
                        alt={`${category.name} Products`}
                        size="medium"
                        category={category.name}
                        className="transition-transform duration-500 group-hover:scale-105"
                        priority={index < 3}
                        showFallbackIndicator={false}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4 z-20">
                        <button
                          onClick={() => handleCategoryClick(categoryId)}
                          className="bg-primary text-white px-6 py-2 rounded-full font-medium transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
                        >
                          Browse Products
                        </button>
                      </div>
                    </div>
                    <div className="p-4 md:p-6">
                      <h3 className="text-lg md:text-xl font-bold text-primary mb-2">{category.name}</h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {category.description || `Quality ${category.name?.toLowerCase()} made with precision and care for your needs.`}
                      </p>
                      <button
                        onClick={() => handleCategoryClick(categoryId)}
                        className="text-primary font-medium hover:text-primary/80 flex items-center group text-sm"
                      >
                        View Collection
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1 transform transition-transform group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex justify-center mt-8 md:mt-10">
            <Link
              href="/products"
              className="bg-primary text-white px-6 py-2.5 md:px-8 md:py-3 rounded-md hover:bg-primary/80 transition-all transform hover:scale-105 inline-flex items-center gap-2 text-sm md:text-base font-medium"
            >
              View All Products
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Our Top Products Section */}
      <CleanTopProductsSection />

      {/* Most Selling Products Section */}
      <CleanMostSellingSection />

      {/* Call to Action */}
      {homepageContent.ctaEnabled !== false && (
        <section className="py-16 bg-primary text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6 animate-fadeIn">{homepageContent.ctaTitle || 'Ready to Transform Your Space?'}</h2>
            <p className="text-base md:text-lg lg:text-xl mb-8 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
              {homepageContent.ctaDescription || 'Contact us today to discuss your furniture needs or visit our showroom to see our products in person.'}
            </p>
            <div className="flex flex-wrap justify-center gap-4 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
              <Link
                href={homepageContent.ctaButtonLink || '/contact'}
                className="bg-white text-primary font-bold px-8 py-3 rounded-md hover:bg-white/90 transition-all hover:scale-105"
                style={{ minWidth: '140px', textAlign: 'center' }}
              >
                {homepageContent.ctaButtonText || 'Contact Us'}
              </Link>
              <Link
                href={homepageContent.ctaSecondaryButtonLink || '/custom-order'}
                className="bg-accent text-primary font-bold px-8 py-3 rounded-md hover:bg-accent/80 transition-all hover:scale-105"
                style={{ minWidth: '140px', textAlign: 'center' }}
              >
                {homepageContent.ctaSecondaryButtonText || 'Request Custom Order'}
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Our Services Section */}
      {homepageContent.servicesEnabled !== false && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-4">{homepageContent.servicesTitle || 'Our Services'}</h2>
              <p className="text-base md:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
                {homepageContent.servicesSubtitle || 'Comprehensive furniture solutions tailored to your needs'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {servicesLoading ? (
                <div className="col-span-full text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-gray-500">Loading services...</p>
                </div>
              ) : services.length > 0 ? (
                services.map((service) => (
                  <div key={service._id} className="bg-gray-50 p-6 rounded-lg hover:shadow-lg transition-shadow">
                    <div className="w-12 h-12 bg-primary bg-opacity-10 rounded-lg flex items-center justify-center mb-4">
                      <span className="text-2xl text-primary">{service.icon}</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{service.title}</h3>
                    <p className="text-gray-600">{service.description}</p>
                  </div>
                ))
              ) : (
                <p className="col-span-full text-center text-gray-500">No services available</p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Why Choose Us - Simplified */}
      {homepageContent.whyChooseUsEnabled !== false && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-6">
                {homepageContent.whyChooseUsTitle || "Nepal's Leading Steel Furniture Manufacturer"}
              </h2>

              <p className="text-base md:text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
                {homepageContent.whyChooseUsDescription || 'Trusted by thousands of customers across Nepal for premium quality steel furniture at affordable prices.'}
              </p>

              <div className="grid md:grid-cols-3 gap-8">
                {(homepageContent.whyChooseUsItems && homepageContent.whyChooseUsItems.length > 0) ? (
                  homepageContent.whyChooseUsItems.map((item, index) => (
                    <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-primary text-2xl">{item.icon || '✓'}</span>
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                      <p className="text-gray-600 text-sm">{item.description}</p>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-primary text-2xl">🏆</span>
                      </div>
                      <h3 className="text-lg font-semibold mb-2">15+ Years Experience</h3>
                      <p className="text-gray-600 text-sm">Trusted manufacturing expertise</p>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-primary text-2xl">🚚</span>
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Fast Delivery</h3>
                      <p className="text-gray-600 text-sm">Across Biratnagar, Dharan, Itahari & nearby places</p>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-primary text-2xl">💎</span>
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Premium Quality</h3>
                      <p className="text-gray-600 text-sm">5-year warranty & free installation</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Our Location Section */}
      {homepageContent.locationEnabled !== false && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">{homepageContent.locationTitle || 'Visit Our Showroom'}</h2>
              <p className="text-base md:text-lg text-gray-600 max-w-xl mx-auto">
                {homepageContent.locationSubtitle || 'Experience our furniture collection in person at our Biratnagar showroom.'}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Contact Information */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <span className="flex-shrink-0 w-5 h-5 bg-primary bg-opacity-10 rounded-full flex items-center justify-center text-primary mr-3 mt-0.5">•</span>
                    <div>
                      <span className="font-medium">Address: </span>
                      <span className="text-gray-600">{settings.address}</span>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="flex-shrink-0 w-5 h-5 bg-primary bg-opacity-10 rounded-full flex items-center justify-center text-primary mr-3 mt-0.5">•</span>
                    <div>
                      <span className="font-medium">Phone: </span>
                      <span className="text-gray-600">{settings.phone}</span>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="flex-shrink-0 w-5 h-5 bg-primary bg-opacity-10 rounded-full flex items-center justify-center text-primary mr-3 mt-0.5">•</span>
                    <div>
                      <span className="font-medium">Email: </span>
                      <span className="text-gray-600">{settings.email}</span>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="flex-shrink-0 w-5 h-5 bg-primary bg-opacity-10 rounded-full flex items-center justify-center text-primary mr-3 mt-0.5">•</span>
                    <div>
                      <span className="font-medium">Business Hours: </span>
                      <div className="text-gray-600">
                        {settings.businessHours.split('\n').map((line: string, i: number) => (
                          <div key={i}>{line}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <Link
                    href="/contact"
                    className="inline-flex items-center px-4 py-2 md:px-6 md:py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors text-sm md:text-base"
                  >
                    Get Directions
                  </Link>
                </div>
              </div>

              {/* Map Container */}
              <div className="lg:col-span-2 rounded-lg overflow-hidden shadow-lg h-[400px]">
                <iframe
                  src={settings.mapUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Shree Manish Steel Furniture Location"
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials Section */}
      {homepageContent.testimonialsEnabled !== false && (
        <section className="py-16 bg-gradient-to-b from-gray-100 to-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-5">
            <div className="absolute transform -rotate-12 -left-10 top-10 text-9xl font-bold text-primary">&quot;</div>
            <div className="absolute transform rotate-12 -right-10 bottom-10 text-9xl font-bold text-primary">&quot;</div>
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-2xl md:text-3xl font-bold text-primary text-center mb-3 animate-fadeIn">{homepageContent.testimonialsTitle || 'What Our Customers Say'}</h2>
              <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto">{homepageContent.testimonialsSubtitle || 'Discover why our customers trust us with their furniture needs.'}</p>
            </div>

            {/* Testimonial Cards with Navigation */}
            <div className="relative">
              {/* Previous Button */}
              <button
                onClick={prevTestimonialPage}
                className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 md:-ml-8 bg-white p-2 rounded-full shadow-lg z-20 hover:bg-primary hover:text-white transition-colors"
                aria-label="Previous testimonials"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Testimonial Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {visibleTestimonials.map((testimonial, index) => (
                  <div
                    key={testimonial.id}
                    className="bg-white p-6 rounded-lg shadow-md transform hover:-translate-y-1 transition-transform duration-300 border border-gray-100 relative animate-fadeInUp"
                    style={{ animationDelay: `${0.1 + (index * 0.2)}s` }}
                  >
                    {testimonial.verified && (
                      <div className="absolute -top-3 -right-3 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full border border-green-200 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Verified
                      </div>
                    )}

                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mr-4">
                        <span className="text-primary font-bold">{testimonial.initials}</span>
                      </div>
                      <div>
                        <div className="flex items-center">
                          <h4 className="font-bold">{testimonial.name}</h4>
                          <span className="text-gray-500 text-sm ml-2">• {testimonial.location}</span>
                        </div>
                        <div className="flex items-center">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                xmlns="http://www.w3.org/2000/svg"
                                className={`h-4 w-4 ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <span className="text-xs text-gray-500 ml-2">{testimonial.date}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="text-xs text-gray-500 mb-1">Purchased: {testimonial.productPurchased}</div>
                      <p className="text-text/80 italic">&quot;{testimonial.text}&quot;</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Next Button */}
              <button
                onClick={nextTestimonialPage}
                className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 md:-mr-8 bg-white p-2 rounded-full shadow-lg z-20 hover:bg-primary hover:text-white transition-colors"
                aria-label="Next testimonials"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Pagination Dots */}
            <div className="flex justify-center mt-8 space-x-2">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentTestimonialPage(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${currentTestimonialPage === i ? 'bg-primary w-8' : 'bg-gray-300'}`}
                  aria-label={`Go to testimonial page ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
