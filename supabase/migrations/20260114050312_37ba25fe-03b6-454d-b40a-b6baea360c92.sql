-- Add display_order column to products table for ordering
ALTER TABLE public.products ADD COLUMN display_order integer NOT NULL DEFAULT 0;

-- Create an index for efficient ordering
CREATE INDEX idx_products_display_order ON public.products(display_order);