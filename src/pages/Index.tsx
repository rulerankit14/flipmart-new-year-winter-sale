import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroBanner from '@/components/home/HeroBanner';
import CategoryBanner from '@/components/home/CategoryBanner';
import ProductSection from '@/components/home/ProductSection';
import LiveSaleTimer from '@/components/home/LiveSaleTimer';

interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
}

interface Product {
  id: string;
  name: string;
  selling_price: number;
  original_price: number;
  image_url: string | null;
  category_id: string | null;
}

const Index = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [categoriesRes, productsRes] = await Promise.all([
        supabase.from('categories').select('*').order('name'),
        supabase.from('products').select('*').eq('is_active', true).order('display_order', { ascending: true }).limit(20),
      ]);

      if (categoriesRes.data) {
        setCategories(categoriesRes.data);
      }
      if (productsRes.data) {
        setProducts(productsRes.data);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      
      <main className="flex-1">
        <CategoryBanner categories={categories.map(c => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          imageUrl: c.image_url
        }))} />
        
        <HeroBanner />
        
        <LiveSaleTimer />
        
        <div>
          {loading ? (
            <div className="p-4">
              <div className="animate-pulse">
                <div className="grid grid-cols-2 gap-[1px] bg-gray-200">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white p-4">
                      <div className="aspect-square bg-gray-200 rounded mb-3"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : products.length > 0 ? (
            <ProductSection products={products} />
          ) : (
            <div className="bg-white py-16 text-center">
              <h2 className="text-xl font-bold text-gray-800 mb-2">No Products Yet</h2>
              <p className="text-gray-500 text-sm">
                Products will appear here once added by admin.
              </p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
