from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, List, Optional, Sequence, Tuple, Union

import numpy as np
import pandas as pd


class DataValidationError(ValueError):
    """Raised when dataset validation fails."""


class ArtifactError(FileNotFoundError):
    """Raised when required model artifacts are missing."""


class FeatureSpecError(ValueError):
    """Raised when feature count/order is wrong."""


@dataclass(frozen=True)
class FeatureSpec:
    """
    Defines the exact expected feature order for a model.
    This is saved to disk after training and checked during prediction.
    """

    features: List[str]

    @property
    def n_features(self) -> int:
        return len(self.features)

    def to_json(self) -> str:
        return json.dumps({"features": self.features}, ensure_ascii=False, indent=2)

    @staticmethod
    def from_json(text: str) -> "FeatureSpec":
        obj = json.loads(text)
        feats = obj.get("features")
        if not isinstance(feats, list) or not feats or not all(isinstance(x, str) for x in feats):
            raise ValueError("Invalid feature_order.json format: expected {'features': [str, ...]}")
        return FeatureSpec(features=list(feats))


def ensure_dir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def read_csv_strict(path: Path) -> pd.DataFrame:
    if not path.exists():
        raise FileNotFoundError(f"CSV file not found: {path}")
    return pd.read_csv(path)


def enforce_columns_exact(df: pd.DataFrame, expected_cols: Sequence[str], label_col: str) -> pd.DataFrame:
    """
    Ensures the dataframe contains exactly expected feature columns + label column.
    Returns a dataframe with columns ordered consistently.
    """
    expected_all = list(expected_cols) + [label_col]
    missing = [c for c in expected_all if c not in df.columns]
    extra = [c for c in df.columns if c not in expected_all]
    if missing:
        raise DataValidationError(f"Missing required columns: {missing}")
    if extra:
        raise DataValidationError(f"Unexpected extra columns: {extra}")
    return df[expected_all].copy()


def validate_no_missing_values(df: pd.DataFrame) -> None:
    if df.isna().any().any():
        # show a tiny summary for developer debugging
        na_counts = df.isna().sum()
        bad = na_counts[na_counts > 0].to_dict()
        raise DataValidationError(f"Dataset contains missing values: {bad}")


def validate_class_balance(
    y: Sequence[str],
    *,
    min_samples_per_class: int = 10,
    max_imbalance_ratio: float = 3.0,
) -> None:
    """
    Validates:
    - each class has at least `min_samples_per_class`
    - dataset is not extremely imbalanced (largest/smallest <= max_imbalance_ratio)
    """
    s = pd.Series(list(y))
    counts = s.value_counts()
    if counts.empty:
        raise DataValidationError("Empty label vector. Check your CSV and label column.")

    too_small = counts[counts < min_samples_per_class]
    if not too_small.empty:
        raise DataValidationError(
            f"Insufficient samples per class. Minimum required = {min_samples_per_class}. "
            f"Counts = {counts.to_dict()}"
        )

    if len(counts) > 1:
        ratio = counts.max() / counts.min()
        if ratio > max_imbalance_ratio:
            raise DataValidationError(
                f"Dataset appears imbalanced (max/min = {ratio:.2f} > {max_imbalance_ratio}). "
                f"Counts = {counts.to_dict()}"
            )


def validate_labels_known(y: Sequence[str], allowed: Sequence[str]) -> None:
    allowed_set = set(allowed)
    unknown = sorted(set(y) - allowed_set)
    if unknown:
        raise DataValidationError(f"Unknown labels found: {unknown}. Allowed labels: {list(allowed)}")


def save_text(path: Path, text: str) -> None:
    ensure_dir(path.parent)
    path.write_text(text, encoding="utf-8")


def save_json(path: Path, obj: dict) -> None:
    ensure_dir(path.parent)
    path.write_text(json.dumps(obj, ensure_ascii=False, indent=2), encoding="utf-8")


def load_json(path: Path) -> dict:
    if not path.exists():
        raise FileNotFoundError(f"JSON file not found: {path}")
    return json.loads(path.read_text(encoding="utf-8"))


def as_2d_array(
    x: Union[pd.Series, pd.DataFrame, List[float], List[int], np.ndarray, Sequence[float], Sequence[int]],
    *,
    expected_n_features: int,
) -> np.ndarray:
    """
    Converts input into shape (1, n_features) for single-sample prediction.
    Supports:
    - CSV row as pd.Series
    - single row pd.DataFrame
    - Python list
    - numpy array (1D or 2D with one row)
    """
    if isinstance(x, pd.DataFrame):
        arr = x.to_numpy()
    elif isinstance(x, pd.Series):
        arr = x.to_numpy()
    else:
        arr = np.asarray(x)

    if arr.ndim == 1:
        arr = arr.reshape(1, -1)
    elif arr.ndim == 2 and arr.shape[0] == 1:
        pass
    else:
        raise FeatureSpecError(f"Expected a single sample (1D or 2D with one row). Got shape: {arr.shape}")

    if arr.shape[1] != expected_n_features:
        raise FeatureSpecError(
            f"Wrong feature count. Expected {expected_n_features}, got {arr.shape[1]}."
        )
    return arr.astype(float)


def validate_feature_order(
    provided_feature_names: Optional[Sequence[str]],
    expected: FeatureSpec,
) -> None:
    """
    Strict validation of feature order when caller supplies column names (e.g., from a CSV row).
    If feature names aren't provided (e.g., user passed a list/ndarray), we can't check order,
    so we only rely on feature count.
    """
    if provided_feature_names is None:
        return

    provided = list(provided_feature_names)
    if provided != expected.features:
        raise FeatureSpecError(
            "Wrong feature order.\n"
            f"Expected: {expected.features}\n"
            f"Provided: {provided}"
        )


def pick_row_from_csv(csv_path: Path, row_index: int, *, feature_cols: Sequence[str], label_col: str) -> pd.Series:
    """
    Loads a CSV and returns a single row's features as a Series, enforcing strict columns.
    """
    df = read_csv_strict(csv_path)
    df = enforce_columns_exact(df, feature_cols, label_col)
    if row_index < 0 or row_index >= len(df):
        raise IndexError(f"Row index out of range: {row_index}. CSV rows: {len(df)}")
    row = df.iloc[row_index]
    return row[list(feature_cols)]

