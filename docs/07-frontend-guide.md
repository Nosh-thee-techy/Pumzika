# Frontend Guide

How the React dashboard is built — components, pages, hooks, and design system.

<p align="center">
  <img src="assets/screens-overview.svg" alt="Product screens" width="100%" />
</p>

---

## Pages

| Route | File | Description |
|---|---|---|
| `/` | `pages/DashboardPage.jsx` via `PropertyForm` | Onboarding — 60-second property setup |
| `/dashboard` | `pages/DashboardPage.jsx` | Main pricing dashboard |
| `/map` | `pages/MapPage.jsx` | Kenya drill-down map |
| `/ask` | `pages/AskPage.jsx` | Voice AI agent |

---

## Dashboard components

Located in `src/components/dashboard/`:

| Component | Purpose | Key data |
|---|---|---|
| **PriceTicker** | Hero price display with confidence chip and range bar | `recommendedPrice`, `confidence` |
| **PriceReason** | Left-border signal rows explaining the price | `priceReasons[]` |
| **QuickStats** | 4-card grid: avg price, occupancy, listings, demand score | `neighborhood` stats |
| **DemandCalendar** | 30-day heat-mapped occupancy grid | `forecast[]` |
| **NeighborhoodComps** | Sortable data table of similar listings | `comps[]` |
| **OccupancyChart** | Recharts line chart of 30-day occupancy trend | `forecast[]` |
| **ActionPrompts** | Urgent/week/plan recommendation cards | `actionPrompts[]` |

### Dashboard layout

```
┌──────────┬──────────────────────────────────────┐
│          │  TopBar (greeting + neighborhood)     │
│ Sidebar  ├──────────────────────────────────────┤
│  220px   │  PriceTicker (hero)                   │
│  dark    │  PriceReason (signals)                │
│          │  QuickStats (4 cards)                 │
│          │  DemandCalendar (heatmap)             │
│          │  NeighborhoodComps (table)            │
│          │  OccupancyChart (line chart)          │
│          │  QuickSettings (guardrails)           │
└──────────┴──────────────────────────────────────┘
```

---

## Layout components

Located in `src/components/layout/`:

| Component | Purpose |
|---|---|
| **Sidebar** | 220px dark nav — Dashboard, Map, Ask links + market stats |
| **TopBar** | Greeting, date, neighborhood dropdown, mic link |
| **MobileNav** | Bottom tab bar for mobile (hidden on lg+) |

---

## Map component

**File:** `src/components/map/KenyaMap.jsx`

### Drill-down levels

| Level | View | Technology |
|---|---|---|
| 1 | Kenya — 47 counties | GeoJsonLayer |
| 2 | County — boundary + columns | ColumnLayer |
| 3 | Area — neighborhood detail panel | Custom overlay |

### Data layer toggles

- **Demand** — column height = demand score
- **Supply** — column height = active listings
- **Price** — column height = avg nightly price

### Dependencies

- `VITE_MAPBOX_TOKEN` in `.env`
- `public/geo/kenya-counties.geojson`
- `src/data/kenya-counties-index.json`

---

## Voice AI component

**File:** `src/components/voice/VoiceAgent.jsx`  
**Hook:** `src/hooks/useVoiceAgent.js`

### Modes

| Mode | Trigger | Behavior |
|---|---|---|
| **Claude** | `VITE_ANTHROPIC_API_KEY` set | Real AI with property context |
| **Mock** | No API key | Keyword-matched template responses |

### Mock keyword triggers

| User says | Response theme |
|---|---|
| "lower", "weekend" | Hold price — event demand surge |
| "busy" | Next high-demand window dates |
| "amenit*" | Amenity ROI (generator, parking) |
| "compare", "similar" | Comp positioning vs neighborhood avg |

---

## Onboarding

**File:** `src/components/onboarding/PropertyForm.jsx`

Split panel: dark brand left, white form right.

### Collected fields

| Field | Type | Example |
|---|---|---|
| Property name | text | Kilimani Cozy Studio |
| Neighborhood | dropdown | Kilimani |
| Bedrooms | dropdown | 2 BR |
| Property type | dropdown | Entire Home |
| Current price | number | 7000 |
| Amenities | multi-select | WiFi, Parking, Generator |

Saved via `saveProperty()` → `localStorage` key `pumzika_property`.

---

## Hooks

| Hook | File | Returns |
|---|---|---|
| `useProperty()` | `context/PropertyContext.jsx` | All global state |
| `usePricing()` | `hooks/usePricing.js` | Price, change %, reasons, confidence |
| `useForecast()` | `hooks/useForecast.js` | Forecast array, action prompts, cell styles |
| `useVoiceAgent()` | `hooks/useVoiceAgent.js` | Speech input/output, AI responses |

---

## Design system

Defined in `src/index.css`:

### Colors

| Token | Hex | Usage |
|---|---|---|
| `--bg-canvas` | `#F7F6F3` | Page background |
| `--bg-surface` | `#FFFFFF` | Cards |
| `--bg-inverse` | `#141410` | Sidebar, dark panels |
| `--accent` | `#C8922A` | Gold — CTAs, active states |
| `--positive` | `#1A7F5A` | Confidence chip, up indicators |
| `--negative` | `#C0392B` | Down indicators |
| `--demand-1` → `--demand-5` | Blue → gold → black | Calendar heat map |

### Typography

| Token | Font | Usage |
|---|---|---|
| `--font-display` | Instrument Serif | Price numbers, headlines |
| `--font-ui` | Inter | Body text, labels, UI |

Loaded from Google Fonts in `index.html`.

### Component classes

| Class | Purpose |
|---|---|
| `.card` | White surface with subtle shadow and border |
| `.text-headline` | Section headings |
| `.text-meta` | Secondary descriptive text |
| `.text-label` | Form labels and small caps |

---

## Data flow in the UI

```
PropertyContext
    │
    ├── neighborhood ──► QuickStats, TopBar, Map
    ├── recommendedPrice ──► PriceTicker, PriceReason
    ├── forecast ──► DemandCalendar, OccupancyChart, ActionPrompts
    ├── comps ──► NeighborhoodComps
    ├── confidence ──► PriceTicker
    └── settings ──► QuickSettings (min/max guardrails)
```

All computed values derive from `PropertyContext` — components do not fetch data directly.

---

## Adding a new dashboard section

1. Create component in `src/components/dashboard/`
2. Import `useProperty()` or specific hooks
3. Add to `DashboardPage.jsx` inside the scroll container
4. Follow existing `.card` styling pattern

---

<p align="center"><a href="./06-models-vs-engines.md">← Models vs Engines</a> · <a href="./08-deployment.md">Deployment →</a></p>
