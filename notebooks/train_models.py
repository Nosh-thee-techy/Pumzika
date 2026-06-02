"""
Pumzika ML pipeline — trains offline, exports JSON for the dashboard.

Ch.1 Pricing:    XGBoost regression on listings-pricing.csv → recommendedPrice
Ch.2 Forecasting: Prophet time series on occupancy-daily.csv → 30-day occupancy

Run:
  pip install -r requirements-ml.txt
  npm run export:training
  python notebooks/train_models.py

Outputs:
  src/data/forecast.json   (dashboard reads this)
  src/data/model-metrics.json
"""

from __future__ import annotations

import json
import warnings
from datetime import date, timedelta
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from xgboost import XGBRegressor

try:
    from prophet import Prophet
    HAS_PROPHET = True
except ImportError:
    HAS_PROPHET = False

warnings.filterwarnings("ignore")

ROOT = Path(__file__).resolve().parents[1]
TRAINING = ROOT / "Data" / "training"
DATA = ROOT / "src" / "data"
EVENTS_PATH = DATA / "events.json"
FORECAST_DAYS = 30

BEDROOM_ORDER = ["Studio", "1 BR", "2 BR", "3 BR", "4+ BR"]


def occ_level(o: float) -> str:
    if o >= 0.9:
        return "peak"
    if o >= 0.8:
        return "high"
    if o >= 0.65:
        return "medium"
    if o >= 0.5:
        return "low"
    return "cold"


def round100(n: float) -> int:
    return int(round(n / 100) * 100)


def load_events() -> list[dict]:
    if EVENTS_PATH.exists():
        return json.loads(EVENTS_PATH.read_text(encoding="utf-8"))
    return []


def train_pricing_model(df: pd.DataFrame) -> tuple[XGBRegressor, ColumnTransformer, dict]:
    """XGBoost: predict nightly price from listing features."""
    feature_cols = ["neighborhood", "bedrooms", "property_type", "occupancy_rate", "rating", "review_count", "price_tier"]
    X = df[feature_cols].copy()
    y = df["price_ksh"]

    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore"), ["neighborhood", "bedrooms", "property_type"]),
            ("num", "passthrough", ["occupancy_rate", "rating", "review_count", "price_tier"]),
        ]
    )

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    X_train_t = preprocessor.fit_transform(X_train)
    X_test_t = preprocessor.transform(X_test)

    model = XGBRegressor(
        n_estimators=200,
        max_depth=6,
        learning_rate=0.08,
        subsample=0.85,
        colsample_bytree=0.85,
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X_train_t, y_train)

    preds = model.predict(X_test_t)
    metrics = {
        "model": "XGBoost",
        "task": "price_regression",
        "mae_ksh": int(round(mean_absolute_error(y_test, preds))),
        "r2": round(r2_score(y_test, preds), 3),
        "train_rows": len(X_train),
        "test_rows": len(X_test),
    }
    print(f"  XGBoost MAE: Ksh {metrics['mae_ksh']:,}  R2: {metrics['r2']}")
    return model, preprocessor, metrics


def predict_price(
    model: XGBRegressor,
    preprocessor: ColumnTransformer,
    neighborhood: str,
    bedrooms: str = "2 BR",
    occupancy: float = 0.7,
    price_tier: int = 3,
) -> int:
    row = pd.DataFrame([{
        "neighborhood": neighborhood,
        "bedrooms": bedrooms,
        "property_type": "Entire Home",
        "occupancy_rate": occupancy,
        "rating": 4.5,
        "review_count": 25,
        "price_tier": price_tier,
    }])
    pred = model.predict(preprocessor.transform(row))[0]
    return round100(max(3000, pred))


def seasonal_forecast_fallback(hood: pd.DataFrame, days: int) -> pd.DataFrame:
    """Weekly/seasonal fallback when Prophet is not installed."""
    hood = hood.copy()
    hood["date"] = pd.to_datetime(hood["date"])
    hood = hood.sort_values("date")
    hood["dow"] = hood["date"].dt.dayofweek
    hood["month"] = hood["date"].dt.month
    dow_mean = hood.groupby("dow")["occupancy"].mean()
    month_mean = hood.groupby("month")["occupancy"].mean()
    base = hood["occupancy"].tail(90).mean()

    start = pd.Timestamp(date.today())
    rows = []
    for i in range(days):
        d = start + pd.Timedelta(days=i)
        dow_factor = dow_mean.get(d.dayofweek, base) / max(base, 0.01)
        month_factor = month_mean.get(d.month, base) / max(base, 0.01)
        yhat = float(np.clip(base * (0.6 + 0.2 * dow_factor + 0.2 * month_factor), 0.25, 0.98))
        rows.append({"ds": d, "yhat": yhat})
    return pd.DataFrame(rows)


