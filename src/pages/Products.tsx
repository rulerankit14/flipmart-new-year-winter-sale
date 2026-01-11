import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/products/ProductCard';
import { supabase } from '@/integrations/supabase/client';

interface Product {
  id: string;
  name: string;
  selling_price: number;
  original_price: number;
  image_url: string | null;
}

const Products = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const query = searchParams.get('q') || '';

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      let queryBuilder = supabase
        .from('products')
        .select('*')
        .eq('is_active', true);

      if (query) {
        queryBuilder = queryBuilder.ilike('name', `%${query}%`);
      }

      const { data, error } = await queryBuilder.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
      } else {
        setProducts(data || []);
      }
      setLoading(false);
    };

    fetchProducts();
  }, [query]);

  return (
    <div className="min-h-screen flex flex-col bg-muted">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">
          {query ? `Search results for "${query}"` : 'All Products'}
        </h1>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="bg-card rounded-lg p-4 animate-pulse">
                <div className="aspect-square bg-muted-foreground/20 rounded mb-4"></div>
                <div className="h-4 bg-muted-foreground/20 rounded mb-2"></div>
                <div className="h-4 w-2/3 bg-muted-foreground/20 rounded"></div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                sellingPrice={product.selling_price}
                originalPrice={product.original_price}
                imageUrl={product.image_url}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h2 className="text-xl font-bold mb-2">No Products Found</h2>
            <p className="text-muted-foreground">
              {query ? 'Try a different search term' : 'Check back later for new products'}
            </p>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Products;
