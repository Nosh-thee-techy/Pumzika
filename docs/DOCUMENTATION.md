# Pumzika — Complete Technical Documentation

> Master reference for the **Pumzika Smart Rental Platform** — a two-sided intelligence platform for Nairobi short-term rentals.  
> For focused guides, see the **[Documentation Index](./README.md)**.

<p align="center">
  <img src="assets/hero-banner.svg" alt="Pumzika" width="100%" />
</p>

---

## Documentation index

| Guide | Contents |
|---|---|
| [Problem & Solution](./01-problem-and-solution.md) | Who it's for, pain points, value proposition |
| [Setup Guide](./02-setup-guide.md) | Install, env vars, run locally |
| [Architecture](./03-architecture.md) | System design, repo structure, tech stack |
| [Dataset Guide](./04-dataset-guide.md) | CSV schemas, data collection, pipeline |
| [Machine Learning](./05-machine-learning.md) | XGBoost, Prophet, training, metrics |
| [Models vs Engines](./06-models-vs-engines.md) | Python models vs JavaScript engines |
| [Frontend Guide](./07-frontend-guide.md) | Components, pages, hooks, design system |
| [Deployment](./08-deployment.md) | Vercel, Netlify, GitHub Pages |
| [Submission Checklist](./09-submission-checklist.md) | Hackathon deliverables, demo script |
| [Glossary & FAQ](./10-glossary-faq.md) | Terms, troubleshooting, limitations |

---

## 1. Overview

**Pumzika** is a two-sided rental intelligence platform:

| Role | Core questions |
|---|---|
| **Host** | What should I charge tonight? When will guests arrive? How do I compare? |
| **Guest** | Is this listing fairly priced? When is the best time to book? What do guests really say? |

One shared data engine powers both experiences. The same demand data, neighborhood intelligence, and ML predictions that tell a host *"price up this Friday"* tell a guest *"book before Friday — prices are rising."*

| Layer | Technology | Runs |
|---|---|---|
| **Web app** | React 19 + Vite | Browser |
| **ML models** | XGBoost + Prophet (Python) | Offline, once |
| **Voice AI** | Claude API + Web Speech API | Browser (optional API key) |

Models export predictions as JSON. The dashboard reads baked predictions — no live model inference at runtime.

---

## 2. Problem & Solution

### For hosts

Nairobi BnB hosts set prices by guessing. They miss long weekends, leave midweek nights empty, and don't know when competitors undercut them. Every large hotel has a revenue manager — a Kilimani host never had one until Pumzika.

### For guests

Hundreds of listings, no way to know if a price is fair, what a neighborhood feels like, or whether to book now or wait. They scroll, guess, and hope.

### The solution

**One platform. Two roles. One shared intelligence engine.**

<p align="center">
  <img src="assets/problem-solution.svg" alt="Problem vs Solution" width="90%" />
</p>

Full details: [Problem & Solution](./01-problem-and-solution.md)

---

## 3. Platform architecture

```
                    ONE PLATFORM
                         │
                         ▼
              Landing Page (role selection)
                    /         \
                   /           \
                  ▼             ▼
            🏠 HOST           🧳 GUEST
                  │             │
                  ▼             ▼
           Host Onboarding   Guest Onboarding
                  │             │
                  ▼             ▼
           Host Dashboard    Guest Dashboard
                  │             │
          ┌───────┴───────┐     │
          ▼               ▼     ▼
      Market Map      Ask AI   Explore Map → Listing Insights
          │                       │
          └───────────┬───────────┘
                      ▼
         Shared JSON data + ML engines
    (forecast.json, listings, neighborhoods, events)
```

### Data flow

<p align="center">
  <img src="assets/ml-pipeline.svg" alt="ML Pipeline" width="90%" />
</p>

```
Raw CSVs → build scripts → JSON data → ML training → forecast.json → React app (host + guest)
```

Full details: [Architecture](./03-architecture.md)

---

## 4. Quick start

```bash
git clone https://github.com/Nosh-thee-techy/Pumzika.git
cd Pumzika
npm install
cp .env.example .env
# Add VITE_MAPBOX_TOKEN (required for map)
npm run dev
```

Open **http://localhost:5173** → choose **I'm a host** or **I'm a guest**.

ML pipeline (optional):

```bash
pip install -r requirements-ml.txt
npm run build:ml
```

Full details: [Setup Guide](./02-setup-guide.md)

