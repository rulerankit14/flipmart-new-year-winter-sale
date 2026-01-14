import React from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';

interface ProductCardProps {
  id: string;
  name: string;
  sellingPrice: number;
  originalPrice: number;
  imageUrl: string | null;
  rating?: number;
  reviewCount?: number;
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  sellingPrice,
  originalPrice,
  imageUrl,
  rating = 4.5,
  reviewCount = 3949,
}) => {
  const discountPercent = Math.round(((originalPrice - sellingPrice) / originalPrice) * 100);

  return (
    <Link to={`/product/${id}`} className="block">
      <div className="bg-white p-3 h-full flex flex-col">
        {/* Product Image */}
        <div className="h-40 mb-3 flex items-center justify-center">
          <img
            src={imageUrl || 'https://via.placeholder.com/200x200?text=Product'}
            alt={name}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Product Info */}
        <div className="flex-1 flex flex-col gap-1.5">
          {/* Product Name */}
          <h3 className="text-sm text-gray-800 line-clamp-2 leading-tight">
            {name}
          </h3>

          {/* Discount & Original Price */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-green-600 text-sm font-medium">
              {discountPercent}% Off
            </span>
            <span className="text-gray-400 text-sm line-through">
              ₹{originalPrice.toLocaleString('en-IN')}
            </span>
          </div>

          {/* Selling Price & Assured Badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-lg font-bold text-gray-900">
              ₹ {sellingPrice.toLocaleString('en-IN')}
            </span>
            <span className="bg-[#2874f0] text-white text-[10px] px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5">
              <span className="text-yellow-300">ƒ</span>Assured
            </span>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mt-1">
            <span className="bg-green-600 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-0.5">
              {rating} <Star className="h-2.5 w-2.5 fill-current" />
            </span>
            <span className="text-gray-500 text-xs">
              {reviewCount.toLocaleString('en-IN')} Ratings
            </span>
          </div>

          {/* Free Delivery */}
          <p className="text-xs text-gray-600 mt-auto pt-2">
            Free Delivery in Two Days
          </p>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
