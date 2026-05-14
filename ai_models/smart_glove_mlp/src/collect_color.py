"""
Raspberry Pi ONLY.

Collect raw AS7341 spectral data and append to `data/raw/color_dataset.csv`.

IMPORTANT (training pipeline):
  `preprocess_color` reads `data/raw/color_names.csv` by default and trains on
  `R,G,B,Hue,HSL_S,HSL_L` — not on `F1`…`NIR`. Rows from this script are a
  hardware placeholder until you add conversion (spectral → same 6 features)
  or change collection to emit the processed schema.

When you integrate the real AS7341 library:
- replace `read_as7341_features()` with real I2C sensor reads
- keep CSV columns consistent with whatever conversion / training path you choose
"""

from __future__ import annotations

import csv
import time
from pathlib import Path
from typing import Dict

from .config import get_project_paths
from .utils import ensure_dir


def read_as7341_features() -> Dict[str, float]:
    """
    Placeholder: replace with real AS7341 sensor reading.

    Expected keys (exact): F1,F2,F3,F4,F5,F6,F7,F8,Clear,NIR
    """
    # TODO (hardware): read sensor registers over I2C.
    # For now, return dummy values so the script shows the intended format.
    return {name: 0.0 for name in ["F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "Clear", "NIR"]}


def main() -> None:
    paths = get_project_paths()
    raw_dir = paths.data_raw_dir
    ensure_dir(raw_dir)
    # This Raspberry Pi collection script writes the sensor dataset format, not `color_names.csv`.
    out_csv = raw_dir / "color_dataset.csv"

    print("[INFO] Color collection started (AS7341). Press Ctrl+C to stop.")
    print(f"[INFO] Writing to: {out_csv}")

    # Create file with header if missing.
    file_exists = out_csv.exists()
    with out_csv.open("a", newline="", encoding="utf-8") as f:
        fieldnames = ["F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "Clear", "NIR", "label"]
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        if not file_exists:
            writer.writeheader()

        try:
            while True:
                features = read_as7341_features()
                # TODO: set label interactively OR from a UI button OR a command argument.
                label = "blue"

                row = {**features, "label": label}
                writer.writerow(row)
                f.flush()

                print(f"[OK] Saved row: label={label}, features={features}")
                time.sleep(0.5)
        except KeyboardInterrupt:
            print("\n[INFO] Stopped color collection.")


if __name__ == "__main__":
    main()

