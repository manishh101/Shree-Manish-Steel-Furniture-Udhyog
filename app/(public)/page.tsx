import HomePageClient from './HomePageClient';
import { productAPI } from '@/services/api';

export default async function HomePage() {
  const bestSellingProductsResponse = await productAPI.getMostSelling(6).catch((error) => {
    console.error('Failed to fetch best selling products:', error);
    return { products: [] };
  });

  return <HomePageClient bestSellingProducts={bestSellingProductsResponse.products} />;
}
