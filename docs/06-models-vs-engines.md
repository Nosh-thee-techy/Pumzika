# Models vs Engines

A clear explanation of what is a **machine learning model** vs a **dashboard engine** in Pumzika — and how they work together.

---

## The short answer

| | ML Models (Python) | Dashboard Engines (JavaScript) |
|---|---|---|
| **What** | XGBoost + Prophet | priceEngine.js + forecastEngine.js |
| **Where** | `notebooks/train_models.py` | `src/utils/` |
| **When** | Runs offline, once | Runs in browser, every page load |
| **Input** | Training CSVs | Baked JSON + host property |
| **Output** | `forecast.json` | UI display values |
| **Deployed?** | No — not as a live API | Yes — bundled in the React app |

---

## Visual flow

```
TRAINING TIME (offline, Python)          RUNTIME (browser, JavaScript)
─────────────────────────────           ────────────────────────────────

listings-pricing.csv                    forecast.json ──┐
        │                                               │
        ▼                                               ▼
   XGBoost Model                              priceEngine.js
   (predicts price)                           (reads recommendedPrice,
        │                                      applies amenity adjustments)
        │                                               │
        ▼                                               ▼
occupancy-daily.csv                         PriceTicker component
        │                                   "Ksh 12,400 tonight"
        ▼
  Prophet Model
  (predicts occupancy)
        │
        ▼
  forecast.json ──────────────────────────► forecastEngine.js
  (occupancy + price                         (builds 30-day calendar,
   per neighborhood per day)                 adds reasons + actions)
                                                    │
                                                    ▼
                                            DemandCalendar component
                                            [heat-mapped grid]
```

---

## ML Models (Python — offline)

### What they are

Trained statistical models that learn patterns from historical data.

### XGBoost — Pricing Model

- **File:** `notebooks/train_models.py` → `train_pricing_model()`
- **Learns:** Relationship between listing features and nightly price
- **Produces:** A price prediction given neighborhood + bedrooms + occupancy
- **Saved as:** Predictions in `forecast.json` (model object not persisted)

### Prophet — Forecasting Model

- **File:** `notebooks/train_models.py` → `train_prophet_forecast()`
- **Learns:** Daily occupancy patterns (weekly + yearly seasonality)
- **Produces:** 30-day forward occupancy forecast per neighborhood
- **Saved as:** Occupancy values in `forecast.json`

### Key point

Models run **once** when you execute `npm run train:models`. They are **not deployed** as a live service. Their output (JSON) is what gets deployed.

---

## Dashboard Engines (JavaScript — runtime)

### What they are

Client-side logic that reads baked JSON predictions and adapts them to the host's specific property.

### priceEngine.js

**Purpose:** Calculate tonight's recommended price for *this specific host*.

**Logic flow:**

```
1. Look up forecast.json baseline for today's date + neighborhood
   └── Found? Use ML recommendedPrice
   └── Not found? Fall back to comp average + day/event multipliers

2. Apply amenity multipliers:
   Pool × 1.12 · Generator × 1.08 · AC × 1.05 · Gym × 1.04

3. Apply bedroom multiplier:
   Studio × 0.7 · 1BR × 0.85 · 2BR × 1.0 · 3BR × 1.3

4. Apply min/max guardrails from host settings

5. Return final price
```

**Key functions:**

| Function | Returns |
|---|---|
| `calculateOptimalPrice(property, neighborhood, date)` | Recommended KSH price |
| `getPriceChangePercent(recommended, current)` | % change vs host's current price |
| `getPriceReasons(property, neighborhood, price, date)` | Why this price (events, comps, occupancy) |
| `getConfidence(property, neighborhood)` | 0–95 confidence score |

### forecastEngine.js

**Purpose:** Build the 30-day demand calendar with human-readable insights.

**Logic flow:**

```
1. For each of next 30 days:
   └── Read forecast.json baseline (occupancy + price from ML)
   └── If no baseline: estimate from neighborhood avg + weekend/event boost
   └── Attach event info from events.json
   └── Generate reason text and action recommendation

2. Map occupancy → demandLevel (cold/low/medium/high/peak)

3. Generate action prompts (price up alerts, discount suggestions)
```

**Key functions:**

| Function | Returns |
|---|---|
| `generateForecast(property, neighborhood, startDate, days)` | 30-day array with occupancy, price, events |
| `getDemandCellStyle(level)` | CSS colors for calendar heat map |
| `getActionPrompts(forecast)` | Top 3 actionable recommendations |
| `getForecastSummary(forecast)` | One-line summary for voice AI context |

### dataService.js

**Purpose:** Single access layer for all JSON data files.

Not an engine — a data loader. All engines and components import from here.

---

## Who does what?

| Task | Handled by |
|---|---|
| Learn price patterns from 48k listings | **XGBoost model** (Python) |
| Predict next 30 days occupancy | **Prophet model** (Python) |
| Export predictions to JSON | **train_models.py** (Python) |
| Read JSON predictions | **dataService.js** (JavaScript) |
| Adjust price for host's amenities | **priceEngine.js** (JavaScript) |
| Build calendar with reasons/actions | **forecastEngine.js** (JavaScript) |
| Display price on screen | **PriceTicker.jsx** (React) |
| Display calendar heat map | **DemandCalendar.jsx** (React) |

---

## Why this split?

| Benefit | Explanation |
|---|---|
| **Fast dashboard** | No Python server needed. Static JSON loads instantly. |
| **Easy deployment** | Deploy to Vercel/Netlify as static site. |
| **Hackathon friendly** | Train models in notebook, submit notebook + dashboard separately. |
| **Personalization** | Engines adjust ML baselines per host (amenities, bedroom count, guardrails). |
| **Graceful fallback** | If ML hasn't run, engines use rule-based estimates so dashboard still works. |

---

## Common confusion

### "Is the priceEngine a model?"

No. It does not train on data or learn patterns. It reads ML output and applies business rules (amenity multipliers, min/max prices).

### "Is forecast.json the model?"

No. It's the model's **output** — baked predictions. The model itself lives in Python memory during training and is discarded.

### "Can the dashboard retrain models?"

No. Retraining requires running `npm run train:models` locally, then committing the updated JSON or rebuilding for deployment.

### "Is Prophet running live?"

No. Prophet ran once during training. The dashboard reads the 30-day forecast it produced.

---

<p align="center"><a href="./05-machine-learning.md">← Machine Learning</a> · <a href="./07-frontend-guide.md">Frontend Guide →</a></p>
