from __future__ import annotations

from pathlib import Path

import pandas as pd

from .config import (
    COLOR_CLASSES,
    COLOR_FEATURES,
    COLOR_LABEL_COL,
    PROCESSED_COLOR_CSV_NAME,
    RAW_COLOR_CSV_NAME,
    get_project_paths,
)
from .utils import (
    DataValidationError,
    ensure_dir,
    read_csv_strict,
    validate_labels_known,
    validate_no_missing_values,
    save_text,
)

_COLOR_NAMES_REQUIRED_COLS = [
    "Name",
    "Red (8 bit)",
    "Green (8 bit)",
    "Blue (8 bit)",
    "Hue (degrees)",
    "HSL.S (%)",
    "HSL.L (%), HSV.S (%), HSV.V (%)",
]


def _maybe_convert_color_names_csv(df: pd.DataFrame) -> pd.DataFrame:
    """
    Accepts the public `color_names.csv` format and converts it into our
    training format: features + `label`.

    Labels are derived from the *name* and therefore contain some ambiguity,
    which produces a more realistic (non-perfect) accuracy than clean sensor
    data collected in controlled conditions.
    """
    if not all(c in df.columns for c in _COLOR_NAMES_REQUIRED_COLS):
        return df

    work = df[_COLOR_NAMES_REQUIRED_COLS].copy()
    work["Name"] = work["Name"].astype(str).str.lower()

    # Label from name keywords (intentionally imperfect / ambiguous on purpose).
    def name_to_label(n: str) -> str | None:
        n = n.strip().lower()
        if "black" in n:
            return "black"
        if "white" in n:
            return "white"
        if "blue" in n or "azure" in n or "navy" in n:
            return "blue"
        if "red" in n or "crimson" in n or "scarlet" in n:
            return "red"
        return None

    work[COLOR_LABEL_COL] = work["Name"].map(name_to_label)
    work = work.dropna(subset=[COLOR_LABEL_COL]).copy()

    # Rename feature columns into our expected stable names.
    out = pd.DataFrame(
        {
            "R": pd.to_numeric(work["Red (8 bit)"], errors="raise"),
            "G": pd.to_numeric(work["Green (8 bit)"], errors="raise"),
            "B": pd.to_numeric(work["Blue (8 bit)"], errors="raise"),
            "Hue": pd.to_numeric(work["Hue (degrees)"], errors="raise"),
            "HSL_S": pd.to_numeric(work["HSL.S (%)"], errors="raise"),
            "HSL_L": pd.to_numeric(
                work["HSL.L (%), HSV.S (%), HSV.V (%)"], errors="raise"
            ),
            COLOR_LABEL_COL: work[COLOR_LABEL_COL].astype(str),
        }
    )

    # Keep only allowed labels.
    validate_labels_known(out[COLOR_LABEL_COL].astype(str).tolist(), COLOR_CLASSES)

    # Balance classes to keep training stable and metrics meaningful.
    # `color_names.csv` is naturally skewed towards "blue"/"red" names.
    target_per_class = 80
    parts = []
    for cls in COLOR_CLASSES:
        sub = out[out[COLOR_LABEL_COL] == cls]
        if sub.empty:
            continue
        parts.append(
            sub.sample(
                n=target_per_class,
                replace=(len(sub) < target_per_class),
                random_state=42,
            )
        )
    if parts:
        out = pd.concat(parts, ignore_index=True)
    return out


def _enforce_processed_schema(df: pd.DataFrame) -> pd.DataFrame:
    expected_all = list(COLOR_FEATURES) + [COLOR_LABEL_COL]
    missing = [c for c in expected_all if c not in df.columns]
    extra = [c for c in df.columns if c not in expected_all]
    if missing:
        raise DataValidationError(f"Missing required columns: {missing}")
    if extra:
        raise DataValidationError(f"Unexpected extra columns: {extra}")
    return df[expected_all].copy()


def preprocess_color_dataset(
    raw_csv_path: Path,
    processed_csv_path: Path,
) -> None:
    """
    Converts raw color CSV into a fixed, consistent processed format.

    Rules:
    - required columns must exist
    - no extra columns allowed (keeps format stable)
    - no missing values
    - labels must be from the allowed set
    - feature columns are forced into the exact expected order
    """
    df = read_csv_strict(raw_csv_path)

    # Allow either:
    # - our strict training schema already present, OR
    # - the public `color_names.csv` schema, which we convert into our schema.
    df = _maybe_convert_color_names_csv(df)
    df = _enforce_processed_schema(df)
    validate_no_missing_values(df)
    validate_labels_known(df[COLOR_LABEL_COL].astype(str).tolist(), COLOR_CLASSES)

    # Convert to numeric for model training consistency.
    for c in COLOR_FEATURES:
        df[c] = pd.to_numeric(df[c], errors="raise")
    df[COLOR_LABEL_COL] = df[COLOR_LABEL_COL].astype(str)

    ensure_dir(processed_csv_path.parent)
    df.to_csv(processed_csv_path, index=False)


def main() -> None:
    paths = get_project_paths()
    raw_path = paths.data_raw_dir / RAW_COLOR_CSV_NAME
    processed_path = paths.data_processed_dir / PROCESSED_COLOR_CSV_NAME

    try:
        # If the raw dataset was deleted/moved, allow re-validating/re-saving from
        # the existing processed dataset instead of failing hard.
        input_path = raw_path if raw_path.exists() else processed_path
        preprocess_color_dataset(input_path, processed_path)
    except DataValidationError as e:
        # Save a helpful error text for debugging (useful in graduation documentation).
        err_path = paths.data_processed_dir / "preprocess_color_error.txt"
        save_text(err_path, f"Preprocess color failed:\n{e}\n")
        raise

    print(f"[OK] Processed color dataset saved to: {processed_path}")


if __name__ == "__main__":
    main()

