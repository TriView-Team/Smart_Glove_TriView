from __future__ import annotations

import argparse
from pathlib import Path
from typing import Optional, Sequence, Union

import numpy as np

from .config import FABRIC_FEATURES, FABRIC_LABEL_COL, get_project_paths
from .model import load_model, predict_single
from .utils import as_2d_array, pick_row_from_csv


def predict_fabric_from_input(
    x: Union[Sequence[float], np.ndarray],
    *,
    model_dir: Path,
    provided_feature_names: Optional[Sequence[str]] = None,
) -> str:
    loaded = load_model(model_dir)
    x2d = as_2d_array(x, expected_n_features=loaded.feature_spec.n_features)
    return predict_single(loaded, x2d, provided_feature_names=provided_feature_names)


def main() -> None:
    parser = argparse.ArgumentParser(description="Predict fabric using trained MLP model.")
    parser.add_argument("--csv", type=str, default="", help="CSV path (processed or strictly formatted).")
    parser.add_argument("--row", type=int, default=0, help="Row index to predict from CSV.")
    parser.add_argument(
        "--values",
        type=str,
        default="",
        help="Comma-separated 6 values for features in correct order.",
    )
    args = parser.parse_args()

    paths = get_project_paths()
    model_dir = paths.fabric_models_dir

    if args.csv:
        row = pick_row_from_csv(
            csv_path=Path(args.csv),
            row_index=args.row,
            feature_cols=FABRIC_FEATURES,
            label_col=FABRIC_LABEL_COL,
        )
        pred = predict_fabric_from_input(
            row.to_numpy(dtype=float),
            model_dir=model_dir,
            provided_feature_names=list(FABRIC_FEATURES),
        )
        print(pred)
        return

    if args.values:
        parts = [p.strip() for p in args.values.split(",") if p.strip() != ""]
        x = np.asarray([float(p) for p in parts], dtype=float)
        pred = predict_fabric_from_input(x, model_dir=model_dir)
        print(pred)
        return

    raise SystemExit("Provide either --csv or --values.")


if __name__ == "__main__":
    main()

