-- Create storage bucket for payment QR codes
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-qr', 'payment-qr', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to view payment QR images
CREATE POLICY "Anyone can view payment QR images"
ON storage.objects FOR SELECT
USING (bucket_id = 'payment-qr');

-- Allow admins to upload/update/delete payment QR images
CREATE POLICY "Admins can manage payment QR images"
ON storage.objects FOR ALL
USING (bucket_id = 'payment-qr' AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'payment-qr' AND public.has_role(auth.uid(), 'admin'));

-- Add default merchant_qr_url setting
INSERT INTO public.settings (key, value)
VALUES ('merchant_qr_url', '')
ON CONFLICT (key) DO NOTHING;