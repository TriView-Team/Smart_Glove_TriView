
-- Shared updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =========================
-- profiles
-- =========================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  language TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en','ar')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own profile" ON public.profiles FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, language)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)),
    COALESCE(NEW.raw_user_meta_data->>'language', 'en')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================
-- devices
-- =========================
CREATE TABLE public.devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_name TEXT NOT NULL,
  device_status TEXT NOT NULL DEFAULT 'disconnected' CHECK (device_status IN ('connected','disconnected')),
  last_connected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_devices_user_id ON public.devices(user_id);

CREATE POLICY "Users view own devices" ON public.devices FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own devices" ON public.devices FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own devices" ON public.devices FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own devices" ON public.devices FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_devices_updated_at
BEFORE UPDATE ON public.devices
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================
-- wardrobe
-- =========================
CREATE TABLE public.wardrobe (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  fabric_type TEXT,
  color TEXT,
  pattern TEXT,
  texture TEXT,
  image_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.wardrobe ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_wardrobe_user_id ON public.wardrobe(user_id);

CREATE POLICY "Users view own wardrobe" ON public.wardrobe FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own wardrobe" ON public.wardrobe FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own wardrobe" ON public.wardrobe FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own wardrobe" ON public.wardrobe FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_wardrobe_updated_at
BEFORE UPDATE ON public.wardrobe
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================
-- recognition_results
-- =========================
CREATE TABLE public.recognition_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wardrobe_id UUID REFERENCES public.wardrobe(id) ON DELETE SET NULL,
  fabric_type TEXT,
  color TEXT,
  pattern TEXT,
  texture TEXT,
  confidence NUMERIC(5,2),
  is_live BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.recognition_results ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_recognition_user_id ON public.recognition_results(user_id);
CREATE INDEX idx_recognition_wardrobe_id ON public.recognition_results(wardrobe_id);

CREATE POLICY "Users view own recognitions" ON public.recognition_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own recognitions" ON public.recognition_results FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own recognitions" ON public.recognition_results FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own recognitions" ON public.recognition_results FOR DELETE USING (auth.uid() = user_id);

-- =========================
-- ai_stylist
-- =========================
CREATE TABLE public.ai_stylist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wardrobe_id UUID NOT NULL REFERENCES public.wardrobe(id) ON DELETE CASCADE,
  suggestion_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_stylist ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_ai_stylist_wardrobe_id ON public.ai_stylist(wardrobe_id);

CREATE POLICY "Users view own stylist suggestions"
ON public.ai_stylist FOR SELECT
USING (EXISTS (SELECT 1 FROM public.wardrobe w WHERE w.id = ai_stylist.wardrobe_id AND w.user_id = auth.uid()));

CREATE POLICY "Users insert own stylist suggestions"
ON public.ai_stylist FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM public.wardrobe w WHERE w.id = ai_stylist.wardrobe_id AND w.user_id = auth.uid()));

CREATE POLICY "Users update own stylist suggestions"
ON public.ai_stylist FOR UPDATE
USING (EXISTS (SELECT 1 FROM public.wardrobe w WHERE w.id = ai_stylist.wardrobe_id AND w.user_id = auth.uid()));

CREATE POLICY "Users delete own stylist suggestions"
ON public.ai_stylist FOR DELETE
USING (EXISTS (SELECT 1 FROM public.wardrobe w WHERE w.id = ai_stylist.wardrobe_id AND w.user_id = auth.uid()));

-- =========================
-- audio_tips (shared catalog)
-- =========================
CREATE TABLE public.audio_tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  audio_url TEXT,
  language TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en','ar')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.audio_tips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view audio tips"
ON public.audio_tips FOR SELECT
TO authenticated
USING (true);

-- =========================
-- notifications
-- =========================
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT NOT NULL DEFAULT 'info',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);

CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own notifications" ON public.notifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own notifications" ON public.notifications FOR DELETE USING (auth.uid() = user_id);

-- =========================
-- Storage buckets
-- =========================
INSERT INTO storage.buckets (id, name, public) VALUES ('wardrobe-images', 'wardrobe-images', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('audio-tips', 'audio-tips', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Wardrobe images public read"
ON storage.objects FOR SELECT
USING (bucket_id = 'wardrobe-images');

CREATE POLICY "Users upload own wardrobe images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'wardrobe-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users update own wardrobe images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'wardrobe-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users delete own wardrobe images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'wardrobe-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Audio tips public read"
ON storage.objects FOR SELECT
USING (bucket_id = 'audio-tips');
