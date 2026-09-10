'use client';

import { trackSocialClick } from '@/lib/analytics';

interface TikTokContentSectionProps {
  profileUrl: string;
}

const TikTokContentSection = ({ profileUrl }: TikTokContentSectionProps) => (
  <section
    className="relative overflow-hidden bg-primary py-14 text-white md:py-20"
    aria-labelledby="tiktok-content-heading"
  >
    <div className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />
    <div className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

    <div className="content-container relative">
      <div className="mx-auto max-w-3xl text-center">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur-sm">
          <TikTokIcon className="h-4 w-4" />
          Follow our latest furniture videos
        </div>
        <h2 id="tiktok-content-heading" className="text-3xl font-bold leading-tight md:text-4xl">
          See Our Furniture Come to Life on TikTok
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/85 md:text-lg">
          Watch showroom tours, new steel furniture designs, custom work, powder-coating
          process videos, and real product updates from Shree Manish Steel Furniture.
        </p>
        <a
          id="homepage-tiktok-link"
          href={profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackSocialClick('tiktok', 'homepage_content_section')}
          className="mt-8 inline-flex items-center gap-3 rounded-xl bg-white px-6 py-3.5 font-bold text-primary shadow-xl transition duration-300 hover:-translate-y-1 hover:bg-accent focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary"
          aria-label="Watch Shree Manish Steel Furniture videos on TikTok"
        >
          <TikTokIcon className="h-5 w-5" />
          Watch on TikTok
          <span aria-hidden="true">↗</span>
        </a>
      </div>
    </div>
  </section>
);

const TikTokIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
  </svg>
);

export default TikTokContentSection;
