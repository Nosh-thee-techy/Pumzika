# Dataset Guide

Everything the **dataset person** needs to know — what data to collect, how to format it, and how it feeds the ML models.

---

## Your two deliverables

The ML pipeline needs exactly **two datasets**:

| # | Dataset | Powers | Model |
|---|---|---|---|
| 1 | **Historical listings** | Price + occupancy outcomes | XGBoost (Ch.1 Pricing) |
| 2 | **Daily booking history** | Occupancy over time per neighborhood | Prophet (Ch.2 Forecasting) |

Everything else in the dashboard is derived from these.

---

## Deliverable 1 — Listings pricing CSV

### Purpose

Train XGBoost to predict: *given a listing's neighborhood, bedrooms, and occupancy — what should the nightly price be?*

### Required columns

| Column | Type | Example | Notes |
|---|---|---|---|
| `listing_id` | string | `pum-001` | Unique identifier |
| `neighborhood` | string | `kilimani` | Must match seed IDs (see list below) |
| `bedrooms` | string | `2 BR` | Studio · 1 BR · 2 BR · 3 BR · 4+ BR |
| `price_ksh` | integer | `9800` | Nightly rate in Kenyan Shillings |
| `occupancy_rate` | float | `0.72` | 0.0–1.0 (booked nights / available nights) |

### Optional columns (improve model accuracy)

| Column | Type | Example |
|---|---|---|
| `property_type` | string | `Entire Home` |
| `rating` | float | `4.8` |
| `review_count` | integer | `34` |
| `price_tier` | integer | `4` |
| `last_review` | date | `2025-03-15` |
| `amenities` | string | `WiFi,Pool,Generator` |

### Example rows

```csv
listing_id,neighborhood,bedrooms,property_type,price_ksh,occupancy_rate,rating,review_count
pum-001,kilimani,2 BR,Entire Home,9800,0.72,4.8,34
pum-002,westlands,1 BR,Apartment,7500,0.65,4.5,12
pum-003,karen,3 BR,Entire Home,18500,0.58,4.9,67
pum-004,south-c,Studio,Private Room,4200,0.81,4.2,8
```

### Minimum viable size

- **500+ listings** across all neighborhoods
- At least **20 listings per neighborhood** for reliable comps
- Current proxy dataset: **48,211 rows** (from NYC Airbnb mapped to Nairobi)

### How occupancy is calculated

If you have booking data:

```
occupancy_rate = booked_nights / total_available_nights
```

If you only have Airbnb-style availability:

```
occupancy_rate = 1 - (availability_365 / 365)
```

---

## Deliverable 2 — Daily occupancy CSV

### Purpose

Train Prophet to forecast: *for each neighborhood, what will daily occupancy look like for the next 30 days?*

### Required columns

| Column | Type | Example | Notes |
|---|---|---|---|
| `date` | YYYY-MM-DD | `2025-06-15` | Calendar date |
| `neighborhood` | string | `kilimani` | Must match seed IDs |
| `occupancy` | float | `0.68` | 0.0–1.0 daily occupancy |

### Optional columns

| Column | Type | Example |
|---|---|---|
| `booking_count` | integer | `42` |
| `adr_ksh` | integer | `9200` |

### Example rows

```csv
date,neighborhood,occupancy,booking_count
2025-01-01,kilimani,0.68,42
2025-01-01,westlands,0.74,58
2025-01-01,karen,0.61,23
2025-01-02,kilimani,0.55,31
2025-01-02,westlands,0.62,44
```

### Minimum viable size

- **6 months** of daily data minimum
- **12+ months** strongly preferred for Prophet seasonality
- All **15 neighborhoods** represented
- Current proxy dataset: **793 days × 15 neighborhoods = 11,895 rows**

### How to derive daily occupancy

If you have individual booking records:

```sql
-- Pseudocode
SELECT date, neighborhood,
       COUNT(booked_listings) / COUNT(total_listings) AS occupancy
FROM daily_snapshot
GROUP BY date, neighborhood
```

If you have monthly aggregates only, interpolate daily values using day-of-week patterns from hotel booking data.

