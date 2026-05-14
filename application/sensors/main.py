"""
Triview Smart Glove — Raspberry Pi runtime entry point.

Pipeline:
  AS7341 + AS7263  -->  MLP models  -->  + NFC garment  -->  speaker + BLE  -->  mobile app
"""

from __future__ import annotations

import time
from pathlib import Path

import numpy as np

from src.ble_server import TriviewBLE
from src.nfc_reader import read_garment_type
from src.payload import build_recognition_payload
from src.sensors import (
    COLOR_FEATURES,
    FABRIC_FEATURES,
    read_as7341_features,
    read_as7263_features,
)
from src.speaker import speaker_say

# ---- Model loading -----------------------------------------------------------
# Plug in your real predict_color / predict_fabric here. We try to import the
# project's trained-model helpers; if they're missing, we fall back to stubs so
# the BLE/NFC/speaker pipeline can still be tested end-to-end.

PROJECT_ROOT = Path(__file__).resolve().parent
COLOR_MODEL_DIR = PROJECT_ROOT / "models" / "color"
FABRIC_MODEL_DIR = PROJECT_ROOT / "models" / "fabric"

try:
    from src.predict_color import predict_color_from_input  # type: ignore
    from src.predict_fabric import predict_fabric_from_input  # type: ignore
    _MODELS_AVAILABLE = True
except Exception as e:
    print(f"[MODELS] trained predictors not found ({e}); using stub predictions")
    _MODELS_AVAILABLE = False

    def predict_color_from_input(x, model_dir=None, provided_feature_names=None):  # type: ignore
        return "red"

    def predict_fabric_from_input(x, model_dir=None, provided_feature_names=None):  # type: ignore
        return "cotton"


# ---- Main loop ---------------------------------------------------------------
LOOP_DELAY_S = 0.7


def main() -> None:
    print("[INFO] Smart Glove runtime starting...")
    print(f"[INFO] color model dir : {COLOR_MODEL_DIR}")
    print(f"[INFO] fabric model dir: {FABRIC_MODEL_DIR}")

    # Start BLE peripheral once at boot.
    ble = TriviewBLE(local_name="Triview-Glove")
    try:
        ble.start()
    except Exception as e:
        print(f"[BLE] could not start ({e}); continuing without BLE")
        ble = None

    print("[INFO] Press Ctrl+C to stop.")
    try:
        while True:
            # 1) Read sensors
            color_feats = read_as7341_features()
            fabric_feats = read_as7263_features()

            color_x = np.asarray(
                [color_feats[k] for k in COLOR_FEATURES], dtype=float
            )
            fabric_x = np.asarray(
                [fabric_feats[k] for k in FABRIC_FEATURES], dtype=float
            )

            # 2) Predict
            color_label = predict_color_from_input(
                color_x,
                model_dir=COLOR_MODEL_DIR,
                provided_feature_names=list(COLOR_FEATURES),
            )
            fabric_label = predict_fabric_from_input(
                fabric_x,
                model_dir=FABRIC_MODEL_DIR,
                provided_feature_names=list(FABRIC_FEATURES),
            )

            # 3) NFC garment
            garment_type = read_garment_type()

            # 4) Speak
            spoken = f"{str(color_label).title()} {str(fabric_label).title()} {garment_type}"
            print(f"[OUTPUT] {spoken}")
            speaker_say(spoken)

            # 5) Send to mobile app (matches blePayloadSchema.ts)
            payload = build_recognition_payload(
                fabric=str(fabric_label),
                color=str(color_label),
                pattern="solid",
                texture="smooth",
                garment=garment_type,
                confidence=0.9,
            )
            if ble is not None:
                ble.send(payload)

            time.sleep(LOOP_DELAY_S)

    except KeyboardInterrupt:
        print("\n[INFO] Runtime stopped.")


if __name__ == "__main__":
    main()
