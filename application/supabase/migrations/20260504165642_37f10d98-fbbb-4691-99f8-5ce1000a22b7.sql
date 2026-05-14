
-- 1. Make wardrobe-images bucket private
UPDATE storage.buckets SET public = false WHERE id = 'wardrobe-images';

-- Add storage RLS policies for wardrobe-images (owner-scoped by first folder = user id)
DROP POLICY IF EXISTS "Users view own wardrobe images" ON storage.objects;
DROP POLICY IF EXISTS "Users insert own wardrobe images" ON storage.objects;
DROP POLICY IF EXISTS "Users update own wardrobe images" ON storage.objects;
DROP POLICY IF EXISTS "Users delete own wardrobe images" ON storage.objects;

CREATE POLICY "Users view own wardrobe images"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'wardrobe-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users insert own wardrobe images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'wardrobe-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users update own wardrobe images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'wardrobe-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users delete own wardrobe images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'wardrobe-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 2. Restrict notifications policies to authenticated role only
DROP POLICY IF EXISTS "Users view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users insert own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users delete own notifications" ON public.notifications;

CREATE POLICY "Users view own notifications"
ON public.notifications FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users insert own notifications"
ON public.notifications FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own notifications"
ON public.notifications FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users delete own notifications"
ON public.notifications FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- 3. Revoke EXECUTE on SECURITY DEFINER trigger functions from anon/authenticated
-- These are only meant to be called by triggers, not directly via PostgREST.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
