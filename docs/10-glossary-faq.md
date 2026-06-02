# Glossary & FAQ

Terms, definitions, and answers to common questions.

---

## Glossary

| Term | Definition |
|---|---|
| **ADR** | Average Daily Rate — mean nightly price across bookings |
| **Comp** | Comparable listing — similar property in the same neighborhood used for price benchmarking |
| **Demand level** | Classification of occupancy: cold · low · medium · high · peak |
| **Demand score** | 0–100 neighborhood market heat index |
| **Engine** | Client-side JavaScript logic (priceEngine, forecastEngine) — not an ML model |
| **Forecast baseline** | Single day's ML prediction from `forecast.json` |
| **Guardrails** | Host-set min/max price limits that constrain recommendations |
| **Occupancy rate** | Ratio of booked nights to available nights (0.0–1.0) |
| **Offline ML** | Models train locally in Python; predictions export as JSON |
| **Price tier** | 1–5 ranking of neighborhood premium level (South C = 1, Karen = 5) |
| **Prophet** | Facebook's time series forecasting library |
| **Proxy data** | NYC Airbnb data mapped to Nairobi until real data available |
| **Rank matching** | Mapping NYC neighbourhoods to Nairobi areas by price tier order |
| **STR** | Short-term rental |
| **Supply gap** | Estimated unmet demand — booked listings minus available supply |
| **XGBoost** | Gradient boosting ML library used for price regression |

---

## FAQ

### General

**Q: What is Pumzika?**  
A: A Smart Host Dashboard that tells Nairobi short-term rental hosts what to charge tonight and what demand looks like for the next 30 days.

**Q: Who is it for?**  
A: Independent hosts managing 1–5 properties in Nairobi who currently price manually.

**Q: Does it work outside Nairobi?**  
A: The map covers all 47 Kenya counties, but detailed neighborhood data is only available for Nairobi's 15 areas. Other counties use estimated stats.

---

### Models & Data

**Q: Is the model deployed as a live API?**  
A: No. Models train offline in Python. Predictions are baked into `forecast.json`. The dashboard reads JSON — no live inference.

**Q: What's the difference between a model and an engine?**  
A: Models (XGBoost, Prophet) learn from data in Python. Engines (priceEngine.js, forecastEngine.js) read model output and adjust it for the host's specific property in the browser. See [Models vs Engines](./06-models-vs-engines.md).

**Q: Why NYC data instead of Nairobi data?**  
A: Real Nairobi STR datasets weren't available at build time. NYC Airbnb listings are rank-matched to Nairobi neighborhoods by price tier as a proxy. See [Dataset Guide](./04-dataset-guide.md) for how to swap in real data.

**Q: How accurate is the pricing model?**  
A: Current proxy data: MAE Ksh 2,940, R² 0.607. Expected to improve significantly with real Nairobi listings.

**Q: Is Prophet actually running?**  
A: Check `src/data/model-metrics.json`. If `"fallback_used": true`, Prophet isn't installed and a seasonal fallback is used. Install with `pip install prophet` and re-run `npm run train:models`.

**Q: Can I retrain with my own data?**  
A: Yes. Provide two CSVs (listings + daily occupancy), replace files in `Data/training/`, run `npm run train:models`.

---

### Dashboard

**Q: Do I need API keys?**  
A: Mapbox token is required for the map. Anthropic key is optional — voice AI works in mock mode without it.

**Q: Where is my property data stored?**  
A: In browser `localStorage` under key `pumzika_property`. No server, no database. Clear it in browser dev tools to reset.

**Q: How is tonight's price calculated?**  
A: ML baseline from `forecast.json` → amenity multipliers → bedroom multiplier → min/max guardrails. See [Models vs Engines](./06-models-vs-engines.md).

**Q: What events are tracked?**  
A: Madaraka Day, Nairobi Marathon, Koroga Festival, Tech Conference, Father's Day, end-of-month payday surges. Defined in `src/data/events.json`.

**Q: Can I add more neighborhoods?**  
A: Yes. Add entries to `src/data/neighborhoods.seed.json`, re-run `npm run build:data` and `npm run build:ml`.

---

### Setup & Deployment

**Q: What Node.js version do I need?**  
A: 18 or higher.

**Q: What Python version for ML?**  
A: 3.10–3.12 recommended. 3.14 works but Prophet may fall back to seasonal mode.

**Q: How do I deploy?**  
A: Build with `npm run build`, deploy `dist/` folder. See [Deployment Guide](./08-deployment.md).

**Q: Why is my map grey/blank?**  
A: Missing or invalid `VITE_MAPBOX_TOKEN`. Add to `.env` and restart dev server.

**Q: Why doesn't voice AI give smart answers?**  
A: Without `VITE_ANTHROPIC_API_KEY`, mock mode uses keyword templates. Add the key for Claude-powered responses.

**Q: `build:data` overwrote my ML forecast!**  
A: This shouldn't happen if `model-metrics.json` exists. If it did, re-run `npm run train:models`.

---

### Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Map grey/blank | No Mapbox token | Add `VITE_MAPBOX_TOKEN` to `.env` |
| `ModuleNotFoundError: pandas` | Python deps not installed | `pip install -r requirements-ml.txt` |
| Training CSVs not found | Export not run | `npm run export:training` |
| Dashboard shows old price | Stale forecast.json | `npm run train:models` |
| Onboarding loop | Corrupt localStorage | Clear `pumzika_property` in dev tools |
| Prophet fallback warning | Prophet not installed | `pip install prophet` |
| Build fails on Windows | Path issues | Use forward slashes, run from project root |
| Voice doesn't speak | Browser TTS unsupported | Use Chrome/Edge, or read text response |

---

## Nairobi neighborhoods reference

| ID | Name | Tier | Demand badge |
|---|---|---|---|
| westlands | Westlands | 5 | hot |
| kilimani | Kilimani | 4 | hot |
| karen | Karen | 5 | rising |
| lavington | Lavington | 4 | rising |
| langata | Langata | 2 | slow |
| gigiri | Gigiri | 5 | rising |
| parklands | Parklands | 3 | hot |
| upperhill | Upperhill | 3 | rising |
| kileleshwa | Kileleshwa | 4 | hot |
| runda | Runda | 5 | slow |
| muthaiga | Muthaiga | 5 | slow |
| south-b | South B | 2 | rising |
| south-c | South C | 1 | rising |
| ngong-road | Ngong Road | 3 | rising |
| thika-road | Thika Road | 1 | slow |

---

## Known limitations

| Limitation | Impact | Future fix |
|---|---|---|
| NYC proxy data | Prices/occupancy are estimates, not real Nairobi | Swap in Inside Airbnb Nairobi data |
| Prophet fallback | Forecast uses seasonal means, not full Prophet | Install Prophet on Python 3.10–3.12 |
| No model persistence | `.pkl` files not saved | Add `joblib.dump()` if live inference needed |
| Client-side API key | Anthropic key visible in bundle | Add backend proxy for production |
| Non-Nairobi counties | Estimated stats only | Expand dataset to other cities |
| Static events | Manually curated, not data-driven | Feed events from booking spike detection |
| No auth | Single host via localStorage | Add Supabase auth for multi-user |

---

<p align="center"><a href="./09-submission-checklist.md">← Submission Checklist</a> · <a href="./README.md">Documentation index</a></p>
