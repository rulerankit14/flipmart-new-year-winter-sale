import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Zap, Heart, Share2, ArrowLeft, RefreshCw, Truck, BadgeCheck } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

interface Product {
  id: string;
  name: string;
  description: string | null;
  selling_price: number;
  original_price: number;
  image_url: string | null;
  category_id: string | null;
}

interface ProductImage {
  id: string;
  image_url: string;
  display_order: number;
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [allImages, setAllImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState({ minutes: 12, seconds: 59 });
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // Live countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { minutes: prev.minutes - 1, seconds: 59 };
        } else {
          // Reset timer for demo
          return { minutes: 12, seconds: 59 };
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      const [productResult, imagesResult] = await Promise.all([
        supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .eq('is_active', true)
          .maybeSingle(),
        supabase
          .from('product_images')
          .select('*')
          .eq('product_id', id)
          .order('display_order', { ascending: true })
      ]);

      if (productResult.error) {
        console.error('Error fetching product:', productResult.error);
      } else {
        setProduct(productResult.data);
        const images: string[] = [];
        if (imagesResult.data && imagesResult.data.length > 0) {
          images.push(...imagesResult.data.map(img => img.image_url));
        } else if (productResult.data?.image_url) {
          images.push(productResult.data.image_url);
        }
        setAllImages(images);
      }
      setLoading(false);
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product.id);
    }
  };

  const handleBuyNow = () => {
    if (product) {
      addToCart(product.id);
      navigate('/cart');
    }
  };

  // Swipe gesture handlers
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe && allImages.length > 1) {
      setCurrentImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
    }
    if (isRightSwipe && allImages.length > 1) {
      setCurrentImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
    }
  };

  const discountPercent = product 
    ? Math.round((1 - product.selling_price / product.original_price) * 100) 
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-1">
          <div className="animate-pulse">
            <div className="aspect-square bg-gray-200"></div>
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <h1 className="text-xl font-semibold mb-4">Product Not Found</h1>
            <Button onClick={() => navigate('/')} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white pb-16">
      <Header />
      
      <main className="flex-1">
        {/* Image Slider Section */}
        <div 
          className="relative bg-white"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Main Image */}
          <div className="aspect-square bg-white flex items-center justify-center select-none">
            <img
              src={allImages[currentImageIndex] || product.image_url || 'https://via.placeholder.com/600x600?text=Product'}
              alt={product.name}
              className="max-w-full max-h-full object-contain"
            />
          </div>
          
          {/* Wishlist & Share Icons */}
          <div className="absolute right-3 top-4 flex flex-col gap-3">
            <button className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center">
              <Heart className="h-5 w-5 text-gray-500" />
            </button>
            <button className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center">
              <Share2 className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Dot Indicators */}
          {allImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {allImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentImageIndex ? 'bg-gray-800' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4 border-t border-gray-100">
          {/* Product Name */}
          <h1 className="text-base text-gray-800 leading-snug mb-3">
            {product.name}
          </h1>

          {/* F-Assured Badge */}
          <div className="flex items-center gap-1 mb-3">
            <span className="text-[#2874f0] font-bold text-sm italic">Plus</span>
            <span className="text-[#2874f0] text-xs font-medium">F-ASSURED</span>
          </div>

          {/* Price Section */}
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-green-600 font-semibold text-base">
              {discountPercent}% off
            </span>
            <span className="text-gray-400 line-through text-sm">
              ₹{product.original_price.toLocaleString('en-IN')}
            </span>
            <span className="text-gray-900 font-bold text-xl">
              ₹ {product.selling_price.toLocaleString('en-IN')}
            </span>
          </div>

          {/* Offer Timer */}
          <div className="bg-gray-50 p-3 rounded-lg mb-4">
            <p className="text-center text-sm">
              <span className="text-gray-700">Offer ends in</span>{' '}
              <span className="text-orange-500 font-semibold">
                {timeLeft.minutes}min {timeLeft.seconds.toString().padStart(2, '0')}sec
              </span>
            </p>
          </div>

          {/* Feature Badges */}
          <div className="flex justify-around py-4 border-t border-b border-gray-100 mb-4">
            <div className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <RefreshCw className="h-5 w-5 text-gray-600" />
              </div>
              <span className="text-xs text-gray-600 text-center">7 days<br/>Replacement</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <Truck className="h-5 w-5 text-gray-600" />
              </div>
              <span className="text-xs text-gray-600 text-center">Free<br/>Delivery</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <BadgeCheck className="h-5 w-5 text-[#2874f0]" />
              </div>
              <span className="text-xs text-gray-600 text-center">Plus<br/>(F-Assured)</span>
            </div>
          </div>

          {/* Highlights/Description */}
          {product.description && (
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-gray-800 mb-2">Highlights</h2>
              <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

        </div>
      </main>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-50">
        <button
          onClick={handleAddToCart}
          className="flex-1 py-4 flex items-center justify-center gap-2 text-gray-700 font-medium text-sm bg-white active:bg-gray-50"
        >
          <ShoppingCart className="h-5 w-5" />
          Add to Cart
        </button>
        <button
          onClick={handleBuyNow}
          className="flex-1 py-4 flex items-center justify-center gap-2 text-white font-medium text-sm bg-[#fb641b] active:bg-orange-600"
        >
          <Zap className="h-5 w-5" />
          Buy Now
        </button>
      </div>
    </div>
  );
};

export default ProductDetail;
