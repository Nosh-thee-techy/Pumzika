# Architecture

How Pumzika is structured — from raw CSVs to the dashboard UI.

<p align="center">
  <img src="assets/ml-pipeline.svg" alt="ML Pipeline" width="100%" />
</p>

---

## System overview

Pumzika has **three layers**:

```
┌─────────────────────────────────────────────────────────┐
│  LAYER 1 — DATA                                         │
│  Raw CSVs · Seed JSON · Events · GeoJSON                │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────┐
│  LAYER 2 — PROCESSING (offline)                         │
│  build-datasets.mjs · export-training-data.mjs          │
│  train_models.py (XGBoost + Prophet)                    │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────┐
│  LAYER 3 — APPLICATION (browser)                        │
│  React dashboard · Map · Voice AI · Pricing engines     │
└─────────────────────────────────────────────────────────┘
```

---

## Data flow diagram

```
Data/AB_NYC_2019.csv ──────┬──► build-datasets.mjs ──► listings.json
                           │                         neighborhoods.json
Data/hotel_bookings.csv ───┤                         county-market.json
                           │                         data-sources.json
                           │
                           └──► export-training-data.mjs
                                      │
                                      ▼
                                listings-pricing.csv ──► XGBoost
                                occupancy-daily.csv  ──► Prophet
                                      │
                                      ▼
                                forecast.json ──────────► Dashboard
                                model-metrics.json
```

---

## Repository structure

```
Pumzika/
├── Data/                          # Source + training data
│   ├── AB_NYC_2019.csv            # ~49k Airbnb listings
│   ├── hotel_bookings.csv         # ~119k hotel bookings
│   └── training/                  # Generated ML training CSVs
│       ├── listings-pricing.csv
│       ├── occupancy-daily.csv
│       └── dataset-manifest.json
│
├── docs/                          # Documentation (you are here)
├── notebooks/
│   ├── pumzika_ml.ipynb           # Submission notebook
│   └── train_models.py            # Training script
│
├── public/
│   └── geo/
│       └── kenya-counties.geojson # 47 county boundaries
│
├── scripts/
│   ├── build-datasets.mjs         # CSV → app JSON
│   ├── export-training-data.mjs   # CSV → training CSVs
│   └── csv-utils.mjs              # CSV parser
│
├── src/
│   ├── components/
│   │   ├── dashboard/             # PriceTicker, DemandCalendar, Comps…
│   │   ├── layout/                # Sidebar, TopBar, MobileNav
│   │   ├── map/                   # KenyaMap.jsx
│   │   ├── onboarding/            # PropertyForm.jsx
│   │   └── voice/                 # VoiceAgent.jsx
│   ├── context/
│   │   └── PropertyContext.jsx    # Global host state
│   ├── data/                      # Generated JSON (git-tracked)
│   ├── hooks/                     # usePricing, useForecast, useVoiceAgent
│   ├── pages/                     # Dashboard, Map, Ask
│   └── utils/
│       ├── dataService.js         # JSON data access layer
│       ├── priceEngine.js         # Client pricing logic
│       └── forecastEngine.js      # Calendar + demand levels
│
├── .env.example
├── package.json
├── requirements-ml.txt
└── vite.config.js
```

---

## Application architecture

### Routing

```
/              → PropertyForm (onboarding)
/dashboard     → DashboardPage (protected)
/map           → MapPage (protected)
/ask           → AskPage (protected)
```

`ProtectedRoute` redirects to `/` if no property profile exists in context.

### State management

All host state lives in **`PropertyContext`**:

| State | Source | Persists? |
|---|---|---|
| `property` | Onboarding form | Yes — `localStorage` key `pumzika_property` |
| `settings` | Dashboard controls | No — session only |
| `neighborhood` | Derived from property | Computed via `enrichNeighborhood()` |
| `recommendedPrice` | `priceEngine.js` | Computed |
| `forecast` | `forecastEngine.js` | Computed from `forecast.json` |
| `comps` | `listings.json` | Computed |

No Redux or external state library — React Context + `useMemo` only.

### Component hierarchy

```
App
└── PropertyProvider
    └── BrowserRouter
        ├── PropertyForm (/)
        └── AppLayout (protected routes)
            ├── Sidebar
            ├── Main content (DashboardPage | MapPage | AskPage)
            └── MobileNav
```

---

## Key design decisions

| Decision | Rationale |
|---|---|
| **Offline ML, baked JSON** | Dashboard deploys as static site. No Python server needed in production. |
| **NYC proxy data** | Real Nairobi STR data unavailable at build time. Rank-matched by price tier. |
| **Single data access layer** | All components import from `dataService.js` — one place to swap data sources. |
| **Graceful degradation** | Map, voice, and forecast all have fallbacks when API keys or ML output missing. |
| **localStorage for property** | No backend auth needed for hackathon demo. Host profile survives refresh. |

---

## Technology stack

### Frontend

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Build | Vite 8 |
| Styling | Tailwind CSS v4 + custom CSS variables |
| Charts | Recharts |
| Map | Mapbox GL + deck.gl + react-map-gl |
| Icons | Lucide React |
| Animation | Framer Motion |
| Routing | React Router v7 |

### Data & ML

| Layer | Technology |
|---|---|
| Pricing model | XGBoost (XGBRegressor) |
| Forecast model | Facebook Prophet |
| ML runtime | Python 3.10+ |
| Preprocessing | scikit-learn (OneHotEncoder, ColumnTransformer) |
| Data processing | Node.js scripts (CSV parse + JSON export) |

### AI

| Layer | Technology |
|---|---|
| Voice input | Web Speech API |
| Voice output | Speech Synthesis API |
| Intelligence | Anthropic Claude (optional) |

---

## External dependencies

| Service | Used for | Required? |
|---|---|---|
| **Mapbox** | Map tiles + geocoding | Yes for map |
| **Anthropic** | Voice AI answers | No — mock fallback |
| **Google Fonts** | Instrument Serif + Inter | Loaded from CDN |

---

## What is NOT in the architecture

These were intentionally excluded:

| Excluded | Why |
|---|---|
| Backend API server | Static JSON + client-side engines sufficient for demo |
| Database | All data in JSON files |
| Live model inference | Models train offline; predictions baked into JSON |
| User authentication | Single-host demo via localStorage |
| Real-time data sync | Data refreshed by re-running build scripts |

---

<p align="center"><a href="./02-setup-guide.md">← Setup Guide</a> · <a href="./04-dataset-guide.md">Dataset Guide →</a></p>
