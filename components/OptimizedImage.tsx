import Image from 'next/image';
import { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  quality?: number;
  className?: string;
  sizes?: string;
  fallbackSrc?: string;
  cloudinaryOptimizations?: string;
}

/**
 * OptimizedImage - Automatically optimizes Cloudinary images and provides fallback
 * 
 * Adds Cloudinary optimizations automatically:
 * - f_auto: Automatic format (WebP for modern browsers)
 * - q_auto: Automatic quality
 * - w_auto: Responsive width
 * - c_limit: Limit size without cropping
 */
const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  fill = false,
  priority = false,
  quality = 85,
  className = '',
  sizes,
  fallbackSrc = '/images/home-page-1.png',
  cloudinaryOptimizations = 'f_auto,q_auto,w_auto,c_limit',
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  // Optimize Cloudinary URLs
  const optimizedSrc = imgSrc.includes('res.cloudinary.com') && !hasError
    ? imgSrc.replace('/upload/', `/upload/${cloudinaryOptimizations}/`)
    : imgSrc;

  const handleError = () => {
    if (!hasError && imgSrc !== fallbackSrc) {
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
  };

  const imageProps = {
    src: optimizedSrc,
    alt,
    className,
    quality,
    onError: handleError,
    ...(fill ? { fill: true, sizes } : { width, height }),
    ...(priority && { priority: true }),
  };

  return <Image {...imageProps} />;
};

export default OptimizedImage;
