/**
 * FALLBACK PLACEHOLDERS - USE ONLY WHEN DATABASE IMAGES ARE NOT AVAILABLE
 * These are only used as a last resort when Cloudinary URLs from the database fail
 * or when products don't have images assigned.
 */
const productPlaceholder = '/images/furniture-1.jpg';
const householdFurniturePlaceholder = '/images/furniture-2.jpg';
const officeProductsPlaceholder = '/images/furniture-1.jpg';
const bedsPlaceholder = '/images/furniture-2.jpg';

// Export the placeholder images as an array for use in components
export const defaultProductImages = [
  productPlaceholder,
  householdFurniturePlaceholder,
  officeProductsPlaceholder,
  bedsPlaceholder
];

// Export individual placeholders for specific use cases
export const productPlaceholderImage = productPlaceholder;
export const householdFurniturePlaceholderImage = householdFurniturePlaceholder;
export const officeProductsPlaceholderImage = officeProductsPlaceholder;
export const bedsPlaceholderImage = bedsPlaceholder;
