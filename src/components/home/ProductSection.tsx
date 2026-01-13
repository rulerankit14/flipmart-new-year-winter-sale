import React from 'react';
import ProductCard from '@/components/products/ProductCard';

interface Product {
  id: string;
  name: string;
  selling_price: number;
  original_price: number;
  image_url: string | null;
}

interface ProductSectionProps {
  title?: string;
  products: Product[];
  viewAllLink?: string;
}

const ProductSection: React.FC<ProductSectionProps> = ({ products }) => {
  return (
    <div className="bg-gray-100">
      <div className="grid grid-cols-2 gap-[1px] bg-gray-200">
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
    </div>
  );
};

export default ProductSection;
