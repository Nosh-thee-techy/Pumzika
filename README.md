# Pumzika Smart Host Dashboard

Bloomberg-style pricing intelligence for Nairobi short-term rental hosts.

## Quick start

```bash
npm install
cp .env.example .env
# Add VITE_MAPBOX_TOKEN (required for 3D map) and optionally VITE_ANTHROPIC_API_KEY (voice AI)
npm run dev
```

Open http://localhost:5173 — complete the 60-second onboarding, then explore the dashboard, map, and voice agent.

## Features

- **Tonight's optimal price** — rule-based engine using neighborhood comps, events, amenities, and day-of-week
- **30-day demand calendar** — heat-mapped forecast with action prompts
- **3D Nairobi map** — deck.gl columns colored by demand (Mapbox token required)
- **Ask Pumzika AI** — Web Speech API + Claude (or smart mock responses without API key)

## Data pipeline (real CSVs)

Source files live in `../Data/` at the repo root:

| File | Records | Powers |
|------|---------|--------|
| `AB_NYC_2019.csv` | ~49k Airbnb listings | Comps, neighborhood prices, occupancy, ratings |
| `hotel_bookings.csv` | ~119k hotel bookings | 30-day forecast seasonality, weekend demand |

NYC neighbourhoods are **rank-matched** to Nairobi areas by price tier, then prices are scaled to KSH. Hotel booking patterns drive the demand calendar.

After editing CSVs or seed data:

```bash
npm run build:data
```

Metadata written to `src/data/data-sources.json`.

## Kenya map (drill-down)

Uses official county boundary GeoJSON (`public/geo/kenya-counties.geojson`):

1. **Kenya** — all 47 counties colored by demand score
2. **County** — click a county to zoom in; Nairobi shows 15 neighborhood columns
3. **Area** — click a neighborhood for listing-level stats

Requires `VITE_MAPBOX_TOKEN` in `.env`.

## Stack

React 18 + Vite, Tailwind CSS v4, Framer Motion, Recharts, deck.gl + react-map-gl, Lucide icons.

## Hackathon pitch tip

Demo the voice agent live on `/ask` — it speaks answers aloud even in mock mode.
