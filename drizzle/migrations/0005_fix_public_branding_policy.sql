DROP POLICY IF EXISTS "Public can view branding of live businesses" ON storage.objects;
CREATE POLICY "Public can view branding of live businesses" ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'business-branding' AND EXISTS (SELECT 1 FROM public.businesses b WHERE b.id::text = (storage.foldername(objects.name))[1] AND b.is_published AND NOT b.is_suspended));