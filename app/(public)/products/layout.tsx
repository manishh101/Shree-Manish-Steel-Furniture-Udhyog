import type { Metadata } from 'next';
import { metadataGenerator } from '../../../lib/seo/metadataGenerator';

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const resolvedParams = (await searchParams) ?? {};
  const category = resolvedParams.category as string | undefined;
  const subcategory = resolvedParams.subcategory as string | undefined;
  
  // If we have category/subcategory filters, fetch that data and generate dynamic metadata
  if (category && category !== 'all') {
    try {
      // Fetch category data from API
      const categoryResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || ''}/api/categories?includeSub=true`,
        { cache: 'no-store' }
      );
      
      if (categoryResponse.ok) {
        const categories = await categoryResponse.json();
        const selectedCategory = Array.isArray(categories) 
          ? categories.find((cat: any) => (cat._id || cat.id) === category)
          : null;
        
        if (selectedCategory) {
          const selectedSubcategory = subcategory && selectedCategory.subcategories
            ? selectedCategory.subcategories.find((sub: any) => (sub._id || sub.id) === subcategory)
            : null;
          
          // Generate metadata using the metadata generator service
          const seoData = metadataGenerator.generateCategoryMetadata(
            selectedCategory,
            selectedSubcategory
          );
          
          return {
            title: seoData.title,
            description: seoData.description,
            keywords: seoData.keywords,
            openGraph: {
              ...seoData.openGraph,
              images: seoData.openGraph?.images,
            },
            twitter: seoData.twitter,
            alternates: seoData.alternates,
            robots: seoData.robots,
          };
        }
      }
    } catch (error) {
      console.error('Error generating category metadata:', error);
      // Fall through to default metadata
    }
  }
  
  // Default metadata for all products page
  const defaultSeo = metadataGenerator.generatePageMetadata('products');
  
  return {
    title: defaultSeo.title,
    description: defaultSeo.description,
    keywords: defaultSeo.keywords,
    openGraph: {
      ...defaultSeo.openGraph,
      images: defaultSeo.openGraph?.images,
    },
    twitter: defaultSeo.twitter,
    alternates: defaultSeo.alternates,
    robots: defaultSeo.robots,
  };
}

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
