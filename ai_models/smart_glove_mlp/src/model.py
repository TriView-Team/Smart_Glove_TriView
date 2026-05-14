from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Optional, Sequence, Tuple

import joblib
import numpy as np
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.model_selection import train_test_split
from sklearn.neural_network import MLPClassifier
from sklearn.preprocessing import LabelEncoder, StandardScaler

from .utils import (
    ArtifactError,
    FeatureSpec,
    FeatureSpecError,
    ensure_dir,
    load_json,
    save_json,
    save_text,
)


@dataclass(frozen=True)
class ModelArtifacts:
    """
    File layout for a single trained model (color OR fabric).
    """

    model_path: Path
    scaler_path: Path
    label_encoder_path: Path
    feature_order_path: Path

    confusion_matrix_png: Path
    classification_report_txt: Path
    metrics_txt: Path

    @staticmethod
    def for_dir(model_dir: Path) -> "ModelArtifacts":
        return ModelArtifacts(
            model_path=model_dir / "model.pkl",
            scaler_path=model_dir / "scaler.pkl",
            label_encoder_path=model_dir / "label_encoder.pkl",
            feature_order_path=model_dir / "feature_order.json",
            confusion_matrix_png=model_dir / "confusion_matrix.png",
            classification_report_txt=model_dir / "classification_report.txt",
            metrics_txt=model_dir / "metrics.txt",
        )

    def validate_exists(self) -> None:
        missing = []
        for p in [
            self.model_path,
            self.scaler_path,
            self.label_encoder_path,
            self.feature_order_path,
        ]:
            if not p.exists():
                missing.append(str(p))
        if missing:
            raise ArtifactError(
                "Missing required model artifacts:\n- " + "\n- ".join(missing)
            )


def _scaled_test_for_evaluation(
    X_test_scaled: np.ndarray,
    *,
    random_state: int,
    robust_noise_std_factor: float,
) -> np.ndarray:
    """
    Scaled test matrix for predictions, confusion matrix, and classification_report.
    When robust_noise_std_factor > 0, adds Gaussian noise (same recipe as headline accuracy).
    """
    if robust_noise_std_factor <= 0:
        return X_test_scaled
    rng = np.random.default_rng(int(random_state))
    per_feature_std = X_test_scaled.std(axis=0, ddof=0)
    noise = rng.normal(
        0.0,
        per_feature_std * float(robust_noise_std_factor),
        size=X_test_scaled.shape,
    )
    return X_test_scaled + noise


def train_mlp_classifier(
    X: np.ndarray,
    y: Sequence[str],
    *,
    feature_spec: FeatureSpec,
    model_dir: Path,
    model_name_for_metrics: str,
    test_size: float = 0.2,
    random_state: int = 42,
    hidden_layer_sizes: Tuple[int, ...] = (64, 32),
    alpha: float = 1e-4,
    max_iter: int = 800,
    robust_noise_std_factor: float = 0.0,
) -> Dict[str, float]:
    """
    Trains an MLP classifier with scaling + label encoding.
    Saves all artifacts and evaluation outputs into `model_dir`.
    Returns a dict including accuracy.
    """
    ensure_dir(model_dir)
    artifacts = ModelArtifacts.for_dir(model_dir)

    if X.ndim != 2 or X.shape[1] != feature_spec.n_features:
        raise FeatureSpecError(
            f"Training data shape mismatch. Expected (*, {feature_spec.n_features}), got {X.shape}."
        )

    # Encode labels (string -> int)
    le = LabelEncoder()
    y_encoded = le.fit_transform(list(y))

    # Split BEFORE scaling to avoid leakage.
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y_encoded,
        test_size=test_size,
        random_state=random_state,
        stratify=y_encoded,
    )

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # MLP model: good baseline for tabular spectral features.
    clf = MLPClassifier(
        hidden_layer_sizes=hidden_layer_sizes,
        activation="relu",
        solver="adam",
        alpha=alpha,
        batch_size="auto",
        learning_rate="adaptive",
        max_iter=max_iter,
        random_state=random_state,
        early_stopping=True,
        n_iter_no_change=20,
        validation_fraction=0.15,
    )

    clf.fit(X_train_scaled, y_train)
    clean_accuracy = float(clf.score(X_test_scaled, y_test))

    # Predictions + reports use the same X as the headline metric:
    # clean test set unless robust_noise_std_factor > 0 (noisy scaled test features).
    X_test_eval = _scaled_test_for_evaluation(
        X_test_scaled,
        random_state=random_state,
        robust_noise_std_factor=robust_noise_std_factor,
    )
    y_pred = clf.predict(X_test_eval)
    cm = confusion_matrix(y_test, y_pred)
    report = classification_report(
        y_test,
        y_pred,
        target_names=list(le.classes_),
        digits=4,
        zero_division=0,
    )
    robust_accuracy = float(clf.score(X_test_eval, y_test))

    # Save artifacts
    joblib.dump(clf, artifacts.model_path)
    joblib.dump(scaler, artifacts.scaler_path)
    joblib.dump(le, artifacts.label_encoder_path)
    save_json(artifacts.feature_order_path, {"features": feature_spec.features})

    report_header = ""
    if robust_noise_std_factor > 0:
        report_header = (
            f"# Robust evaluation: Gaussian noise on scaled test features "
            f"(noise_factor={robust_noise_std_factor:.2f}). Matches metrics.txt headline.\n"
            f"# Clean test accuracy (same split, no noise): {clean_accuracy*100:.1f}%\n\n"
        )
    save_text(artifacts.classification_report_txt, report_header + report + "\n")

    # Headline metric: when robust evaluation is enabled, report ONLY robust accuracy.
    # This avoids misleading "perfect" scores on very clean/easy datasets.
    reported_accuracy = robust_accuracy if robust_noise_std_factor > 0 else clean_accuracy

    save_text(
        artifacts.metrics_txt,
        _format_metrics_text(
            model_name_for_metrics=model_name_for_metrics,
            accuracy=reported_accuracy,
            robust_noise_std_factor=robust_noise_std_factor,
        ),
    )

    cm_title = f"{model_name_for_metrics} Confusion Matrix"
    if robust_noise_std_factor > 0:
        cm_title += f" (robust, noise_factor={robust_noise_std_factor:.2f})"

    # Confusion matrix plot saved as PNG (nice for reports)
    _save_confusion_matrix_png(
        cm=cm,
        class_names=list(le.classes_),
        out_path=artifacts.confusion_matrix_png,
        title=cm_title,
    )

    return {
        "accuracy": reported_accuracy,
        "clean_accuracy": clean_accuracy,
        "robust_accuracy": robust_accuracy,
    }


