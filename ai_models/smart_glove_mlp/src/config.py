from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class ProjectPaths:
    """
    Centralized paths so dataset replacement doesn't require code rewrites.
    """

    root: Path

    @property
    def data_raw_dir(self) -> Path:
        return self.root / "data" / "raw"

    @property
    def data_processed_dir(self) -> Path:
        return self.root / "data" / "processed"

    @property
    def models_dir(self) -> Path:
        return self.root / "models"

    @property
    def color_models_dir(self) -> Path:
        return self.models_dir / "color"

    @property
    def fabric_models_dir(self) -> Path:
        return self.models_dir / "fabric"


def get_project_paths() -> ProjectPaths:
    # `src/` lives under project root. Using Path(__file__) keeps it OS-independent.
    root = Path(__file__).resolve().parents[1]
    return ProjectPaths(root=root)


# -------- Dataset specs (raw/processed expectations) --------

# Color features used for training in this repo.
# (When using `data/raw/color_names.csv`, we train from RGB + HSL-like columns.)
COLOR_FEATURES = ["R", "G", "B", "Hue", "HSL_S", "HSL_L"]
COLOR_LABEL_COL = "label"
COLOR_CLASSES = ["black", "white", "red", "blue"]

FABRIC_FEATURES = ["R", "S", "T", "U", "V", "W"]
FABRIC_LABEL_COL = "label"
FABRIC_CLASSES = ["cotton", "polyester", "denim"]

# Jitter on fabric spectral columns during preprocessing (simulates sensor noise / lighting).
# Relative to each feature's standard deviation in the raw CSV. 0 disables.
# Raise if test accuracy stays ~100% on very separable synthetic CSVs; lower if recall drops.
FABRIC_PREPROCESS_NOISE_REL_STD = 0.50
FABRIC_PREPROCESS_NOISE_SEED = 42
FABRIC_FEATURE_VALUE_MIN = 0.0
FABRIC_FEATURE_VALUE_MAX = 1000.0


# -------- File names (raw + processed) --------

RAW_COLOR_CSV_NAME = "color_names.csv"
RAW_FABRIC_CSV_NAME = "fabric_dataset.csv"

PROCESSED_COLOR_CSV_NAME = "color_dataset_processed.csv"
PROCESSED_FABRIC_CSV_NAME = "fabric_dataset_processed.csv"

