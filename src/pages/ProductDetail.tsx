import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Zap, Star, Truck, Shield, ArrowLeft } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

interface Product {
  id: string;
  name: string;
  description: string | null;
  selling_price: number;
  original_price: number;
  image_url: string | null;
  stock: number;
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
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      // Fetch product and images in parallel
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
        // Set initial selected image
        if (imagesResult.data && imagesResult.data.length > 0) {
          setProductImages(imagesResult.data);
          setSelectedImage(imagesResult.data[0].image_url);
        } else if (productResult.data?.image_url) {
          setSelectedImage(productResult.data.image_url);
        }
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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-muted">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="aspect-square bg-muted-foreground/20 rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-muted-foreground/20 rounded w-3/4"></div>
                <div className="h-4 bg-muted-foreground/20 rounded w-1/2"></div>
                <div className="h-12 bg-muted-foreground/20 rounded w-1/3"></div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-muted">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <Button onClick={() => navigate('/')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <Button onClick={() => navigate(-1)} variant="ghost" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="bg-card rounded-lg shadow-sm p-6">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Product Image */}
            <div className="sticky top-24">
              <div className="aspect-square bg-muted rounded-lg overflow-hidden mb-4">
                <img
                  src={selectedImage || product.image_url || 'https://via.placeholder.com/600x600?text=Product'}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              </div>
              
              {/* Thumbnail Gallery */}
              {productImages.length > 0 && (
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                  {productImages.map((img) => (
                    <button
                      key={img.id}
                      onClick={() => setSelectedImage(img.image_url)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === img.image_url 
                          ? 'border-primary ring-2 ring-primary/20' 
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <img
                        src={img.image_url}
                        alt={`${product.name} thumbnail`}
                        className="w-full h-full object-contain bg-white"
                      />
                    </button>
                  ))}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={handleAddToCart}
                  size="lg"
                  className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Add to Cart
                </Button>
                <Button
                  onClick={handleBuyNow}
                  size="lg"
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  <Zap className="h-5 w-5 mr-2" />
                  Buy Now
                </Button>
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <h1 className="text-2xl md:text-3xl font-semibold text-foreground">
                {product.name}
              </h1>

              <div className="flex items-center gap-2">
                <span className="bg-green-600 text-white text-sm px-2 py-1 rounded flex items-center gap-1">
                  4.2 <Star className="h-3 w-3 fill-current" />
                </span>
                <span className="text-muted-foreground">1,234 Ratings & 456 Reviews</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-foreground">
                    ₹{product.selling_price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xl text-muted-foreground line-through">
                    ₹{product.original_price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-green-600 font-semibold">
                    {Math.round((1 - product.selling_price / product.original_price) * 100)}% off
                  </span>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-start gap-3">
                  <Truck className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Free Delivery</p>
                    <p className="text-sm text-muted-foreground">Delivery by tomorrow</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">1 Year Warranty</p>
                    <p className="text-sm text-muted-foreground">Brand warranty</p>
                  </div>
                </div>
              </div>

              {product.description && (
                <div className="pt-4 border-t">
                  <h2 className="text-lg font-semibold mb-2">Description</h2>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {product.description}
                  </p>
                </div>
              )}

              <div className="pt-4 border-t">
                <p className={`font-medium ${product.stock > 0 ? 'text-green-600' : 'text-destructive'}`}>
                  {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProductDetail;
