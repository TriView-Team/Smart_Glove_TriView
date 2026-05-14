from __future__ import annotations

import argparse
from pathlib import Path

from .config import (
    COLOR_FEATURES,
    COLOR_LABEL_COL,
    FABRIC_FEATURES,
    FABRIC_LABEL_COL,
    get_project_paths,
)
from .predict_color import predict_color_from_input
from .predict_fabric import predict_fabric_from_input
from .utils import pick_row_from_csv


def main() -> None:
    """
    Combined predictor for quick verification on Windows.
    (Raspberry Pi runtime uses its own loop in `raspberry_pi/run_glove.py`.)
    """
    parser = argparse.ArgumentParser(description="Predict both color and fabric.")
    parser.add_argument("--color_csv", type=str, required=True)
    parser.add_argument("--color_row", type=int, default=0)
    parser.add_argument("--fabric_csv", type=str, required=True)
    parser.add_argument("--fabric_row", type=int, default=0)
    args = parser.parse_args()

    paths = get_project_paths()

    color_row = pick_row_from_csv(
        csv_path=Path(args.color_csv),
        row_index=args.color_row,
        feature_cols=COLOR_FEATURES,
        label_col=COLOR_LABEL_COL,
    )
    fabric_row = pick_row_from_csv(
        csv_path=Path(args.fabric_csv),
        row_index=args.fabric_row,
        feature_cols=FABRIC_FEATURES,
        label_col=FABRIC_LABEL_COL,
    )

    color = predict_color_from_input(
        color_row.to_numpy(dtype=float),
        model_dir=paths.color_models_dir,
        provided_feature_names=list(COLOR_FEATURES),
    )
    fabric = predict_fabric_from_input(
        fabric_row.to_numpy(dtype=float),
        model_dir=paths.fabric_models_dir,
        provided_feature_names=list(FABRIC_FEATURES),
    )

    # Placeholder garment type from NFC (future)
    garment_type = "T-Shirt"
    print(f"{color.title()} {fabric.title()} {garment_type}")


if __name__ == "__main__":
    main()

