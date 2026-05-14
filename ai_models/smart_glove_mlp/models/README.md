# Trained models (Color + Fabric)

This folder holds **two separate MLP classifiers**. They are trained on your PC, then the same files can be copied to a Raspberry Pi for runtime inference.

| Model | Folder | Sensor (design target) | Input features (trained / inference) | Output labels |
|--------|--------|-------------------------|----------------------------------------|----------------|
| **Color** | `color/` | AS7341 (hardware direction) | **`R`, `G`, `B`, `Hue`, `HSL_S`, `HSL_L`** (6 values — same order as processed CSV) | `black`, `white`, `red`, `blue` |
| **Fabric** | `fabric/` | AS7263 NIR (6 channels) | `R`, `S`, `T`, `U`, `V`, `W` | `cotton`, `polyester`, `denim` |

Raw AS7341 `F1`…`NIR` is **not** the same as the current training columns; see the main `README.md` color section.

---

## What gets saved after training

Each of `models/color/` and `models/fabric/` should contain:

- **`model.pkl`** — sklearn `MLPClassifier`
- **`scaler.pkl`** — `StandardScaler` (fit on training data)
- **`label_encoder.pkl`** — maps class names to integers
- **`feature_order.json`** — strict column order for inference
- **`classification_report.txt`** — precision / recall / F1 per class
- **`confusion_matrix.png`** — quick visual check
- **`metrics.txt`** — headline accuracy (test split)

If training fails, you may see `train_*_error.txt` instead—fix the issue, then train again.

---

## Prerequisites (training PC)

From the **project root** (`smart_glove_mlp/`):

```bash
python -m venv .venv
```

**Windows (PowerShell):**

```powershell
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

**Linux / macOS:**

```bash
source .venv/bin/activate
pip install -r requirements.txt
```

---

## 1) Put raw datasets in place

- **Color:** `data/raw/color_names.csv` (or the format supported by `preprocess_color`; see main `README.md`).
- **Fabric:** `data/raw/fabric_dataset.csv`  
  Header must be: `R,S,T,U,V,W,label`

---

## 2) Preprocess (builds fixed CSVs)

Run from project root:

```bash
python -m src.preprocess_color
python -m src.preprocess_fabric
```

Outputs:

- `data/processed/color_dataset_processed.csv`
- `data/processed/fabric_dataset_processed.csv`

---

## 3) Train both models

```bash
python -m src.train_color
python -m src.train_fabric
```

Training prints a one-line accuracy summary and refreshes the folders `models/color/` and `models/fabric/`.

---

## 4) Run predictions (English CLI)

All commands assume **project root** as the current directory.

### Combined line (demo label text)

```bash
python -m src.predict_combined --color_csv data/processed/color_dataset_processed.csv --color_row 0 --fabric_csv data/processed/fabric_dataset_processed.csv --fabric_row 0
```

Example output shape:

```text
Blue Cotton T-Shirt
```

(`T-Shirt` is a placeholder until NFC / UI supplies the garment type.)

### Color only (from CSV row)

```bash
python -m src.predict_color --csv data/processed/color_dataset_processed.csv --row 0
```

### Color only (raw numbers, correct order)

Feature order: **`R,G,B,Hue,HSL_S,HSL_L`** (six comma-separated numbers)

```bash
python -m src.predict_color --values 0,46,99,212,100,19
```

### Fabric only (from CSV row)

```bash
python -m src.predict_fabric --csv data/processed/fabric_dataset_processed.csv --row 0
```

### Fabric only (raw numbers)

Order: `R,S,T,U,V,W`

```bash
python -m src.predict_fabric --values 400,420,450,470,500,520
```

---

## Raspberry Pi

Collection scripts append **raw** rows to CSV under `data/raw/`. After you copy CSVs back to the PC, repeat **preprocess → train** as needed.

Runtime integration example: `raspberry_pi/run_glove.py` (loads the same artifacts from `models/color/` and `models/fabric/`).

---

## Quick checks

```bash
python -m unittest discover -s tests -v
```

---

## Troubleshooting (short)

| Problem | What to check |
|--------|----------------|
| `ArtifactError` / missing `.pkl` | Run `train_color` / `train_fabric` again from project root. |
| Feature mismatch | Use processed CSVs or match `feature_order.json` exactly. |
| Weak metrics | Review raw labels, class balance, and data quality; retrain. |
