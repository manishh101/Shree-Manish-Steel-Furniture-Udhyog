import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Custom Furniture Order - Made to Order Furniture Biratnagar',
  description: 'Order custom-made steel and wood furniture in Biratnagar. Get furniture designed to your exact specifications. Free consultation and delivery in Biratnagar, Dharan, Itahari.',
  keywords: ['custom furniture Biratnagar', 'made to order furniture Nepal', 'custom almirah', 'personalized furniture', 'furniture on order'],
  openGraph: {
    title: 'Custom Furniture Order | Shree Manish Steel Biratnagar',
    description: 'Get custom-made steel and wood furniture designed for your needs',
    type: 'website',
  },
};

export default function CustomOrderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
