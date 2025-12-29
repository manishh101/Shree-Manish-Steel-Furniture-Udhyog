import type { Metadata } from 'next';
import { connectDB } from '@/lib/db';
import Product from '@/models/Product';

type Props = {
  params: Promise<{ productId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const productId = resolvedParams.productId;
  
  try {
    await connectDB();
    const product = await Product.findById(productId)
      .populate('categoryId', 'name')
      .lean();

    if (!product) {
      return {
        title: 'Product Not Found | Shree Manish Steel Furniture',
        description: 'The requested product could not be found.',
      };
    }

    const productData = product as any;
    const categoryName = productData.categoryId?.name || 'Steel Furniture';
    const productName = productData.name || 'Product';
    const productDescription = productData.description || `High-quality ${categoryName} from Shree Manish Steel Furniture Nepal`;
    const productImage = productData.image || productData.images?.[0] || '/images/og-image.jpg';

    return {
      title: `${productName} | ${categoryName}`,
      description: productDescription.substring(0, 160),
      keywords: [
        productName,
        categoryName,
        'steel furniture',
        'Nepal',
        'Biratnagar',
        'buy furniture online',
      ],
      openGraph: {
        title: productName,
        description: productDescription.substring(0, 160),
        type: 'website',
        images: [
          {
            url: productImage,
            width: 800,
            height: 800,
            alt: productName,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: productName,
        description: productDescription.substring(0, 160),
        images: [productImage],
      },
    };
  } catch (error) {
    console.error('Error generating product metadata:', error);
    return {
      title: 'Product | Shree Manish Steel Furniture',
      description: 'Quality steel furniture products from Nepal.',
    };
  }
}

export default function ProductDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
