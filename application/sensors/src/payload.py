"""
Build payloads that match src/lib/blePayloadSchema.ts in the mobile app.

Required keys (strict, see Zod schema):
  fabric, color, pattern, texture
Optional keys:
  name, colorHex, size, category, confidence
"""

from __future__ import annotations

from typing import Optional


def build_recognition_payload(
    *,
    fabric: str,
    color: str,
    pattern: str = "solid",
    texture: str = "smooth",
    garment: Optional[str] = None,
    confidence: Optional[float] = None,
    color_hex: Optional[str] = None,
) -> dict:
    payload: dict = {
        "fabric": fabric.strip().lower(),
        "color": color.strip().lower(),
        "pattern": pattern.strip().lower(),
        "texture": texture.strip().lower(),
    }
    if garment:
        payload["category"] = garment.strip()
    if confidence is not None:
        payload["confidence"] = max(0.0, min(1.0, float(confidence)))
    if color_hex:
        payload["colorHex"] = color_hex
    return payload
