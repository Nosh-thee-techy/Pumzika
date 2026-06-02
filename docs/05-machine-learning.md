# Machine Learning

Complete guide to the Pumzika ML pipeline — XGBoost pricing and Prophet forecasting.

---

## Overview

Two models power the dashboard:

| Challenge | Model | Input | Output |
|---|---|---|---|
| **Ch.1 — Pricing** | XGBoost regression | Listing features | `recommendedPrice` (KSH) |
| **Ch.2 — Forecasting** | Facebook Prophet | Daily occupancy time series | 30-day occupancy % per neighborhood |

Both train **offline** in Python. Results export as JSON. The dashboard never calls Python at runtime.

<p align="center">
  <img src="assets/ml-pipeline.svg" alt="ML Pipeline" width="100%" />
</p>

---

## Quick start

```bash
pip install -r requirements-ml.txt
npm run build:ml
```

This runs:
1. `export-training-data.mjs` → `Data/training/*.csv`
2. `train_models.py` → `src/data/forecast.json` + `model-metrics.json`

---

## Ch.1 — XGBoost Pricing Model

### Problem statement

Given a listing's neighborhood, bedroom count, property type, occupancy, rating, and review count — predict the optimal nightly price in KSH.

### Training data

**File:** `Data/training/listings-pricing.csv`  
**Rows:** ~48,211  
**Target:** `price_ksh`

### Features

| Feature | Type | Encoding |
|---|---|---|
| `neighborhood` | Categorical | OneHotEncoder |
| `bedrooms` | Categorical | OneHotEncoder |
| `property_type` | Categorical | OneHotEncoder |
| `occupancy_rate` | Numeric | Passthrough |
| `rating` | Numeric | Passthrough |
| `review_count` | Numeric | Passthrough |
| `price_tier` | Numeric | Passthrough |

### Model configuration

```python
XGBRegressor(
    n_estimators=200,
    max_depth=6,
    learning_rate=0.08,
    subsample=0.85,
    colsample_bytree=0.85,
    random_state=42,
)
```

### Preprocessing

```python
ColumnTransformer([
    ("cat", OneHotEncoder(handle_unknown="ignore"), ["neighborhood", "bedrooms", "property_type"]),
    ("num", "passthrough", ["occupancy_rate", "rating", "review_count", "price_tier"]),
])
```

### Evaluation

| Metric | Value |
|---|---|
| **MAE** | Ksh 2,940 |
| **R²** | 0.607 |
| **Train rows** | 38,568 |
| **Test rows** | 9,643 |
| **Split** | 80/20 random |

### How price predictions reach the dashboard

For each neighborhood × day in the 30-day forecast:

```python
price = xgb_model.predict(neighborhood, bedrooms="2 BR", occupancy=forecasted_occ)
```

Written to `forecast.json` as `recommendedPrice` per entry.

---

## Ch.2 — Facebook Prophet Forecasting

### Problem statement

Given daily occupancy history per neighborhood — forecast occupancy % for the next 30 days.

### Training data

**File:** `Data/training/occupancy-daily.csv`  
**Rows:** ~11,895 (793 days × 15 neighborhoods)  
**Target:** `occupancy`  
**Date range:** 2015-07-01 to 2017-08-31 (proxy from hotel bookings)

### Model configuration

```python
Prophet(
    yearly_seasonality=True,
    weekly_seasonality=True,
    daily_seasonality=False,
    seasonality_mode="multiplicative",
)
```

One Prophet model trained **per neighborhood** (15 models total).

### Event overlay

After Prophet prediction, known events from `src/data/events.json` adjust occupancy:

```python
if event:
    occ = occ * (0.7 + event.demandMultiplier * 0.3)
```

Events include: Madaraka Day, Nairobi Marathon, Koroga Festival, Tech Conference, Payday surges.

### Fallback mode

If Prophet is not installed (common on Python 3.14):

- Uses **seasonal decomposition** — day-of-week means + month means
- Marked as `"fallback_used": true` in `model-metrics.json`
- Install Prophet for real forecasts: `pip install prophet`

### Demand level mapping

| Occupancy | Level | Calendar color |
|---|---|---|
| ≥ 90% | `peak` | Black |
| ≥ 80% | `high` | Gold |
| ≥ 65% | `medium` | Light gold |
| ≥ 50% | `low` | Light blue |
| < 50% | `cold` | Pale blue |

---

## Output files

### `src/data/forecast.json`

Per-neighborhood array of 30 daily predictions:

```json
{
  "kilimani": [
    {
      "date": "2026-06-02",
      "occupancy": 0.63,
      "recommendedPrice": 12400,
      "demandLevel": "medium",
      "event": { "name": "Madaraka Day Weekend", "type": "holiday" }
    }
  ]
}
```

### `src/data/model-metrics.json`

Training metadata and evaluation metrics:

```json
{
  "trainedAt": "2026-06-02",
  "pricing": {
    "model": "XGBoost",
    "mae_ksh": 2940,
    "r2": 0.607
  },
  "forecasting": {
    "model": "Facebook Prophet",
    "horizonDays": 30,
    "neighborhoods": 15
  }
}
```

---

## Notebook submission

**File:** `notebooks/pumzika_ml.ipynb`

For hackathon submission alongside the dashboard. Runs the same logic as `train_models.py`:

```python
%run train_models.py
```

Then inspects output:

```python
import json
forecast = json.loads(Path('../src/data/forecast.json').read_text())
metrics = json.loads(Path('../src/data/model-metrics.json').read_text())
```

---

## Retraining workflow

When new data arrives:

```bash
# 1. Update source CSVs in Data/
# 2. Re-export training data
npm run export:training

# 3. Retrain models
npm run train:models

# 4. Verify metrics improved
cat src/data/model-metrics.json

# 5. Rebuild dashboard
npm run build
```

> **Important:** Once `model-metrics.json` exists, `build-datasets.mjs` will **not** overwrite `forecast.json` with rule-based data. ML output is preserved.

---

## Python dependencies

**File:** `requirements-ml.txt`

```
pandas>=2.0
numpy>=1.24
scikit-learn>=1.3
xgboost>=2.0
prophet>=1.1
jupyter>=1.0
```

### Python version notes

| Version | XGBoost | Prophet |
|---|---|---|
| 3.10–3.12 | Works | Works |
| 3.14 | Works | Fallback mode (Prophet install issues) |

---

## Improving model accuracy

| Action | Expected impact |
|---|---|
| Replace NYC proxy with real Nairobi listings | R² likely increases to 0.75+ |
| Add 12+ months daily occupancy | Prophet captures yearly seasonality properly |
| Add amenity features to XGBoost | Better price differentiation |
| Add event features as Prophet regressors | Sharper demand spike predictions |
| Increase listing count per neighborhood | More reliable comp baselines |

---

## What is NOT saved

The trained model objects (`.pkl`, `.joblib`) are **not** persisted to disk. Only prediction outputs are saved. To save models, add to `train_models.py`:

```python
import joblib
joblib.dump(xgb_model, "models/xgb_pricing.pkl")
joblib.dump(preprocessor, "models/xgb_preprocessor.pkl")
```

This is optional — the current architecture bakes predictions into JSON intentionally.

---

<p align="center"><a href="./04-dataset-guide.md">← Dataset Guide</a> · <a href="./06-models-vs-engines.md">Models vs Engines →</a></p>
