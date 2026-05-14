import { supabase } from "@/integrations/supabase/client";

export type StylistRow = {
  id: string;
  color: string;
  fabric_type: string;
  pattern: string | null;
  item_type: string | null;
  recommendation_en: string;
  recommendation_ar: string;
  audio_text_en: string | null;
  audio_text_ar: string | null;
};

export type RecognitionInput = {
  color?: string | null;
  fabric_type?: string | null;
  pattern?: string | null;
  item_type?: string | null;
};

const norm = (v: string | null | undefined) => (v || "").trim().toLowerCase();

/**
 * Exact match first (color + fabric + pattern + item_type).
 * Falls back to weighted scoring across the four fields.
 * Returns null if nothing in dataset.
 */
export async function matchStylistRecommendation(
  input: RecognitionInput,
): Promise<StylistRow | null> {
  const color = norm(input.color);
  const fabric = norm(input.fabric_type);
  const pattern = norm(input.pattern);
  const item = norm(input.item_type);

  // 1) Exact match
  if (color && fabric) {
    let q = supabase
      .from("ai_stylist_dataset")
      .select("*")
      .ilike("color", color)
      .ilike("fabric_type", fabric)
      .limit(1);
    if (pattern) q = q.ilike("pattern", pattern);
    if (item) q = q.ilike("item_type", item);
    const { data } = await q;
    if (data && data.length > 0) return data[0] as StylistRow;
  }

  // 2) Fuzzy weighted fallback — pull all and score in memory (small dataset).
  const { data: all } = await supabase
    .from("ai_stylist_dataset")
    .select("*");
  if (!all || all.length === 0) return null;

  const score = (r: StylistRow) =>
    (norm(r.color) === color ? 3 : 0) +
    (norm(r.fabric_type) === fabric ? 2 : 0) +
    (pattern && norm(r.pattern) === pattern ? 1 : 0) +
    (item && norm(r.item_type) === item ? 1 : 0);

  const ranked = (all as StylistRow[])
    .map((r) => ({ r, s: score(r) }))
    .sort((a, b) => b.s - a.s);

  return ranked[0].s > 0 ? ranked[0].r : ranked[0].r;
}
