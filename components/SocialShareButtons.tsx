'use client';

import React from 'react';
import { FaFacebook, FaTwitter, FaWhatsapp, FaLinkedin, FaLink } from 'react-icons/fa';
import { trackSocialShare } from '@/lib/analytics';

interface SocialShareButtonsProps {
  url: string;
  title: string;
  description?: string;
  className?: string;
}

const SocialShareButtons: React.FC<SocialShareButtonsProps> = ({
  url,
  title,
  description = '',
  className = '',
}) => {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);

  // Social share URLs
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  const twitterUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
  const whatsappUrl = `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;

  const handleShare = (platform: 'whatsapp' | 'facebook' | 'twitter' | 'linkedin' | 'copy_link', shareUrl: string) => {
    // Track social share event
    trackSocialShare(platform, url, title);

    // Open share window
    const width = 550;
    const height = 450;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;

    window.open(
      shareUrl,
      'share',
      `width=${width},height=${height},left=${left},top=${top},toolbar=0,status=0`
    );
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      trackSocialShare('copy_link', url, title);
      
      // Show a temporary success message
      alert('Link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className="text-sm font-semibold text-gray-700 mr-2">Share:</span>
      
      {/* Facebook */}
      <button
        onClick={() => handleShare('facebook', facebookUrl)}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-[#1877F2] text-white hover:bg-[#1565c0] transition-colors duration-200"
        title="Share on Facebook"
        aria-label="Share on Facebook"
      >
        <FaFacebook className="w-5 h-5" />
      </button>

      {/* Twitter */}
      <button
        onClick={() => handleShare('twitter', twitterUrl)}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-[#1DA1F2] text-white hover:bg-[#1a8cd8] transition-colors duration-200"
        title="Share on Twitter"
        aria-label="Share on Twitter"
      >
        <FaTwitter className="w-5 h-5" />
      </button>

      {/* WhatsApp */}
      <button
        onClick={() => handleShare('whatsapp', whatsappUrl)}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-[#25D366] text-white hover:bg-[#20ba5a] transition-colors duration-200"
        title="Share on WhatsApp"
        aria-label="Share on WhatsApp"
      >
        <FaWhatsapp className="w-5 h-5" />
      </button>

      {/* LinkedIn */}
      <button
        onClick={() => handleShare('linkedin', linkedinUrl)}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-[#0A66C2] text-white hover:bg-[#004182] transition-colors duration-200"
        title="Share on LinkedIn"
        aria-label="Share on LinkedIn"
      >
        <FaLinkedin className="w-5 h-5" />
      </button>

      {/* Copy Link */}
      <button
        onClick={copyToClipboard}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors duration-200"
        title="Copy link"
        aria-label="Copy link to clipboard"
      >
        <FaLink className="w-4 h-4" />
      </button>
    </div>
  );
};

export default SocialShareButtons;
