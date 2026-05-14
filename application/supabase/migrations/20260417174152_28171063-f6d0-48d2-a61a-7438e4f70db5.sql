
DROP POLICY IF EXISTS "Wardrobe images public read" ON storage.objects;
DROP POLICY IF EXISTS "Audio tips public read" ON storage.objects;

-- Public buckets still allow direct object GET via the public URL,
-- but listing via the storage API is restricted.
CREATE POLICY "Users list own wardrobe images"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'wardrobe-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Authenticated list audio tips"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'audio-tips');
