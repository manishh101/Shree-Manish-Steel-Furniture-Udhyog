import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Steel & Wood Furniture Products | Best Prices in Biratnagar',
  description: 'Browse our complete collection of steel and wood furniture in Biratnagar. Almirahs, beds, office furniture, racks at best prices. Free delivery in Biratnagar, Dharan, Itahari.',
  keywords: [
    'buy steel furniture Biratnagar',
    'steel almirah price Nepal',
    'office furniture Biratnagar',
    'steel bed Biratnagar',
    'furniture shop Biratnagar',
    'wood furniture Nepal',
    'steel rack price',
    'wardrobe Biratnagar',
    'furniture delivery Dharan Itahari',
  ],
  openGraph: {
    title: 'Steel & Wood Furniture | Best Prices in Biratnagar Nepal',
    description: 'Shop premium steel and wood furniture at affordable prices. Free delivery!',
    type: 'website',
  },
};

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
