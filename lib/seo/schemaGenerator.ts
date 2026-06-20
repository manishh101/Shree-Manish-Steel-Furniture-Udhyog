/**
 * Schema.org JSON-LD Generator
 * 
 * Generates structured data markup for different content types.
 * Works alongside the existing schemas in layout.tsx
 */

const SITE_CONFIG = {
  baseUrl: 'https://manishsteel.com.np',
  name: 'Shree Manish Steel Furniture',
  phone: '+977 9824336371',
  email: 'shreemanishfurniture@gmail.com',
  address: {
    street: 'Dharan Rd',
    city: 'Biratnagar',
    region: 'Morang',
    postalCode: '56613',
    country: 'NP',
  },
  geo: {
    latitude: 26.4525,
    longitude: 87.2718,
  },
};

export interface Breadcrumb {
  name: string;
  url: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

/**
 * Schema Generator Service
 */
class SchemaGenerator {
  /**
   * Generate LocalBusiness schema for homepage
   * Note: Root layout already has FurnitureStore schema, this can be used for additional pages
   */
  generateLocalBusinessSchema(settings?: any): object {
    const businessInfo = settings?.businessInfo || {};
    
    return {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: businessInfo.name || SITE_CONFIG.name,
      telephone: businessInfo.phone || SITE_CONFIG.phone,
      email: businessInfo.email || SITE_CONFIG.email,
      address: {
        '@type': 'PostalAddress',
        streetAddress: businessInfo.address?.street || SITE_CONFIG.address.street,
        addressLocality: businessInfo.address?.city || SITE_CONFIG.address.city,
        addressRegion: businessInfo.address?.region || SITE_CONFIG.address.region,
        postalCode: businessInfo.address?.postalCode || SITE_CONFIG.address.postalCode,
        addressCountry: businessInfo.address?.country || SITE_CONFIG.address.country,
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: businessInfo.geo?.latitude || SITE_CONFIG.geo.latitude,
        longitude: businessInfo.geo?.longitude || SITE_CONFIG.geo.longitude,
      },
    };
  }

  /**
   * Generate Product schema for product pages
   */
  generateProductSchema(product: any, baseUrl: string = SITE_CONFIG.baseUrl): object {
    const slug = product.slug || product._id;
    const productUrl = `${baseUrl}/products/${slug}`;
    
    const schema: any = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description || `${product.name} - Premium steel furniture from Biratnagar, Nepal`,
      image: product.images && product.images.length > 0 
        ? product.images 
        : product.image 
        ? [product.image] 
        : [],
      sku: product.sku || product._id,
      brand: {
        '@type': 'Brand',
        name: 'Shree Manish Steel Furniture',
      },
      manufacturer: {
        '@type': 'Organization',
        name: 'Shree Manish Steel Furniture Udhyog',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Biratnagar',
          addressRegion: 'Morang',
          addressCountry: 'NP',
        },
      },
      offers: {
        '@type': 'Offer',
        url: productUrl,
        priceCurrency: 'NPR',
        price: product.price || 0,
        availability: product.stock > 0 || product.isAvailable !== false
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
        seller: {
          '@type': 'Organization',
          name: SITE_CONFIG.name,
        },
        priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year from now
        itemCondition: 'https://schema.org/NewCondition',
        shippingDetails: {
          '@type': 'OfferShippingDetails',
          shippingRate: {
            '@type': 'MonetaryAmount',
            value: 0,
            currency: 'NPR',
          },
          shippingDestination: {
            '@type': 'DefinedRegion',
            addressCountry: 'NP',
          },
          deliveryTime: {
            '@type': 'ShippingDeliveryTime',
            businessDays: {
              '@type': 'OpeningHoursSpecification',
              dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            },
            handlingTime: {
              '@type': 'QuantitativeValue',
              minValue: 1,
              maxValue: 3,
              unitCode: 'DAY',
            },
            transitTime: {
              '@type': 'QuantitativeValue',
              minValue: 1,
              maxValue: 7,
              unitCode: 'DAY',
            },
          },
        },
      },
      category: product.category || 'Furniture',
    };
    
