/**
 * Google Analytics 4 Tracking Utilities
 * Comprehensive tracking for SEO monitoring and conversion events
 * Requirements: 14.1, 14.3
 */

// Declare gtag function type
declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date,
      config?: Record<string, unknown>
    ) => void;
    dataLayer?: unknown[];
  }
}

/**
 * Check if Google Analytics is available
 */
export function isGAAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.gtag === 'function';
}

/**
 * Track page view (for Next.js app router)
 */
export function trackPageView(url: string, title?: string) {
  if (!isGAAvailable()) return;

  window.gtag!('event', 'page_view', {
    page_path: url,
    page_title: title || document.title,
    page_location: window.location.href,
  });
}

/**
 * Track contact form submission
 */
export function trackContactFormSubmission(category: string, method: 'contact_form' | 'quick_inquiry') {
  if (!isGAAvailable()) return;

  window.gtag!('event', 'generate_lead', {
    event_category: 'Contact',
    event_label: category,
    method: method,
    value: 1,
  });

  // Also track as conversion event
  window.gtag!('event', 'conversion', {
    send_to: 'G-TGW5L8QT90',
    event_category: 'Contact',
    event_label: `${method}_${category}`,
  });
}

/**
 * Track phone number click (click-to-call)
 */
export function trackPhoneClick(phoneNumber: string, location: string) {
  if (!isGAAvailable()) return;

  window.gtag!('event', 'phone_call_click', {
    event_category: 'Contact',
    event_label: location,
    phone_number: phoneNumber,
    value: 1,
  });

  // Track as conversion
  window.gtag!('event', 'conversion', {
    send_to: 'G-TGW5L8QT90',
    event_category: 'Contact',
    event_label: `phone_click_${location}`,
  });
}

/**
 * Track WhatsApp button click
 */
export function trackWhatsAppClick(source: string) {
  if (!isGAAvailable()) return;

  window.gtag!('event', 'whatsapp_click', {
    event_category: 'Contact',
    event_label: source,
    value: 1,
  });

  // Track as conversion
  window.gtag!('event', 'conversion', {
    send_to: 'G-TGW5L8QT90',
    event_category: 'Contact',
    event_label: `whatsapp_${source}`,
  });
}

/**
 * Track email click
 */
export function trackEmailClick(source: string) {
  if (!isGAAvailable()) return;

  window.gtag!('event', 'email_click', {
    event_category: 'Contact',
    event_label: source,
    value: 1,
  });
}

/**
 * Track Viber click
 */
export function trackViberClick(source: string) {
  if (!isGAAvailable()) return;

  window.gtag!('event', 'viber_click', {
    event_category: 'Contact',
    event_label: source,
    value: 1,
  });
}

/**
 * Track product quick view open
 */
export function trackQuickViewOpen(productId: string, productName: string, source: string) {
  if (!isGAAvailable()) return;

  window.gtag!('event', 'quick_view_open', {
    event_category: 'Products',
    event_label: productName,
    product_id: productId,
    source: source,
    value: 1,
  });

  // Track as view_item event for e-commerce
  window.gtag!('event', 'view_item', {
    items: [{
      item_id: productId,
      item_name: productName,
    }],
  });
}

/**
 * Track product page view
 */
export function trackProductView(product: {
  id: string;
  name: string;
  category?: string;
  subcategory?: string;
}) {
  if (!isGAAvailable()) return;

  window.gtag!('event', 'view_item', {
    event_category: 'Products',
    event_label: product.name,
    items: [{
      item_id: product.id,
      item_name: product.name,
      item_category: product.category,
      item_category2: product.subcategory,
    }],
  });
}

/**
 * Track category navigation
 */
export function trackCategoryNavigation(categoryName: string, method: 'menu' | 'filter' | 'link' | 'breadcrumb') {
  if (!isGAAvailable()) return;

  window.gtag!('event', 'category_navigation', {
    event_category: 'Navigation',
    event_label: categoryName,
    method: method,
    value: 1,
  });

  // Track as view_item_list
  window.gtag!('event', 'view_item_list', {
    item_list_name: categoryName,
    items: [],
  });
}

/**
 * Track search
 */
export function trackSearch(searchTerm: string, resultsCount: number) {
  if (!isGAAvailable()) return;

  window.gtag!('event', 'search', {
    search_term: searchTerm,
    results_count: resultsCount,
  });
}

/**
 * Track custom order request
 */
