
-- AI Stylist recommendations dataset
CREATE TABLE public.ai_stylist_dataset (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  color text NOT NULL,
  fabric_type text NOT NULL,
  pattern text,
  item_type text,
  recommendation_en text NOT NULL,
  recommendation_ar text NOT NULL,
  audio_text_en text,
  audio_text_ar text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_ai_stylist_lookup ON public.ai_stylist_dataset (color, fabric_type, pattern, item_type);
ALTER TABLE public.ai_stylist_dataset ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view stylist dataset"
  ON public.ai_stylist_dataset FOR SELECT TO authenticated USING (true);

CREATE TRIGGER trg_ai_stylist_dataset_updated_at
  BEFORE UPDATE ON public.ai_stylist_dataset
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Device settings (per-user smart glove preferences)
CREATE TABLE public.device_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  raspberry_id text,
  auto_connect boolean NOT NULL DEFAULT true,
  sensitivity int NOT NULL DEFAULT 50,
  preferred_language text NOT NULL DEFAULT 'en',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.device_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own device settings"
  ON public.device_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own device settings"
  ON public.device_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own device settings"
  ON public.device_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own device settings"
  ON public.device_settings FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER trg_device_settings_updated_at
  BEFORE UPDATE ON public.device_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Fabric training data (raw sensor readings for future ML use)
CREATE TABLE public.fabric_training_data (
  id bigserial PRIMARY KEY,
  r numeric NOT NULL,
  s numeric NOT NULL,
  t numeric NOT NULL,
  u numeric NOT NULL,
  v numeric NOT NULL,
  w numeric NOT NULL,
  label text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_fabric_training_label ON public.fabric_training_data (label);
ALTER TABLE public.fabric_training_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view fabric training data"
  ON public.fabric_training_data FOR SELECT TO authenticated USING (true);
