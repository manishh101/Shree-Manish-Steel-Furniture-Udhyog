import Image from 'next/image';
import { useState, useMemo } from 'react';

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

  // Memoize the optimized Cloudinary URL to prevent re-computation on every render
  const optimizedSrc = useMemo(() => {
    // Performance: Only apply optimizations if it's a Cloudinary URL and no error has occurred
    if (imgSrc.includes('res.cloudinary.com') && !hasError) {
      return imgSrc.replace('/upload/', `/upload/${cloudinaryOptimizations}/`);
    }
    return imgSrc;
  }, [imgSrc, hasError, cloudinaryOptimizations]);

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
