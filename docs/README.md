# Pumzika Documentation

Complete documentation for the **Pumzika Smart Host Dashboard** — pricing intelligence for Nairobi short-term rental hosts.

<p align="center">
  <img src="assets/hero-banner.svg" alt="Pumzika" width="100%" />
</p>

---

## Start here

| I want to… | Read this |
|---|---|
| Understand the problem and what we built | [Problem & Solution](./01-problem-and-solution.md) |
| Set up and run the project locally | [Setup Guide](./02-setup-guide.md) |
| Understand how data flows through the system | [Architecture](./03-architecture.md) |
| Work on datasets (dataset guy role) | [Dataset Guide](./04-dataset-guide.md) |
| Train XGBoost + Prophet models | [Machine Learning](./05-machine-learning.md) |
| Understand models vs dashboard engines | [Models vs Engines](./06-models-vs-engines.md) |
| Work on the React frontend | [Frontend Guide](./07-frontend-guide.md) |
| Deploy to production | [Deployment Guide](./08-deployment.md) |
| Prepare hackathon submission | [Submission Checklist](./09-submission-checklist.md) |
| Look up terms or fix issues | [Glossary & FAQ](./10-glossary-faq.md) |

---

## Full reference

**[DOCUMENTATION.md](./DOCUMENTATION.md)** — single-file technical reference covering everything above in one place.

---

## Quick facts

| Item | Detail |
|---|---|
| **Product** | Smart Host Dashboard for Nairobi STR hosts |
| **Repo** | https://github.com/Nosh-thee-techy/Pumzika |
| **Stack** | React 19 · Vite · Tailwind · deck.gl · Mapbox · XGBoost · Prophet |
| **ML approach** | Train offline → export JSON → dashboard reads baked predictions |
| **Neighborhoods** | 15 Nairobi areas with full data |
| **Counties** | 47 Kenya counties on the map |
| **Models** | XGBoost (pricing) · Facebook Prophet (forecasting) |
| **Current XGBoost metrics** | MAE Ksh 2,940 · R² 0.607 |

---

## Documentation map

```
docs/
├── README.md                    ← You are here
├── DOCUMENTATION.md             ← Full single-file reference
├── 01-problem-and-solution.md
├── 02-setup-guide.md
├── 03-architecture.md
├── 04-dataset-guide.md
├── 05-machine-learning.md
├── 06-models-vs-engines.md
├── 07-frontend-guide.md
├── 08-deployment.md
├── 09-submission-checklist.md
├── 10-glossary-faq.md
└── assets/                      ← Diagrams and visuals
    ├── hero-banner.svg
    ├── problem-solution.svg
    ├── ml-pipeline.svg
    └── screens-overview.svg
```

---

<p align="center"><a href="../README.md">← Back to project README</a></p>
