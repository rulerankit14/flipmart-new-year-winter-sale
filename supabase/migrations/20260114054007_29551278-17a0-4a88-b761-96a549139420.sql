-- Allow guest orders by making user_id nullable
ALTER TABLE public.orders ALTER COLUMN user_id DROP NOT NULL;

-- Add guest email/phone for guest orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS guest_email text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS guest_phone text;

-- Update RLS policies to allow guest order creation
DROP POLICY IF EXISTS "Users can create their own orders" ON public.orders;
CREATE POLICY "Users can create orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (
  (auth.uid() = user_id) OR 
  (user_id IS NULL AND guest_email IS NOT NULL)
);

-- Allow guests to view their orders by order ID (handled via application)
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
CREATE POLICY "Users can view their own orders" 
ON public.orders 
FOR SELECT 
USING (
  (auth.uid() = user_id) OR
  (auth.uid() IS NULL AND user_id IS NULL)
);

-- Update order_items policy for guest orders
DROP POLICY IF EXISTS "Users can insert their own order items" ON public.order_items;
CREATE POLICY "Users can insert order items" 
ON public.order_items 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND (
      orders.user_id = auth.uid() OR 
      (orders.user_id IS NULL AND orders.guest_email IS NOT NULL)
    )
  )
);

DROP POLICY IF EXISTS "Users can view their own order items" ON public.order_items;
CREATE POLICY "Users can view their own order items" 
ON public.order_items 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND (
      orders.user_id = auth.uid() OR
      (auth.uid() IS NULL AND orders.user_id IS NULL)
    )
  )
);