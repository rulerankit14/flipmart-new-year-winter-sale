import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroBanner from '@/components/home/HeroBanner';
import CategoryBanner from '@/components/home/CategoryBanner';
import ProductSection from '@/components/home/ProductSection';

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
        supabase.from('products').select('*').eq('is_active', true).order('created_at', { ascending: false }).limit(20),
      ]);

      if (categoriesRes.data) {
        setCategories(categoriesRes.data.map(c => ({
          ...c,
          imageUrl: c.image_url
        })));
      }
      if (productsRes.data) {
        setProducts(productsRes.data);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-muted">
      <Header />
      
      <main className="flex-1">
        <CategoryBanner categories={categories.map(c => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          imageUrl: c.image_url
        }))} />
        
        <HeroBanner />
        
        <div className="space-y-4 py-4">
          {loading ? (
            <div className="container mx-auto px-4">
              <div className="animate-pulse">
                <div className="h-8 w-48 bg-muted-foreground/20 rounded mb-4"></div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="bg-card rounded-lg p-4">
                      <div className="aspect-square bg-muted-foreground/20 rounded mb-4"></div>
                      <div className="h-4 bg-muted-foreground/20 rounded mb-2"></div>
                      <div className="h-4 w-2/3 bg-muted-foreground/20 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : products.length > 0 ? (
            <ProductSection
              title="Best Deals"
              products={products}
              viewAllLink="/products"
            />
          ) : (
            <div className="container mx-auto px-4 py-16 text-center">
              <h2 className="text-2xl font-bold text-foreground mb-4">No Products Yet</h2>
              <p className="text-muted-foreground">
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
