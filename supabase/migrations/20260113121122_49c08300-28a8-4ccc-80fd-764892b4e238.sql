-- Create a settings table for storing app configuration
CREATE TABLE public.settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    key text UNIQUE NOT NULL,
    value text NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings (needed for checkout)
CREATE POLICY "Anyone can view settings"
ON public.settings
FOR SELECT
USING (true);

-- Only admins can manage settings
CREATE POLICY "Admins can manage settings"
ON public.settings
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_settings_updated_at
BEFORE UPDATE ON public.settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default UPI ID
INSERT INTO public.settings (key, value) VALUES ('merchant_upi_id', 'merchant@paytm');
INSERT INTO public.settings (key, value) VALUES ('merchant_name', 'Flipkart');