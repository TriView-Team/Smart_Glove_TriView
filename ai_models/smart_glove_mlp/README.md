# Smart Glove (MLP) — Color + Fabric Classification

This repository contains the **MLP-only phase** of the Smart Glove graduation project:

- **Color classification** using **RGB + HSL-style** features (6 columns: `R,G,B,Hue,HSL_S,HSL_L`; AS7341 is the intended hardware path later)
- **Fabric type classification** using **AS7263** NIR spectral sensor data (6 features)

The Raspberry Pi runtime loads trained models and prints a clear combined output like:

> `Blue Cotton T-Shirt`

Future work: LSTM gesture model + mobile app integration.

Model-focused runbook (English): **`models/README.md`**.

## Project layout

```
smart_glove_mlp/
├── data/
│   ├── raw/
│   └── processed/
├── models/
│   ├── color/
│   ├── fabric/
│   └── README.md          # English: how the two models work + run commands
├── src/
│   ├── config.py
│   ├── utils.py
│   ├── model.py
│   ├── collect_color.py
│   ├── collect_fabric.py
│   ├── preprocess_color.py
│   ├── preprocess_fabric.py
│   ├── train_color.py
│   ├── train_fabric.py
│   ├── predict_color.py
│   ├── predict_fabric.py
│   └── predict_combined.py
├── tests/
│   └── test_units.py
├── raspberry_pi/
│   ├── run_glove.py
│   ├── collect_color_standalone.py
│   └── collect_fabric_standalone.py
├── requirements.txt
└── README.md
```

## Data format (raw input)

Place raw CSVs in `data/raw/`.

### Color raw dataset (what `preprocess_color` actually reads)

Default raw file name: **`data/raw/color_names.csv`** (see `RAW_COLOR_CSV_NAME` in `src/config.py`).

Supported inputs:

1. **Public `color_names.csv` style** — columns include `Name`, `Red (8 bit)`, `Green (8 bit)`, `Blue (8 bit)`, `Hue (degrees)`, `HSL.S (%)`, `HSL.L (%), HSV.S (%), HSV.V (%)`. Labels are inferred from `Name` and converted to `R,G,B,Hue,HSL_S,HSL_L,label`.

2. **Already-processed training schema** — exact header:  
   `R,G,B,Hue,HSL_S,HSL_L,label`  
   Classes: `black`, `white`, `red`, `blue`

The **trained color MLP uses 6 features**: `R, G, B, Hue, HSL_S, HSL_L` (not raw AS7341 `F1`…`NIR`).

**Note:** `src/collect_color.py` appends **AS7341-style** rows to `data/raw/color_dataset.csv` (`F1`…`NIR`,`label`). That file is **not** consumed by `preprocess_color` today — add a conversion step or change collection to match the training schema when you wire real hardware.

### Fabric raw dataset (`data/raw/fabric_dataset.csv`)

Header:

`R,S,T,U,V,W,label`

Classes: `cotton, polyester, denim`

## Quick start (Windows training machine)

### 1) Install dependencies

**PowerShell (recommended on Windows):**

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

**Command Prompt:**

```bat
python -m venv .venv
.venv\Scripts\activate.bat
pip install -r requirements.txt
```

### 2) Preprocess raw CSV into fixed format

```bash
python -m src.preprocess_color
python -m src.preprocess_fabric
```

Outputs:
- `data/processed/color_dataset_processed.csv`
- `data/processed/fabric_dataset_processed.csv`

### 3) Train models (saves artifacts + metrics)

```bash
python -m src.train_color
python -m src.train_fabric
```

Outputs saved under:
- `models/color/`
- `models/fabric/`

Each folder includes:
- `model.pkl`, `scaler.pkl`, `label_encoder.pkl`, `feature_order.json`
- `confusion_matrix.png`
- `classification_report.txt`
- `metrics.txt` (includes final accuracy)

### 4) Run predictions (Windows)

Predict from a CSV row index:

```bash
python -m src.predict_combined --color_csv data/processed/color_dataset_processed.csv --color_row 0 --fabric_csv data/processed/fabric_dataset_processed.csv --fabric_row 0
```

Or run each model separately:

```bash
python -m src.predict_color --csv data/processed/color_dataset_processed.csv --row 0
python -m src.predict_fabric --csv data/processed/fabric_dataset_processed.csv --row 0
```

## Raspberry Pi flow

On Raspberry Pi, `src/collect_color.py` and `src/collect_fabric.py` are intended to:
- read sensor values (placeholders included)
- append rows to CSV (in the exact raw format)

Then you transfer CSVs to Windows `data/raw/` for preprocessing + training.

The runtime script `raspberry_pi/run_glove.py` demonstrates where to integrate:
- AS7341 read
- AS7263 read
- NFC garment type
- Speaker output
- Future LSTM model

## Testing

```bash
python -m unittest discover -s tests -v
```

## Notes

- Code is designed to be **stable and maintainable**, not a throwaway prototype.
- Prediction validates:
  - required artifact files exist
  - feature count matches
  - feature order matches (strict)
  - input type supports: CSV row, Python list, numpy array
