from __future__ import annotations

from pathlib import Path

import numpy as np
import pandas as pd

from .config import (
    FABRIC_CLASSES,
    FABRIC_FEATURE_VALUE_MAX,
    FABRIC_FEATURE_VALUE_MIN,
    FABRIC_FEATURES,
    FABRIC_LABEL_COL,
    FABRIC_PREPROCESS_NOISE_REL_STD,
    FABRIC_PREPROCESS_NOISE_SEED,
    PROCESSED_FABRIC_CSV_NAME,
    RAW_FABRIC_CSV_NAME,
    get_project_paths,
)
from .utils import (
    DataValidationError,
    enforce_columns_exact,
    ensure_dir,
    read_csv_strict,
    validate_labels_known,
    validate_no_missing_values,
    save_text,
)


def preprocess_fabric_dataset(
    raw_csv_path: Path,
    processed_csv_path: Path,
    *,
    noise_rel_std: float = FABRIC_PREPROCESS_NOISE_REL_STD,
    noise_seed: int = FABRIC_PREPROCESS_NOISE_SEED,
) -> None:
    """
    Converts raw fabric CSV into a fixed, consistent processed format.
    Same strict rules as color preprocessing.

    Optional Gaussian jitter on R..W simulates AS7263-style count noise and lighting drift
    so models trained on synthetic NIR-like CSVs are less likely to show unrealistically
    perfect separation.
    """
    df = read_csv_strict(raw_csv_path)
    df = enforce_columns_exact(df, FABRIC_FEATURES, FABRIC_LABEL_COL)
    validate_no_missing_values(df)
    validate_labels_known(df[FABRIC_LABEL_COL].astype(str).tolist(), FABRIC_CLASSES)

    for c in FABRIC_FEATURES:
        df[c] = pd.to_numeric(df[c], errors="raise")
    df[FABRIC_LABEL_COL] = df[FABRIC_LABEL_COL].astype(str)

    if noise_rel_std > 0:
        rel = float(noise_rel_std)
        rng = np.random.default_rng(int(noise_seed))
        for c in FABRIC_FEATURES:
            col_std = float(df[c].std(ddof=0))
            sigma = max(col_std * rel, 1e-9)
            noise = rng.normal(0.0, sigma, size=len(df))
            df[c] = df[c].to_numpy(dtype=float) + noise
        df[FABRIC_FEATURES] = df[FABRIC_FEATURES].clip(
            FABRIC_FEATURE_VALUE_MIN,
            FABRIC_FEATURE_VALUE_MAX,
        )

    ensure_dir(processed_csv_path.parent)
    df.to_csv(processed_csv_path, index=False)


def main() -> None:
    paths = get_project_paths()
    raw_path = paths.data_raw_dir / RAW_FABRIC_CSV_NAME
    processed_path = paths.data_processed_dir / PROCESSED_FABRIC_CSV_NAME

    try:
        preprocess_fabric_dataset(raw_path, processed_path)
    except DataValidationError as e:
        err_path = paths.data_processed_dir / "preprocess_fabric_error.txt"
        save_text(err_path, f"Preprocess fabric failed:\n{e}\n")
        raise

    print(f"[OK] Processed fabric dataset saved to: {processed_path}")


if __name__ == "__main__":
    main()