---

## 5. Environment variables

| Variable | Required | Description |
|---|---|---|
| `VITE_MAPBOX_TOKEN` | Yes (map) | Mapbox public token for Kenya map tiles |
| `VITE_ANTHROPIC_API_KEY` | No | Claude API for voice AI (mock mode without it) |

Never commit `.env` — it is gitignored.

---

## 6. Routes

### Landing

| Route | Page | Description |
|---|---|---|
| `/` | `Landing.jsx` | Split-screen role selection (host vs guest) |

### Host routes

| Route | Page | Description |
|---|---|---|
| `/host/onboarding` | `HostOnboarding.jsx` | Property setup (60 seconds) |
| `/host/dashboard` | `HostDashboard.jsx` | Price hero, money left behind, calendar, comps |
| `/host/map` | `HostMap.jsx` | Kenya market map with demand columns |
| `/host/ask` | `HostAskAI.jsx` | Voice + text pricing advisor |

### Guest routes

| Route | Page | Description |
|---|---|---|
| `/guest/onboarding` | `GuestOnboarding.jsx` | Dates, budget, vibe preferences |
| `/guest/dashboard` | `GuestDashboard.jsx` | Price fairness, booking calendar, neighborhood matches |
| `/guest/explore` | `NeighborhoodExplorer.jsx` | Map with guest-focused overlays |
| `/guest/listing/:id` | `ListingInsights.jsx` | Deep listing intelligence |

### Legacy redirects

| Old route | Redirects to |
|---|---|
| `/dashboard` | `/host/dashboard` |
| `/map` | `/host/map` |
| `/ask` | `/host/ask` |

---

## 7. Host experience

### Dashboard sections (in order)

1. **Money Left Behind** — Ksh amount left on table by underpricing (count-up animation)
2. **Price Hero** — Recommended tonight price + confidence + signals
3. **Quick Stats** — Demand level, comps, occupancy, rating
4. **30-Day Demand Calendar** — Heat-mapped forecast with action prompts
5. **Comparable Listings** — Data table of similar properties
6. **Occupancy Chart** — 30-day Recharts area chart
7. **Pricing Controls** — Min/max guardrails, autopilot toggle

### Host-only components

| Component | File |
|---|---|
| MoneyLeftBehind | `components/host/MoneyLeftBehind.jsx` |
| PriceTicker | `components/dashboard/PriceTicker.jsx` |
| PriceReason | `components/dashboard/PriceReason.jsx` |
| NeighborhoodComps | `components/dashboard/NeighborhoodComps.jsx` |
| ActionPrompts | `components/dashboard/ActionPrompts.jsx` |

### Host accent

Gold (`--host-accent: #C8922A`) — applied via `data-role="host"` on pages.

---

## 8. Guest experience

### Dashboard sections

1. **Price Fairness Snapshot** — Market price, fairness scale, verdict chip
2. **Best Time to Book Calendar** — Same demand data, guest labels ("Book now" / "Great price")
3. **Quick Stats** — Best value area, cheapest night, listings in budget, avg rating
4. **Neighborhood Match Cards** — Horizontal scroll, % match scores
5. **Listings in Budget** — Tap through to listing insights

### Listing insights (`/guest/listing/:id`)

| Panel | Content |
|---|---|
| Price History | 30-day trend line chart |
| Review Summary | Loved themes + mentioned themes + sentiment bar |
| Booking Signal | "Book now" vs "Good time to book" urgency card |
| Value Score | 0–100 vs similar listings |

### Guest-only components

| Component | File |
|---|---|
| PriceFairness | `components/guest/PriceFairness.jsx` |
| NeighborhoodCards | `components/guest/NeighborhoodCards.jsx` |
| GuestQuickStats | `components/guest/GuestQuickStats.jsx` |

### Guest accent

Teal (`--guest-accent: #0D7B6E`) — applied via `data-role="guest"` on pages.

---

## 9. Shared components & engines

### Shared UI

| Component | File | Notes |
|---|---|---|
| Sidebar | `components/shared/Sidebar.jsx` | Role-aware nav + accent colors |
| MobileNav | `components/shared/MobileNav.jsx` | Bottom tabs per role |
| TopBar | `components/layout/TopBar.jsx` | Greeting + mic link |
| DemandCalendar | `components/dashboard/DemandCalendar.jsx` | `role="host"` or `role="guest"` prop |
| KenyaMap | `components/map/KenyaMap.jsx` | `role="host"` or `role="guest"` prop |
| VoiceAgent | `components/voice/VoiceAgent.jsx` | Host pricing advisor |

