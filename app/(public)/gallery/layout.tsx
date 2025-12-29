import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Furniture Gallery - See Our Steel & Wood Furniture Designs',
  description: 'Browse our furniture gallery showcasing premium steel and wood furniture made in Biratnagar, Nepal. View almirahs, beds, office furniture designs and get inspired.',
  keywords: ['furniture design Nepal', 'steel furniture gallery', 'furniture images Biratnagar', 'almirah designs', 'modern furniture Nepal'],
  openGraph: {
    title: 'Furniture Gallery | Shree Manish Steel Furniture Biratnagar',
    description: 'Explore our furniture gallery - Quality steel & wood furniture from Biratnagar',
    type: 'website',
  },
};

export default function GalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