export function trackCustomOrderRequest(category: string) {
  if (!isGAAvailable()) return;

  window.gtag!('event', 'custom_order_request', {
    event_category: 'Engagement',
    event_label: category,
    value: 1,
  });

  // Track as conversion
  window.gtag!('event', 'conversion', {
    send_to: 'G-TGW5L8QT90',
    event_category: 'Engagement',
    event_label: `custom_order_${category}`,
  });
}

/**
 * Track gallery image view
 */
export function trackGalleryView(sectionName: string, imageCount: number) {
  if (!isGAAvailable()) return;

  window.gtag!('event', 'gallery_view', {
    event_category: 'Content',
    event_label: sectionName,
    image_count: imageCount,
    value: 1,
  });
}

/**
 * Track social media click
 */
export function trackSocialClick(platform: 'facebook' | 'instagram' | 'tiktok' | 'twitter' | 'youtube' | 'whatsapp', location: string) {
  if (!isGAAvailable()) return;

  window.gtag!('event', 'social_click', {
    event_category: 'Social',
    event_label: platform,
    location: location,
  });
}

/**
 * Track social share button click
 */
export function trackSocialShare(
  platform: 'facebook' | 'twitter' | 'whatsapp' | 'linkedin' | 'copy_link',
  url: string,
  title?: string
) {
  if (!isGAAvailable()) return;

  window.gtag!('event', 'share', {
    event_category: 'Social Share',
    event_label: platform,
    method: platform,
    content_type: 'blog',
    item_id: url,
    content_name: title,
    value: 1,
  });

  // Track as engagement
  window.gtag!('event', 'engagement', {
    event_category: 'Content',
    event_label: `share_${platform}`,
    value: 1,
  });
}

/**
 * Track map/directions click
 */
export function trackDirectionsClick(source: string) {
  if (!isGAAvailable()) return;

  window.gtag!('event', 'directions_click', {
    event_category: 'Contact',
    event_label: source,
    value: 1,
  });

  // Track as conversion
  window.gtag!('event', 'conversion', {
    send_to: 'G-TGW5L8QT90',
    event_category: 'Contact',
    event_label: `directions_${source}`,
  });
}

/**
 * Track blog post view
 */
export function trackBlogView(blogTitle: string, blogId: string) {
  if (!isGAAvailable()) return;

  window.gtag!('event', 'blog_view', {
    event_category: 'Content',
    event_label: blogTitle,
    blog_id: blogId,
    value: 1,
  });
}

/**
 * Track file download (catalogs, brochures)
 */
export function trackFileDownload(fileName: string, fileType: string) {
  if (!isGAAvailable()) return;

  window.gtag!('event', 'file_download', {
    event_category: 'Downloads',
    event_label: fileName,
    file_type: fileType,
    value: 1,
  });
}

/**
 * Track error/exception
 */
export function trackError(errorDescription: string, errorContext: string, fatal: boolean = false) {
  if (!isGAAvailable()) return;

  window.gtag!('event', 'exception', {
    description: errorDescription,
    context: errorContext,
    fatal: fatal,
  });
}

/**
 * Track 404 errors
 */
export function track404Error(attemptedPath: string, referrer?: string) {
  if (!isGAAvailable()) return;

  window.gtag!('event', '404_error', {
    event_category: 'Error',
    event_label: attemptedPath,
    referrer: referrer || document.referrer,
    value: 0,
  });
}

/**
 * Track scroll depth
 */
export function trackScrollDepth(depth: number, page: string) {
  if (!isGAAvailable()) return;

  window.gtag!('event', 'scroll', {
    event_category: 'Engagement',
    event_label: page,
    percent_scrolled: depth,
  });
}

/**
 * Track time on page
 */
export function trackTimeOnPage(seconds: number, page: string) {
  if (!isGAAvailable()) return;

  window.gtag!('event', 'timing_complete', {
    name: 'time_on_page',
    value: seconds * 1000, // Convert to milliseconds
    event_category: 'Engagement',
    event_label: page,
  });
}

/**
 * Set user properties
 */
export function setUserProperties(properties: Record<string, unknown>) {
  if (!isGAAvailable()) return;

  window.gtag!('set', 'user_properties', properties);
}

/**
 * Track custom event
 */
export function trackCustomEvent(
  eventName: string,
  category: string,
  label?: string,
  value?: number,
  additionalParams?: Record<string, unknown>
) {
  if (!isGAAvailable()) return;

  window.gtag!('event', eventName, {
    event_category: category,
    event_label: label,
    value: value,
    ...additionalParams,
  });
}