### JavaScript engines

| Engine | File | Used by |
|---|---|---|
| **priceEngine** | `utils/priceEngine.js` | Host — optimal price, money left behind, confidence |
| **forecastEngine** | `utils/forecastEngine.js` | Both — 30-day calendar, demand levels, action prompts |
| **sentimentEngine** | `utils/sentimentEngine.js` | Guest — fairness verdict, match scores, listing insights |
| **dataService** | `utils/dataService.js` | Both — single JSON access layer |

### State management

**`RoleContext.jsx`** stores:

| State | Key | Persists? |
|---|---|---|
| Selected role | `pumzika_role` | localStorage |
| Host property | `pumzika_property` | localStorage |
| Guest preferences | `pumzika_guest_prefs` | localStorage |
| Pricing settings | session only | No |

Hooks: `useRole()`, `useProperty()` (alias), `usePricing()`, `useForecast()`, `useSentiment()`, `useVoiceAgent()`.

Full details: [Models vs Engines](./06-models-vs-engines.md)

---

## 10. Design system

### Philosophy

Warm authority — Bloomberg Terminal redesigned by a Nairobi fintech studio. Data-first, restrained aesthetics.

### Role-based accents

| Role | Accent | Light | Dark |
|---|---|---|---|
| Host | `#C8922A` (gold) | `#FDF3E0` | `#9B6E1A` |
| Guest | `#0D7B6E` (teal) | `#E0F5F2` | `#095C52` |

Applied via CSS:

```html
<div data-role="host">  <!-- --accent resolves to gold -->
<div data-role="guest"> <!-- --accent resolves to teal -->
```

### Typography

| Token | Font | Usage |
|---|---|---|
| `--font-display` | Instrument Serif | Hero numbers, headlines only |
| `--font-ui` | Geist / Inter | Everything else |

### Shared palette

| Token | Value |
|---|---|
| Canvas | `#F7F6F3` |
| Surface | `#FFFFFF` |
| Inverse | `#141410` |
| Positive | `#1A7F5A` |
| Negative | `#C0392B` |
| Demand 1–5 | Blue → gold → black (host peak) / teal (guest peak) |

Full details: [Frontend Guide](./07-frontend-guide.md)

---

## 11. Data pipeline

### Source CSVs (`Data/`)

| File | Records | Powers |
|---|---|---|
| `AB_NYC_2019.csv` | ~49k | Listings, prices, occupancy (mapped to Nairobi) |
| `hotel_bookings.csv` | ~119k | Booking dates, seasonality |

### Generated JSON (`src/data/`)

| File | Description |
|---|---|
| `listings.json` | 180 listings (12 per neighborhood) |
| `neighborhoods.json` | 15 Nairobi areas with stats + vibes |
| `county-market.json` | 47 Kenya counties |
| `forecast.json` | 30-day ML predictions per neighborhood |
| `model-metrics.json` | XGBoost MAE, R², Prophet status |
| `events.json` | Curated demand events (Madaraka Day, Marathon, etc.) |
| `data-sources.json` | Pipeline metadata |

### Commands

```bash
npm run build:data          # CSV → app JSON
npm run export:training     # CSV → training CSVs
npm run train:models        # Train XGBoost + Prophet → forecast.json
npm run build:ml            # Export + train in one step
npm run build               # Full production build → dist/
```

Full details: [Dataset Guide](./04-dataset-guide.md)

---

## 12. Machine learning

### Ch.1 — XGBoost Pricing (hosts)

| Item | Value |
|---|---|
| Target | `price_ksh` |
| Features | neighborhood, bedrooms, property_type, occupancy, rating, reviews, tier |
| MAE | Ksh 2,940 |
| R² | 0.607 |
| Training rows | 48,211 |

### Ch.2 — Prophet Forecasting (both roles)

| Item | Value |
|---|---|
| Target | Daily occupancy per neighborhood |
| History | 793 days × 15 neighborhoods |
| Horizon | 30 days forward |
| Host use | Demand calendar + price recommendations |
| Guest use | Best time to book calendar |
| Fallback | Seasonal decomposition if Prophet not installed |

### Output schema (`forecast.json`)

