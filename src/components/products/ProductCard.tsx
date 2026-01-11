import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Star } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

interface ProductCardProps {
  id: string;
  name: string;
  sellingPrice: number;
  originalPrice: number;
  imageUrl: string | null;
  rating?: number;
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  sellingPrice,
  originalPrice,
  imageUrl,
  rating = 4.2,
}) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(id);
  };

  return (
    <Link to={`/product/${id}`}>
      <Card className="group hover:shadow-lg transition-shadow duration-300 h-full">
        <CardContent className="p-4">
          <div className="aspect-square mb-4 overflow-hidden bg-muted rounded-lg">
            <img
              src={imageUrl || 'https://via.placeholder.com/300x300?text=Product'}
              alt={name}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="space-y-2">
            <h3 className="font-medium text-foreground line-clamp-2 min-h-[2.5rem]">
              {name}
            </h3>
            <div className="flex items-center gap-2">
              <span className="bg-green-600 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-0.5">
                {rating} <Star className="h-3 w-3 fill-current" />
              </span>
              <span className="text-muted-foreground text-xs">(1,234)</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-foreground">
                ₹{sellingPrice.toLocaleString('en-IN')}
              </span>
              <span className="text-sm text-muted-foreground line-through">
                ₹{originalPrice.toLocaleString('en-IN')}
              </span>
            </div>
            <Button
              onClick={handleAddToCart}
              size="sm"
              className="w-full mt-2 bg-secondary hover:bg-secondary/90 text-secondary-foreground"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ProductCard;
