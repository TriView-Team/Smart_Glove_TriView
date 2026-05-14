
CREATE TABLE public.color_training_data (
  id bigserial PRIMARY KEY,
  f1 numeric NOT NULL,
  f2 numeric NOT NULL,
  f3 numeric NOT NULL,
  f4 numeric NOT NULL,
  f5 numeric NOT NULL,
  f6 numeric NOT NULL,
  f7 numeric NOT NULL,
  f8 numeric NOT NULL,
  clear numeric NOT NULL,
  nir numeric NOT NULL,
  label text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_color_training_label ON public.color_training_data (label);
ALTER TABLE public.color_training_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view color training data"
  ON public.color_training_data FOR SELECT TO authenticated USING (true);
