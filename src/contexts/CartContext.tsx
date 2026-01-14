import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    selling_price: number;
    original_price: number;
    image_url: string | null;
  };
}

interface GuestCartItem {
  product_id: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  totalAmount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const GUEST_CART_KEY = 'guest_cart';

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Get guest cart from localStorage
  const getGuestCart = (): GuestCartItem[] => {
    try {
      const cart = localStorage.getItem(GUEST_CART_KEY);
      return cart ? JSON.parse(cart) : [];
    } catch {
      return [];
    }
  };

  // Save guest cart to localStorage
  const saveGuestCart = (cart: GuestCartItem[]) => {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
  };

  // Clear guest cart
  const clearGuestCart = () => {
    localStorage.removeItem(GUEST_CART_KEY);
  };

  // Fetch products for guest cart items
  const fetchGuestCartWithProducts = async () => {
    const guestCart = getGuestCart();
    if (guestCart.length === 0) {
      setItems([]);
      return;
    }

    setLoading(true);
    const productIds = guestCart.map(item => item.product_id);
    
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, selling_price, original_price, image_url')
      .in('id', productIds);

    if (error) {
      console.error('Error fetching guest cart products:', error);
      setItems([]);
    } else {
      const cartItems: CartItem[] = guestCart.map((item, index) => {
        const product = products?.find(p => p.id === item.product_id);
        return {
          id: `guest_${index}_${item.product_id}`,
          product_id: item.product_id,
          quantity: item.quantity,
          product: product || {
            id: item.product_id,
            name: 'Unknown Product',
            selling_price: 0,
            original_price: 0,
            image_url: null,
          },
        };
      }).filter(item => item.product.name !== 'Unknown Product');
      setItems(cartItems);
    }
    setLoading(false);
  };

  // Fetch cart for logged-in user
  const fetchUserCart = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        id,
        product_id,
        quantity,
        product:products (
          id,
          name,
          selling_price,
          original_price,
          image_url
        )
      `)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching cart:', error);
    } else {
      setItems(data as unknown as CartItem[]);
    }
    setLoading(false);
  };

  // Migrate guest cart to user cart on login
  const migrateGuestCartToUser = async () => {
    if (!user) return;
    
    const guestCart = getGuestCart();
    if (guestCart.length === 0) return;

    for (const item of guestCart) {
      const { data: existing } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', user.id)
        .eq('product_id', item.product_id)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('cart_items')
          .update({ quantity: existing.quantity + item.quantity })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('cart_items')
          .insert({ user_id: user.id, product_id: item.product_id, quantity: item.quantity });
      }
    }

    clearGuestCart();
  };

  useEffect(() => {
    if (user) {
      migrateGuestCartToUser().then(() => fetchUserCart());
    } else {
      fetchGuestCartWithProducts();
    }
  }, [user]);

  const addToCart = async (productId: string, quantity = 1) => {
    if (user) {
      // Logged-in user: use database
      const existingItem = items.find(item => item.product_id === productId);
      
      if (existingItem) {
        await updateQuantity(existingItem.id, existingItem.quantity + quantity);
      } else {
        const { error } = await supabase
          .from('cart_items')
          .insert({ user_id: user.id, product_id: productId, quantity });

        if (error) {
          toast({
            title: 'Error',
            description: 'Failed to add item to cart',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Added to cart',
            description: 'Item has been added to your cart',
          });
          fetchUserCart();
        }
      }
    } else {
      // Guest user: use localStorage
      const guestCart = getGuestCart();
      const existingIndex = guestCart.findIndex(item => item.product_id === productId);
      
      if (existingIndex >= 0) {
        guestCart[existingIndex].quantity += quantity;
      } else {
        guestCart.push({ product_id: productId, quantity });
      }
      
      saveGuestCart(guestCart);
      toast({
        title: 'Added to cart',
        description: 'Item has been added to your cart',
      });
      fetchGuestCartWithProducts();
    }
  };

  const removeFromCart = async (itemId: string) => {
    if (user) {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to remove item from cart',
          variant: 'destructive',
        });
      } else {
        fetchUserCart();
      }
    } else {
      // Guest: remove from localStorage
      const guestCart = getGuestCart();
      const item = items.find(i => i.id === itemId);
      if (item) {
        const newCart = guestCart.filter(g => g.product_id !== item.product_id);
        saveGuestCart(newCart);
        fetchGuestCartWithProducts();
      }
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(itemId);
      return;
    }

    if (user) {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', itemId);

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to update quantity',
          variant: 'destructive',
        });
      } else {
        fetchUserCart();
      }
    } else {
      // Guest: update in localStorage
      const guestCart = getGuestCart();
      const item = items.find(i => i.id === itemId);
      if (item) {
        const index = guestCart.findIndex(g => g.product_id === item.product_id);
        if (index >= 0) {
          guestCart[index].quantity = quantity;
          saveGuestCart(guestCart);
          fetchGuestCartWithProducts();
        }
      }
    }
  };

  const clearCart = async () => {
    if (user) {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('Error clearing cart:', error);
      } else {
        setItems([]);
      }
    } else {
      clearGuestCart();
      setItems([]);
    }
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + (item.product?.selling_price || 0) * item.quantity, 0);

  return (
    <CartContext.Provider value={{
      items,
      loading,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
      totalAmount,
    }}>
      {children}
    </CartContext.Provider>
  );
};