def train_prophet_forecast(ts: pd.DataFrame, neighborhood: str) -> pd.DataFrame | None:
    """Prophet: forecast daily occupancy for one neighborhood."""
    hood = ts[ts["neighborhood"] == neighborhood][["date", "occupancy"]].copy()
    hood = hood.rename(columns={"date": "ds", "occupancy": "y"})
    hood["ds"] = pd.to_datetime(hood["ds"])
    hood = hood.sort_values("ds").drop_duplicates("ds")

    if len(hood) < 60:
        return None

    if not HAS_PROPHET:
        return seasonal_forecast_fallback(
            ts[ts["neighborhood"] == neighborhood][["date", "occupancy"]],
            FORECAST_DAYS,
        )

    m = Prophet(
        yearly_seasonality=True,
        weekly_seasonality=True,
        daily_seasonality=False,
        seasonality_mode="multiplicative",
    )
    m.fit(hood)

    future = m.make_future_dataframe(periods=FORECAST_DAYS)
    forecast = m.predict(future)
    return forecast[["ds", "yhat"]].tail(FORECAST_DAYS).copy()


def main() -> None:
    print("Pumzika ML pipeline")
    print("=" * 40)

    pricing_path = TRAINING / "listings-pricing.csv"
    occupancy_path = TRAINING / "occupancy-daily.csv"

    if not pricing_path.exists() or not occupancy_path.exists():
        raise FileNotFoundError(
            "Training CSVs not found. Run: npm run export:training"
        )

    pricing_df = pd.read_csv(pricing_path)
    occupancy_df = pd.read_csv(occupancy_path)
    events = load_events()
    neighborhoods = sorted(occupancy_df["neighborhood"].unique())

    # Tier lookup for price predictions
    tier_map = (
        pricing_df.groupby("neighborhood")["price_tier"].median().astype(int).to_dict()
    )

    print("\nCh.1 - XGBoost pricing model")
    xgb_model, preprocessor, pricing_metrics = train_pricing_model(pricing_df)

    print("\nCh.2 - Prophet occupancy forecast (30 days)")
    start = date.today()
    forecast_out: dict[str, list] = {}
    prophet_metrics: dict[str, dict] = {}

    for nid in neighborhoods:
        fc = train_prophet_forecast(occupancy_df, nid)
        rows = []
        base_occ = float(
            occupancy_df[occupancy_df["neighborhood"] == nid]["occupancy"].tail(30).mean()
        )

        for i in range(FORECAST_DAYS):
            d = start + timedelta(days=i)
            date_str = d.isoformat()

            if fc is not None and i < len(fc):
                occ = float(np.clip(fc.iloc[i]["yhat"], 0.25, 0.98))
            else:
                # Fallback: last 30-day mean with weekend bump
                dow = d.weekday()
                weekend = 0.06 if dow >= 4 else -0.03
                occ = float(np.clip(base_occ + weekend, 0.25, 0.98))

            event = next(
                (
                    e for e in events
                    if e["date"] == date_str
                    and ("all" in e["neighborhoods"] or nid in e["neighborhoods"])
                ),
                None,
            )
            if event:
                occ = float(np.clip(occ * (0.7 + event["demandMultiplier"] * 0.3), 0.25, 0.98))

            price = predict_price(
                xgb_model,
                preprocessor,
                nid,
                bedrooms="2 BR",
                occupancy=occ,
                price_tier=tier_map.get(nid, 3),
            )

            rows.append({
                "date": date_str,
                "occupancy": round(occ, 2),
                "recommendedPrice": price,
                "demandLevel": occ_level(occ),
                "event": {"name": event["name"], "type": event["type"]} if event else None,
            })

        forecast_out[nid] = rows
        prophet_metrics[nid] = {
            "prophet_used": HAS_PROPHET and fc is not None,
            "fallback_used": not HAS_PROPHET,
            "history_days": int(len(occupancy_df[occupancy_df["neighborhood"] == nid])),
        }
        status = "Prophet" if HAS_PROPHET and fc is not None else "seasonal fallback"
        print(f"  {nid}: {status} -> avg occ {np.mean([r['occupancy'] for r in rows]):.0%}")

    # Write dashboard JSON
    forecast_path = DATA / "forecast.json"
    forecast_path.write_text(json.dumps(forecast_out, indent=2), encoding="utf-8")

    metrics = {
        "trainedAt": date.today().isoformat(),
        "pricing": pricing_metrics,
        "forecasting": {
            "model": "Facebook Prophet",
            "horizonDays": FORECAST_DAYS,
            "neighborhoods": len(neighborhoods),
            "perNeighborhood": prophet_metrics,
        },
        "outputs": {
            "forecast.json": str(forecast_path.relative_to(ROOT)),
        },
    }
    (DATA / "model-metrics.json").write_text(json.dumps(metrics, indent=2), encoding="utf-8")

    print(f"\nExported {forecast_path}")
    print("Metrics -> src/data/model-metrics.json")
    print("Dashboard will read forecast.json on next build.")


if __name__ == "__main__":
    main()