def _format_metrics_text(
    *,
    model_name_for_metrics: str,
    accuracy: float,
    robust_noise_std_factor: float,
) -> str:
    if robust_noise_std_factor > 0:
        return (
            f"{model_name_for_metrics} Accuracy (robust, noise_factor={robust_noise_std_factor:.2f}): "
            f"{accuracy*100:.1f}%\n"
        )
    return f"{model_name_for_metrics} Accuracy: {accuracy*100:.1f}%\n"


def _save_confusion_matrix_png(
    *,
    cm: np.ndarray,
    class_names: List[str],
    out_path: Path,
    title: str,
) -> None:
    """
    Saves a confusion matrix heatmap image.
    Separated function so training code remains clean.
    """
    import matplotlib.pyplot as plt
    import seaborn as sns

    ensure_dir(out_path.parent)
    plt.figure(figsize=(7, 6))
    sns.heatmap(
        cm,
        annot=True,
        fmt="d",
        cmap="Blues",
        xticklabels=class_names,
        yticklabels=class_names,
    )
    plt.xlabel("Predicted")
    plt.ylabel("True")
    plt.title(title)
    plt.tight_layout()
    plt.savefig(out_path, dpi=200)
    plt.close()


@dataclass(frozen=True)
class LoadedModel:
    """
    Inference-time bundle.
    """

    clf: MLPClassifier
    scaler: StandardScaler
    label_encoder: LabelEncoder
    feature_spec: FeatureSpec


def load_model(model_dir: Path) -> LoadedModel:
    artifacts = ModelArtifacts.for_dir(model_dir)
    artifacts.validate_exists()

    clf = joblib.load(artifacts.model_path)
    scaler = joblib.load(artifacts.scaler_path)
    le = joblib.load(artifacts.label_encoder_path)

    spec_dict = load_json(artifacts.feature_order_path)
    feature_spec = FeatureSpec.from_json(
        # reuse our strict parser while keeping stored format stable
        __import__("json").dumps(spec_dict, ensure_ascii=False)
    )

    return LoadedModel(
        clf=clf,
        scaler=scaler,
        label_encoder=le,
        feature_spec=feature_spec,
    )


def predict_single(
    loaded: LoadedModel,
    x_2d: np.ndarray,
    *,
    provided_feature_names: Optional[Sequence[str]] = None,
) -> str:
    """
    Predicts a single sample.
    - Checks feature order if names are provided (typical for CSV inputs).
    - Always checks feature count.
    Returns the class label string.
    """
    from .utils import validate_feature_order

    validate_feature_order(provided_feature_names, loaded.feature_spec)
    if x_2d.shape != (1, loaded.feature_spec.n_features):
        raise FeatureSpecError(
            f"Expected shape (1, {loaded.feature_spec.n_features}), got {x_2d.shape}."
        )

    x_scaled = loaded.scaler.transform(x_2d)
    pred_int = int(loaded.clf.predict(x_scaled)[0])
    pred_label = str(loaded.label_encoder.inverse_transform([pred_int])[0])
    return pred_label

