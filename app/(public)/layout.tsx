import type { Metadata } from 'next';
import LayoutWrapper from '@/components/LayoutWrapper';

export const metadata: Metadata = {
  title: {
    default: 'Shree Manish Steel Furniture Udhyog | Best Steel & Wood Furniture in Biratnagar',
    template: '%s | Shree Manish Steel Furniture Biratnagar',
  },
  description: "Best steel and wood furniture shop in Biratnagar, Nepal. Buy premium almirahs, beds, office furniture, racks at best prices. Free delivery in Biratnagar, Dharan, Itahari. Visit our showroom today!",
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LayoutWrapper>{children}</LayoutWrapper>;
}