    // Add color if available
    if (product.colorName || product.colors?.length > 0) {
      schema.color = product.colorName || product.colors[0];
    }
    
    // Add material if available
    if (product.material || product.specifications?.material) {
      schema.material = product.material || product.specifications.material;
    }
    
    // Add dimensions if available
    if (product.dimensions || product.specifications?.dimensions) {
      const dims = product.dimensions || {};
      const dimsStr = product.specifications?.dimensions;
      
      if (dims.length || dims.width || dims.height) {
        schema.depth = dims.length ? `${dims.length} inches` : undefined;
        schema.width = dims.width ? `${dims.width} inches` : undefined;
        schema.height = dims.height ? `${dims.height} inches` : undefined;
      } else if (dimsStr) {
        schema.additionalProperty = {
          '@type': 'PropertyValue',
          name: 'Dimensions',
          value: dimsStr,
        };
      }
    }
    
    // Add aggregate rating if available
    if (product.rating && product.reviewCount) {
      schema.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: product.rating,
        reviewCount: product.reviewCount,
        bestRating: 5,
        worstRating: 1,
      };
    }
    
    return schema;
  }

  /**
   * Generate Article schema for blog posts
   */
  generateArticleSchema(blog: any, baseUrl: string = SITE_CONFIG.baseUrl): object {
    const blogUrl = `${baseUrl}/blogs/${blog.slug}`;
    
    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': blogUrl,
      },
      headline: blog.title,
      description: blog.excerpt || blog.metaDescription || blog.description,
      image: blog.image || `${baseUrl}/images/og-image.jpg`,
      datePublished: blog.createdAt || new Date().toISOString(),
      dateModified: blog.updatedAt || blog.createdAt || new Date().toISOString(),
      author: {
        '@type': blog.authorType === 'Person' ? 'Person' : 'Organization',
        name: blog.author || 'Shree Manish Steel Furniture',
      },
      publisher: {
        '@type': 'Organization',
        name: SITE_CONFIG.name,
        logo: {
          '@type': 'ImageObject',
          url: `${baseUrl}/logo192.png`,
        },
      },
      articleSection: blog.category || 'Furniture Guide',
      keywords: blog.tags?.join(', ') || 'furniture, steel furniture, Nepal',
      wordCount: blog.content ? blog.content.split(/\s+/).length : undefined,
      inLanguage: 'ne-NP',
    };
  }

  /**
   * Generate BreadcrumbList schema
   */
  generateBreadcrumbSchema(breadcrumbs: Breadcrumb[], baseUrl: string = SITE_CONFIG.baseUrl): object {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
        item: crumb.url.startsWith('http') ? crumb.url : `${baseUrl}${crumb.url}`,
      })),
    };
  }

  /**
   * Generate FAQPage schema
   */
  generateFAQSchema(faqs: FAQ[]): object {
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    };
  }

  /**
   * Generate Organization schema
   * Note: This is already in root layout, but can be used for consistency
   */
  generateOrganizationSchema(settings?: any): object {
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.baseUrl,
      logo: `${SITE_CONFIG.baseUrl}/logo192.png`,
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: SITE_CONFIG.phone,
        contactType: 'customer service',
        areaServed: 'NP',
        availableLanguage: ['Nepali', 'Hindi', 'English'],
      },
      address: {
        '@type': 'PostalAddress',
        streetAddress: SITE_CONFIG.address.street,
        addressLocality: SITE_CONFIG.address.city,
        addressRegion: SITE_CONFIG.address.region,
        postalCode: SITE_CONFIG.address.postalCode,
        addressCountry: SITE_CONFIG.address.country,
      },
      sameAs: settings?.socialProfiles || [],
    };
  }

  /**
   * Generate WebSite schema with search action
   */
  generateWebSiteSchema(baseUrl: string = SITE_CONFIG.baseUrl): object {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${baseUrl}/#website`,
      url: baseUrl,
      name: SITE_CONFIG.name,
      description: 'Premium steel furniture manufacturer in Biratnagar, Nepal',
      publisher: {
        '@id': `${baseUrl}/#organization`,
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${baseUrl}/products?search={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
      inLanguage: 'ne-NP',
    };
  }

  /**
   * Generate ItemList schema for product listings
   */
  generateProductListSchema(products: any[], listName: string, baseUrl: string = SITE_CONFIG.baseUrl): object {
    return {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: listName,
      numberOfItems: products.length,
      itemListElement: products.map((product, index) => {
        const slug = product.slug || product._id;
        return {
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'Product',
            '@id': `${baseUrl}/products/${slug}`,
            name: product.name,
            image: product.image,
            url: `${baseUrl}/products/${slug}`,
          },
        };
      }),
    };
  }

  /**
   * Generate VideoObject schema (for future video content)
   */
  generateVideoSchema(video: any, baseUrl: string = SITE_CONFIG.baseUrl): object {
    return {
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      name: video.title,
      description: video.description,
      thumbnailUrl: video.thumbnail,
      uploadDate: video.uploadDate || new Date().toISOString(),
      contentUrl: video.url,
      embedUrl: video.embedUrl,
      duration: video.duration, // ISO 8601 format: PT1M30S for 1 minute 30 seconds
      publisher: {
        '@type': 'Organization',
        name: SITE_CONFIG.name,
        logo: {
          '@type': 'ImageObject',
          url: `${baseUrl}/logo192.png`,
        },
      },
    };
  }

  /**
   * Generate ImageObject schema
   */
  generateImageObject(imageURL: string, caption?: string, product?: any): object {
    const schema: any = {
      '@context': 'https://schema.org',
      '@type': 'ImageObject',
      url: imageURL,
      contentUrl: imageURL,
    };
    
    if (caption) {
      schema.caption = caption;
      schema.description = caption;
    }
    
    if (product) {
      schema.name = product.name;
      schema.author = {
        '@type': 'Organization',
        name: SITE_CONFIG.name,
      };
      schema.copyrightHolder = {
        '@type': 'Organization',
        name: SITE_CONFIG.name,
      };
    }
    
    return schema;
  }

  /**
   * Helper: Serialize schema to JSON string for script tag
   */
  serializeSchema(schema: object): string {
    return JSON.stringify(schema, null, 0); // No indentation for production
  }

  /**
   * Helper: Create script tag string for Next.js
   */
  createSchemaScript(schema: object): string {
    return `<script type="application/ld+json">${this.serializeSchema(schema)}</script>`;
  }

  /**
   * Generate multiple schemas at once for a page
   */
  generatePageSchemas(pageType: string, data: any, baseUrl: string = SITE_CONFIG.baseUrl): object[] {
    const schemas: object[] = [];
    
    switch (pageType) {
      case 'product':
        schemas.push(this.generateProductSchema(data.product, baseUrl));
        if (data.breadcrumbs) {
          schemas.push(this.generateBreadcrumbSchema(data.breadcrumbs, baseUrl));
        }
        break;
        
      case 'blog':
        schemas.push(this.generateArticleSchema(data.blog, baseUrl));
        if (data.breadcrumbs) {
          schemas.push(this.generateBreadcrumbSchema(data.breadcrumbs, baseUrl));
        }
        break;
        
      case 'category':
        if (data.products && data.products.length > 0) {
          schemas.push(this.generateProductListSchema(data.products, data.categoryName, baseUrl));
        }
        if (data.breadcrumbs) {
          schemas.push(this.generateBreadcrumbSchema(data.breadcrumbs, baseUrl));
        }
        break;
        
      case 'faq':
        if (data.faqs && data.faqs.length > 0) {
          schemas.push(this.generateFAQSchema(data.faqs));
        }
        break;
    }
    
    return schemas;
  }
}

// Export singleton instance
export const schemaGenerator = new SchemaGenerator();

// Export class for testing
export default SchemaGenerator;
