# Problem & Solution

## The problem

Nairobi's short-term rental market is growing quickly. Platforms like Airbnb, Booking.com, and local alternatives are active across Kilimani, Westlands, Karen, and beyond. Yet most hosts still operate blind.

### Who feels the pain?

Independent hosts managing **1–5 properties** in Nairobi who:

- Set one flat nightly rate and rarely change it
- Don't track neighborhood comps or occupancy trends
- Miss demand spikes around holidays, conferences, and events
- Have no single place to see market intelligence

### Specific pain points

| Problem | What happens |
|---|---|
| **Guesswork pricing** | Host charges Ksh 7,000 every night while similar 2BR units in Kilimani book at Ksh 12,000 on busy weekends |
| **No demand visibility** | Madaraka Day, Nairobi Marathon, or a tech conference fills the area — host finds out when it's too late |
| **No neighborhood context** | A studio in South C and a 3BR in Karen have completely different demand curves but get priced the same way |
| **Fragmented data** | Listings on Airbnb, bookings in WhatsApp, comps checked manually — no unified view |
| **Revenue left on the table** | Industry estimates suggest dynamic pricing can increase STR revenue **10–30%** vs flat rates |

### The cost of inaction

```
Busy weekend (Marathon week)     →  Host charges Ksh 7,000  →  Could charge Ksh 14,000
Slow Tuesday mid-month         →  Host charges Ksh 7,000  →  Should drop to Ksh 5,500 to fill
Holiday long weekend           →  Host finds out day-of   →  Calendar already full at wrong price
```

<p align="center">
  <img src="assets/problem-solution.svg" alt="Problem vs Solution" width="100%" />
</p>

---

## The solution — Pumzika

**Pumzika** (Swahili: *rest*) is a Smart Host Dashboard that gives Nairobi hosts Bloomberg-style pricing intelligence — without needing a data science team.

### Three questions answered in 60 seconds

1. **What should I charge tonight?** → ML-recommended price with confidence score
2. **What does the next 30 days look like?** → Heat-mapped demand calendar per neighborhood
3. **How do I compare?** → Side-by-side comps + Kenya market map + voice AI

### Core capabilities

| Feature | Route | Technology |
|---|---|---|
| Tonight's optimal price | `/dashboard` | XGBoost regression |
| 30-day demand forecast | `/dashboard` | Facebook Prophet |
| Neighborhood comps table | `/dashboard` | Real listing data (CSV pipeline) |
| Kenya market map | `/map` | Mapbox + deck.gl + GeoJSON |
| Voice pricing assistant | `/ask` | Claude API + Web Speech API |

### How it's different

| Traditional approach | Pumzika approach |
|---|---|
| Host guesses price | XGBoost trained on 48k+ listings predicts optimal rate |
| Spreadsheet calendar | Prophet forecasts 30-day occupancy per neighborhood |
| Manual comp research | Automated comps table, 12 listings per area |
| Google Maps for location | Drill-down Kenya map: country → county → neighborhood |
| Call a friend for advice | Voice AI with full property + market context |

### Design philosophy

- **Offline ML, online dashboard** — models train once in Python, export JSON, dashboard reads baked predictions. Fast, deployable, no API latency.
- **Built for Nairobi** — 15 neighborhoods, Kenyan Shillings, local events (Madaraka Day, Nairobi Marathon, Koroga Festival).
- **Demo-ready** — works without API keys in mock mode; full experience with Mapbox + Claude keys.

---

## Target users

| User | Use case |
|---|---|
| **Independent host** | 1–2 listings in Kilimani, wants to stop under-pricing weekends |
| **Property manager** | 5–10 units across Nairobi, needs neighborhood-level demand view |
| **Hackathon judge** | Wants to see ML pipeline + live dashboard + voice demo |
| **Dataset contributor** | Provides Nairobi listing CSVs to improve model accuracy |

---

## Success metrics

A successful Pumzika session looks like this:

1. Host completes 60-second onboarding (property name, neighborhood, bedrooms, current price)
2. Dashboard shows recommended price **Ksh 12,400** vs their **Ksh 7,000** (+77%)
3. Calendar highlights Madaraka Day and Nairobi Marathon as peak demand
4. Comps table shows 12 similar listings priced Ksh 9,000–Ksh 15,000
5. Host asks voice AI *"Should I lower my price this weekend?"* and gets a spoken, data-backed answer

---

<p align="center"><a href="./README.md">← Documentation index</a> · <a href="./02-setup-guide.md">Setup Guide →</a></p>
