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

## Demo without API keys

The app runs fully without keys. Voice uses contextual mock answers. The map shows a fallback heat grid until you add `VITE_MAPBOX_TOKEN`.

## Stack

React 18 + Vite, Tailwind CSS v4, Framer Motion, Recharts, deck.gl + react-map-gl, Lucide icons.

## Hackathon pitch tip

Demo the voice agent live on `/ask` — it speaks answers aloud even in mock mode.