```json
{
  "kilimani": [{
    "date": "2026-06-02",
    "occupancy": 0.63,
    "recommendedPrice": 12400,
    "demandLevel": "medium",
    "event": { "name": "Madaraka Day Weekend", "type": "holiday" }
  }]
}
```

Full details: [Machine Learning](./05-machine-learning.md)

---

## 13. Models vs engines

| | ML Models (Python) | Engines (JavaScript) |
|---|---|---|
| **Files** | `notebooks/train_models.py` | `priceEngine.js`, `forecastEngine.js`, `sentimentEngine.js` |
| **Runs** | Offline, once | Browser, every page load |
| **Output** | `forecast.json` | UI display values |
| **Host** | Price + occupancy predictions | Optimal price, money left behind |
| **Guest** | Same occupancy data | Fairness verdict, match scores, booking signals |
| **Deployed as API?** | No — JSON baked in | Yes — bundled in React app |

Full details: [Models vs Engines](./06-models-vs-engines.md)

---

## 14. Deployment

```bash
npm run build:ml && npm run build
# Deploy dist/ to Vercel, Netlify, or any static host
```

Set `VITE_MAPBOX_TOKEN` on hosting platform **before** build (Vite inlines env vars at build time).

Full details: [Deployment Guide](./08-deployment.md)

---

## 15. Submission deliverables

| # | Deliverable | Location |
|---|---|---|
| 1 | Two-sided web platform | GitHub + live URL |
| 2 | Python ML notebook | `notebooks/pumzika_ml.ipynb` |
| 3 | Training data | `Data/training/` |
| 4 | Documentation | `docs/` |

### Demo flow (5 min)

1. Landing — show two-sided split
2. Host path — money left behind → price recommendation → calendar
3. Guest path — price fairness → neighborhood matches → listing insights
4. Voice AI — ask in English (or Swahili when enabled)
5. ML — explain offline XGBoost + Prophet → JSON pipeline

Full details: [Submission Checklist](./09-submission-checklist.md)

---

## 16. File reference

```
src/
├── App.jsx                         # Router + role-based route guards
├── context/
│   ├── RoleContext.jsx             # Role, host property, guest prefs
│   └── PropertyContext.jsx         # Re-exports RoleContext
├── pages/
│   ├── Landing.jsx                 # Role selection
│   ├── host/                       # HostOnboarding, Dashboard, Map, AskAI
│   └── guest/                      # GuestOnboarding, Dashboard, Explore, ListingInsights
├── components/
│   ├── shared/                     # Sidebar, MobileNav
│   ├── host/                       # MoneyLeftBehind
│   ├── guest/                      # PriceFairness, NeighborhoodCards, GuestQuickStats
│   ├── dashboard/                  # PriceTicker, DemandCalendar, Comps, Chart
│   ├── map/KenyaMap.jsx
│   └── voice/VoiceAgent.jsx
├── hooks/                          # usePricing, useForecast, useSentiment, useVoiceAgent
└── utils/
    ├── dataService.js              # JSON access layer
    ├── priceEngine.js              # Host pricing logic
    ├── forecastEngine.js           # Shared calendar logic
    └── sentimentEngine.js          # Guest fairness + match scores

scripts/build-datasets.mjs          # CSV → app JSON
scripts/export-training-data.mjs    # CSV → training CSVs
notebooks/train_models.py           # XGBoost + Prophet training
notebooks/pumzika_ml.ipynb          # Submission notebook
requirements-ml.txt                 # Python ML dependencies
public/geo/kenya-counties.geojson   # County boundaries
```

---

## 17. Troubleshooting

| Issue | Fix |
|---|---|
| Stuck on landing | Clear `localStorage` keys: `pumzika_role`, `pumzika_property`, `pumzika_guest_prefs` |
| Map blank | Add `VITE_MAPBOX_TOKEN` to `.env`, restart dev server |
| Wrong role dashboard | Go to `/` and re-select role |
| No ML data | Run `npm run train:models` |
| Prophet fallback | `pip install prophet` then re-run training |
| Voice mock only | Add `VITE_ANTHROPIC_API_KEY` to `.env` |
| Training CSVs missing | Run `npm run export:training` |

Full details: [Glossary & FAQ](./10-glossary-faq.md)

---

<p align="center">
  <a href="./README.md">Documentation Index</a> · <a href="../README.md">Project README</a>
</p>
