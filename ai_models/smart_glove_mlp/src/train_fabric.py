from __future__ import annotations

from pathlib import Path

from .config import (
    FABRIC_CLASSES,
    FABRIC_FEATURES,
    FABRIC_LABEL_COL,
    PROCESSED_FABRIC_CSV_NAME,
    get_project_paths,
)
from .model import train_mlp_classifier
from .utils import (
    DataValidationError,
    FeatureSpec,
    enforce_columns_exact,
    read_csv_strict,
    validate_class_balance,
    validate_labels_known,
    validate_no_missing_values,
    save_text,
)


def train_fabric(processed_csv_path: Path, model_dir: Path) -> None:
    df = read_csv_strict(processed_csv_path)
    df = enforce_columns_exact(df, FABRIC_FEATURES, FABRIC_LABEL_COL)

    validate_no_missing_values(df)
    validate_labels_known(df[FABRIC_LABEL_COL].astype(str).tolist(), FABRIC_CLASSES)
    validate_class_balance(df[FABRIC_LABEL_COL].astype(str).tolist())

    X = df[FABRIC_FEATURES].to_numpy(dtype=float)
    y = df[FABRIC_LABEL_COL].astype(str).tolist()

    metrics = train_mlp_classifier(
        X=X,
        y=y,
        feature_spec=FeatureSpec(features=list(FABRIC_FEATURES)),
        model_dir=model_dir,
        model_name_for_metrics="Fabric Model",
        # Slightly stronger regularization + smaller network to avoid "too perfect" results
        # on synthetic datasets, while keeping inference pipeline unchanged.
        hidden_layer_sizes=(32, 16),
        alpha=1e-3,
        max_iter=600,
    )

    print(f"[OK] Fabric model trained. Accuracy: {metrics['accuracy']*100:.1f}%")
    print(f"[OK] Artifacts saved in: {model_dir}")


def main() -> None:
    paths = get_project_paths()
    processed = paths.data_processed_dir / PROCESSED_FABRIC_CSV_NAME
    model_dir = paths.fabric_models_dir

    try:
        train_fabric(processed, model_dir)
    except DataValidationError as e:
        save_text(model_dir / "train_fabric_error.txt", f"Train fabric failed:\n{e}\n")
        raise


if __name__ == "__main__":
    main()

