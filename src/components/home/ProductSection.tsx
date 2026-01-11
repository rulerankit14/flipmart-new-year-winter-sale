import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';

interface Product {
  id: string;
  name: string;
  selling_price: number;
  original_price: number;
  image_url: string | null;
}

interface ProductSectionProps {
  title: string;
  products: Product[];
  viewAllLink?: string;
}

const ProductSection: React.FC<ProductSectionProps> = ({ title, products, viewAllLink }) => {
  if (products.length === 0) return null;

  return (
    <section className="bg-card shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl md:text-2xl font-bold text-foreground">{title}</h2>
          {viewAllLink && (
            <Link
              to={viewAllLink}
              className="flex items-center gap-1 text-primary hover:underline font-medium"
            >
              View All <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {products.slice(0, 10).map((product) => (
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
      </div>
    </section>
  );
};

export default ProductSection;
