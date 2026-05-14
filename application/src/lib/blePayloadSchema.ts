import { z } from "zod";

/**
 * Strict schema for BLE recognition payloads sent from the Pi (Triview glove).
 * Any packet that does not parse cleanly is rejected and never persisted.
 *
 * Expected wire format: a single UTF-8 JSON object per BLE notification.
 */
export const bleRecognitionPayloadSchema = z.object({
  fabric: z
    .string()
    .trim()
    .min(1, "fabric is required")
    .max(40, "fabric too long"),
  color: z
    .string()
    .trim()
    .min(1, "color is required")
    .max(40, "color too long"),
  pattern: z
    .string()
    .trim()
    .min(1, "pattern is required")
    .max(40, "pattern too long"),
  texture: z
    .string()
    .trim()
    .min(1, "texture is required")
    .max(40, "texture too long"),
  // Optional metadata
  name: z.string().trim().max(80).optional(),
  colorHex: z
    .string()
    .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "invalid hex color")
    .optional(),
  size: z.string().trim().max(20).optional(),
  category: z.string().trim().max(80).optional(),
  confidence: z.number().min(0).max(1).optional(),
}).strict();

export type BleRecognitionPayload = z.infer<typeof bleRecognitionPayloadSchema>;

/**
 * Parse and validate a raw BLE DataView. Returns null on any failure
 * (non-UTF8, non-JSON, schema mismatch). Logs a warning so issues are visible.
 */
export const parseBlePayload = (
  data: DataView,
): BleRecognitionPayload | null => {
  let text: string;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(data.buffer).trim();
  } catch (e) {
    console.warn("[BLE] dropped: invalid UTF-8", e);
    return null;
  }
  if (!text) return null;

  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    console.warn("[BLE] dropped: not JSON", text.slice(0, 80));
    return null;
  }

  const result = bleRecognitionPayloadSchema.safeParse(json);
  if (!result.success) {
    console.warn(
      "[BLE] dropped: schema mismatch",
      result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "),
    );
    return null;
  }
  return result.data;
};
