"""
Raspberry Pi ONLY.

Collect raw AS7263 spectral data and append to `data/raw/fabric_dataset.csv`.

Replace `read_as7263_features()` with real sensor integration.
"""

from __future__ import annotations

import csv
import time
from pathlib import Path
from typing import Dict

from .config import FABRIC_FEATURES, RAW_FABRIC_CSV_NAME, get_project_paths
from .utils import ensure_dir


def read_as7263_features() -> Dict[str, float]:
    """
    Placeholder: replace with real AS7263 sensor reading.

    Expected keys (exact): R,S,T,U,V,W
    """
    # TODO (hardware): read sensor registers over I2C.
    return {name: 0.0 for name in FABRIC_FEATURES}


def main() -> None:
    paths = get_project_paths()
    raw_dir = paths.data_raw_dir
    ensure_dir(raw_dir)
    out_csv = raw_dir / RAW_FABRIC_CSV_NAME

    print("[INFO] Fabric collection started (AS7263). Press Ctrl+C to stop.")
    print(f"[INFO] Writing to: {out_csv}")

    file_exists = out_csv.exists()
    with out_csv.open("a", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(FABRIC_FEATURES) + ["label"])
        if not file_exists:
            writer.writeheader()

        try:
            while True:
                features = read_as7263_features()
                # TODO: set label interactively OR from a UI button OR a command argument.
                label = "cotton"

                row = {**features, "label": label}
                writer.writerow(row)
                f.flush()

                print(f"[OK] Saved row: label={label}, features={features}")
                time.sleep(0.5)
        except KeyboardInterrupt:
            print("\n[INFO] Stopped fabric collection.")


if __name__ == "__main__":
    main()