---

## Valid neighborhood IDs

All CSV `neighborhood` values must use these exact slugs:

| ID | Name | Price Tier |
|---|---|---|
| `westlands` | Westlands | 5 |
| `kilimani` | Kilimani | 4 |
| `karen` | Karen | 5 |
| `lavington` | Lavington | 4 |
| `langata` | Langata | 2 |
| `gigiri` | Gigiri | 5 |
| `parklands` | Parklands | 3 |
| `upperhill` | Upperhill | 3 |
| `kileleshwa` | Kileleshwa | 4 |
| `runda` | Runda | 5 |
| `muthaiga` | Muthaiga | 5 |
| `south-b` | South B | 2 |
| `south-c` | South C | 1 |
| `ngong-road` | Ngong Road | 3 |
| `thika-road` | Thika Road | 1 |

Defined in `src/data/neighborhoods.seed.json`.

---

## Current proxy data sources

Until real Nairobi data is available:

| Source file | Records | Used for | Limitation |
|---|---|---|---|
| `Data/AB_NYC_2019.csv` | 48,895 | Listings, prices, occupancy | NYC locations, not Nairobi |
| `Data/hotel_bookings.csv` | 119,390 | Booking dates, seasonality | European hotels, no neighborhood |

### NYC → Nairobi mapping method

1. NYC neighbourhoods sorted by median nightly price (descending)
2. Nairobi neighborhoods sorted by `priceTier` (descending)
3. Rank-matched 1:1 (NYC #1 → Westlands, NYC #2 → Karen, etc.)
4. Prices scaled: `kshPrice = (usdPrice / nycMed) × nairobiMed`
5. Conversion rate: ~78 KSH per USD with tier adjustment

---

## How to add your data

### Option A — Replace proxy entirely

1. Place your CSV in `Data/nairobi_listings.csv`
2. Update `scripts/export-training-data.mjs` to read your file
3. Re-run pipeline:

```bash
npm run build:ml
npm run build
```

### Option B — Drop in training CSVs directly

1. Replace `Data/training/listings-pricing.csv` with your file
2. Replace `Data/training/occupancy-daily.csv` with your file
3. Train:

```bash
npm run train:models
```

### Option C — Append to existing data

Merge your rows into the existing training CSVs, keeping the same column headers.

---

## Data quality checklist

Before handing off datasets, verify:

- [ ] All `neighborhood` values match the 15 valid IDs above
- [ ] All `price_ksh` values are positive integers (no decimals)
- [ ] All `occupancy_rate` values are between 0.0 and 1.0
- [ ] No duplicate `listing_id` values
- [ ] Daily occupancy CSV has no date gaps longer than 7 days
- [ ] Date format is `YYYY-MM-DD` (ISO 8601)
- [ ] `bedrooms` uses standard labels: Studio, 1 BR, 2 BR, 3 BR, 4+ BR
- [ ] CSV is UTF-8 encoded, comma-separated

---

## Pipeline commands (dataset guy workflow)

```bash
# 1. Place raw CSVs in Data/
# 2. Export training format
npm run export:training

# 3. Verify output
cat Data/training/dataset-manifest.json

# 4. Hand off to ML person (or run yourself)
npm run train:models

# 5. Verify model output
cat src/data/model-metrics.json
```

---

## Where to find real Nairobi data

| Source | What you get | Access |
|---|---|---|
| **Inside Airbnb** | Nairobi listing snapshots | http://insideairbnb.com/get-the-data.html |
| **Host exports** | Your own booking history | Airbnb host dashboard → export |
| **Booking.com partner data** | Hotel booking patterns | Partner API (if available) |
| **Pumzika platform data** | Direct host bookings | Platform API (future) |
| **Manual collection** | Scrape or survey local hosts | Time-intensive |

---

## Manifest file

After export, check `Data/training/dataset-manifest.json` for row counts, column schemas, and date ranges. This is the handoff document between dataset person and ML person.

---

<p align="center"><a href="./03-architecture.md">← Architecture</a> · <a href="./05-machine-learning.md">Machine Learning →</a></p>
