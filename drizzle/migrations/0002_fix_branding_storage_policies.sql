DROP POLICY IF EXISTS "Business members can remove branding files" ON storage.objects;
DROP POLICY IF EXISTS "Business members can replace branding files" ON storage.objects;
DROP POLICY IF EXISTS "Business members can upload branding files" ON storage.objects;
DROP POLICY IF EXISTS "Business members can view branding files" ON storage.objects;

CREATE OR REPLACE FUNCTION public.can_manage_business_files(_folder text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.businesses b
    WHERE b.id::text = _folder
      AND (b.owner_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.business_members bm WHERE bm.business_id = b.id AND bm.user_id = auth.uid()))
  )
$$;

CREATE POLICY "Business members can view branding files" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'business-branding' AND public.can_manage_business_files((storage.foldername(name))[1]));
CREATE POLICY "Business members can upload branding files" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'business-branding' AND public.can_manage_business_files((storage.foldername(name))[1]));
CREATE POLICY "Business members can replace branding files" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'business-branding' AND public.can_manage_business_files((storage.foldername(name))[1]))
WITH CHECK (bucket_id = 'business-branding' AND public.can_manage_business_files((storage.foldername(name))[1]));
CREATE POLICY "Business members can remove branding files" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'business-branding' AND public.can_manage_business_files((storage.foldername(name))[1]));