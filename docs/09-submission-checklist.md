# Submission Checklist

Everything needed for hackathon submission — dashboard, notebook, documentation, and demo.

---

## Deliverables

| # | Deliverable | Location | Status |
|---|---|---|---|
| 1 | **Smart Host Dashboard** | GitHub repo + live URL | Code complete |
| 2 | **Python ML Notebook** | `notebooks/pumzika_ml.ipynb` | Ready |
| 3 | **Training data export** | `Data/training/*.csv` | Generated |
| 4 | **Model predictions** | `src/data/forecast.json` | Baked in |
| 5 | **Documentation** | `docs/` folder | Complete |
| 6 | **Live demo URL** | Vercel/Netlify | Pending deployment |

---

## Pre-submission checklist

### Code

- [ ] `npm run build` passes without errors
- [ ] `npm run lint` passes (or only pre-existing warnings)
- [ ] All routes work: `/`, `/dashboard`, `/map`, `/ask`
- [ ] Onboarding saves property and redirects correctly
- [ ] Dashboard shows price, calendar, comps, chart

### ML pipeline

- [ ] `npm run export:training` produces training CSVs
- [ ] `npm run train:models` completes and writes `forecast.json`
- [ ] `src/data/model-metrics.json` shows XGBoost MAE and R²
- [ ] Notebook `pumzika_ml.ipynb` runs end-to-end on clean machine
- [ ] Prophet installed (or fallback documented in metrics)

### Environment

- [ ] `.env.example` has all required variables documented
- [ ] `.env` is gitignored (never committed)
- [ ] Mapbox token works (map renders, not grey)
- [ ] Voice agent responds (Claude or mock mode)

### Documentation

- [ ] README.md has problem, solution, quick start
- [ ] `docs/` folder complete with all guides
- [ ] Architecture diagram present
- [ ] Dataset guide explains required CSV schemas

### Deployment

- [ ] Live URL accessible (Vercel/Netlify)
- [ ] Env vars set on hosting platform
- [ ] All routes work on production URL (SPA routing)
- [ ] Map loads on production

---

## Demo script (5 minutes)

Use this script for live presentation or video recording.

### Minute 1 — The problem

> "Nairobi hosts are leaving money on the table. They charge Ksh 7,000 every night while the market moves between Ksh 5,000 and Ksh 15,000 depending on the day, the event, and the neighborhood."

### Minute 2 — Onboarding + Dashboard

1. Open the live URL
2. Enter: **Kilimani Cozy Studio**, **Kilimani**, **2 BR**, **Ksh 7,000**
3. Point to recommended price: *"The model says Ksh 12,400 tonight — that's +77% vs what they're charging"*
4. Show confidence score and price reasons

### Minute 3 — Forecast calendar

1. Scroll to 30-day demand calendar
2. Point to Madaraka Day spike: *"The model flagged this holiday 4 days out"*
3. Show action prompts: *"Price up Jun 8–9, Nairobi Marathon"*

### Minute 4 — Map + Comps

1. Navigate to `/map`
2. Click Nairobi → Westlands
3. Toggle demand layer
4. Back to dashboard — show comps table: *"12 similar listings, priced Ksh 9,000–15,000"*

### Minute 5 — Voice AI + ML pipeline

1. Navigate to `/ask`
2. Ask: *"Should I lower my price this weekend?"*
3. Show spoken response
4. Explain: *"XGBoost trained on 48k listings, Prophet forecasts 30 days — all baked into JSON, dashboard just reads it"*

---

## What judges will look for

| Criteria | Where to point |
|---|---|
| **Problem understanding** | README problem section, demo script minute 1 |
| **ML model (Ch.1 Pricing)** | `notebooks/pumzika_ml.ipynb`, XGBoost MAE Ksh 2,940 |
| **ML model (Ch.2 Forecast)** | `forecast.json`, Prophet 30-day calendar |
| **Data pipeline** | `Data/training/`, `dataset-manifest.json` |
| **Working dashboard** | Live URL, all 3 routes |
| **Technical depth** | `docs/06-models-vs-engines.md`, architecture diagram |
| **Nairobi relevance** | 15 neighborhoods, KSH pricing, local events |
| **Polish** | Professional UI, voice AI, Kenya map |

---

## Files to highlight in submission

```
Must include:
├── README.md                         # Problem + solution + quick start
├── docs/                             # Full documentation
├── notebooks/pumzika_ml.ipynb        # ML notebook submission
├── src/data/forecast.json            # Model output
├── src/data/model-metrics.json       # Model evaluation
├── Data/training/                    # Training datasets
└── requirements-ml.txt               # Python dependencies

Do NOT include:
├── .env                              # Secrets
├── node_modules/                     # Dependencies
└── dist/                             # Build output (deploy instead)
```

---

## Team role summary (for submission write-up)

| Role | Contribution |
|---|---|
| **Frontend dev** | React dashboard, map, voice UI, design system |
| **Dataset person** | CSV pipeline, training data export, NYC→Nairobi mapping |
| **ML engineer** | XGBoost + Prophet training, notebook, forecast export |
| **Product** | Problem framing, demo script, Nairobi event curation |

---

## Quick commands before submitting

```bash
# Verify everything
npm run build:ml
npm run build
npm run preview

# Push final code
git add .
git commit -m "Final submission — documentation, ML pipeline, dashboard"
git push origin main

# Deploy
vercel --prod
# or connect repo to Netlify
```

---

<p align="center"><a href="./08-deployment.md">← Deployment</a> · <a href="./10-glossary-faq.md">Glossary & FAQ →</a></p>
