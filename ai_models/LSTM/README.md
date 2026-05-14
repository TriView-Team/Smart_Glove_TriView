# TriView Smart Glove — LSTM Gesture Recognition

## Overview

This folder contains the **LSTM-based gesture recognition** experiment for the **TriView Smart Glove** graduation project: a smart glove designed to help **visually impaired users identify clothing**. Sensor readings from the glove (notably **flex sensors** and related channels) are arranged as short **time series**. A neural model learns to map those sequences to **discrete labels**, which the wider system can interpret as **commands** for the companion mobile app.

The implementation lives primarily in **`LSTM.ipynb`**, which was authored for **Google Colab** (metadata references GPU acceleration). CSV data used in the notebook is provided under **`archive-20260514T070236Z-3-001/archive/`**.

## Purpose

**Role of the LSTM:** Recognize **finger / hand gestures** from **flex and motion-related sensor streams**, and classify them so the TriView pipeline can trigger the right behavior—for example:

- **Send** detected clothing information to the mobile app  
- **Save** an item into the user’s wardrobe  
- **Discard** the current detection  

In the notebook, labels are stored as string classes in a column named **`SIGN`** (seven vocabulary-style gestures). The notebook also defines a **higher-level command grouping** (`CMD`) with three classes—**`START`**, **`STOP`**, and **`IDLE`**—by merging those `SIGN` labels, which is suitable for coarse app control logic. The exact mapping implemented in code is:

| `CMD`   | Source `SIGN` labels        |
|---------|-----------------------------|
| `START` | `PROUD`, `THANK YOU`        |
| `STOP`  | `PAUSE`, `WORK`            |
| `IDLE`  | `THIS`, `WE`, `STUDENT`   |

Product-level wiring (which command triggers send vs. save vs. discard) is defined by the rest of the TriView system; this folder focuses on **learning from the sensor CSVs**.

## Dataset

- **Location:** `archive-20260514T070236Z-3-001/archive/`
- **Files (five):**  
  `pause_sign.csv`, `sensors_data_1.csv`, `sensors_data_2.csv`, `sensors_data_3.csv`, `sensor_data_4.csv`
- **Format:** Each row is one sample. Feature columns follow a fixed naming pattern across **20 time steps** (`Frame-1` … `Frame-20`), including:
  - **Flex** sensors (left and right hands)  
  - **Position** (X, Y, Z) and **Orientation** (X, Y, Z) for left and right hands  
- **Label column:** `SIGN` (string class per row).
- **Shapes reported in the notebook after loading and cleaning:**
  - Concatenated table: **`(2590, 441)`** before dropping invalid labels; **`(2589, 441)`** after cleaning.
  - Tensor built for sequence learning: **`X` with shape `(2589, 20, 22)`** — **20** time steps, **22** features per step — with **`y`** of length **2589**.
- **Class counts after cleaning (`SIGN`), as printed in the notebook:**  
  `THANK YOU` 399, `THIS` 399, `PROUD` 398, `STUDENT` 397, `WE` 397, `PAUSE` 300, `WORK` 299.

## Model Architecture

The main **Keras `Sequential`** stack in the training cell is:

1. **`Input`** with shape `(time_steps, features)` — i.e. `(20, 22)` in the recorded run.
2. **`GaussianNoise(0.08)`** — light input noise for regularization.
3. **`LSTM(16, return_sequences=True, dropout=0.5, recurrent_dropout=0.3)`** — first recurrent layer returning a sequence to the next LSTM.
4. **`LSTM(8, dropout=0.5, recurrent_dropout=0.3)`** — second recurrent layer.
5. **`Dense(8, activation="relu")`**
6. **`Dropout(0.5)`**
7. **`Dense(num_classes, activation="softmax")`** — `num_classes` comes from `LabelEncoder` on the active label set (seven for `SIGN`, three for `CMD` when that branch is used).

**Optimizer / loss:** Adam, **`sparse_categorical_crossentropy`**, with **`accuracy`** as a metric where specified in the main training cell.

## Training Details

- **Libraries:** `pandas`, `numpy`, `re`, `sklearn` (`train_test_split`, `LabelEncoder`, `StandardScaler`), `tensorflow.keras` (`layers`, `models`, `regularizers` imported; the trained stack above is the documented one).
- **Split:** `train_test_split` with **`test_size=0.2`**, **`random_state=42`**, **`stratify`** on integer-encoded labels.
- **Scaling:** `StandardScaler` **fit on training data only**, applied by reshaping `(N, T, F)` → `(N*T, F)` → transform → reshape back.
- **Training call (main run):** `fit(..., validation_split=0.2, epochs=15, batch_size=32, verbose=1)`.
- **Environment note:** The notebook’s default data path targets **Google Drive** (`/content/drive/MyDrive/archive`). For local use, point `path` at the `archive` folder inside this directory (see **How to Run**).

## Results

- For the **seven-class `SIGN`** model trained in the consolidated cell, the notebook’s **`evaluate`** output on the held-out test set reports **test accuracy ≈ 95.56%** (printed as `95.56%` after 15 epochs in the saved run).
- Later cells experiment with **`CMD`** (three classes), metrics, and plots; metrics depend on execution order and which variables reference the active model—**re-run the notebook end-to-end** after changing paths or data for authoritative numbers.

## How to Run

1. **Install dependencies** (see **Requirements**). A Python **3.x** environment is assumed.
2. **Place or keep CSVs** under  
   `archive-20260514T070236Z-3-001/archive/`  
   (same filenames as listed above).
3. **Open** `LSTM.ipynb` in JupyterLab, VS Code, or Google Colab.
4. **Set the data directory** in the code instead of the Colab Drive path—for example, relative to this folder:  
   `path = "archive-20260514T070236Z-3-001/archive"`  
   or an absolute path to that same `archive` directory on your machine.
5. **Skip or adapt** cells that call `google.colab.drive` if you are not using Colab.
6. **Run cells in order** from data load through training and evaluation.

Optional: Colab metadata indicates **`GPU` / `T4`** was used historically; local CPU training works but may be slower.

## File Structure

```text
LSTM/
├── README.md                          # This file
├── LSTM.ipynb                         # Colab-oriented training & evaluation notebook
└── archive-20260514T070236Z-3-001/
    └── archive/
        ├── pause_sign.csv
        ├── sensor_data_4.csv
        ├── sensors_data_1.csv
        ├── sensors_data_2.csv
        └── sensors_data_3.csv
```

## Requirements

The notebook imports the following (install via `pip` as needed; exact versions were not pinned in this folder):

| Package        | Typical use in notebook                          |
|----------------|--------------------------------------------------|
| `pandas`       | Loading and merging CSVs                         |
| `numpy`        | Arrays, stacking time steps                     |
| `scikit-learn` | `train_test_split`, `LabelEncoder`, `StandardScaler` |
| `tensorflow`   | Keras `Sequential` model, training, evaluation   |
| `matplotlib`   | Plotting                                         |
| `seaborn`      | Heatmaps (e.g. confusion matrix visualization) |

Example (CPU or GPU according to your TensorFlow install):

```bash
pip install pandas numpy scikit-learn tensorflow matplotlib seaborn jupyter
```

---

*TriView Smart Glove — LSTM module. Dataset layout and metrics are taken from `LSTM.ipynb` and the CSV archive as they exist in this repository.*
