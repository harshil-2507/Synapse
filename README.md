# Synapse — AI Revenue Forecasting for SMEs

> Built for NatWest Code for Purpose 2026

Synapse gives SME finance teams a 12-week revenue forecast with 
confidence intervals, anomaly alerts, and plain-English AI explanations 
— in under 60 seconds, no data science expertise required.

---

## The Problem

Small and medium businesses are flying blind.

They make inventory decisions, hiring plans, and loan applications 
based on gut feel — because professional forecasting tools cost 
thousands, require data scientists, and return outputs no non-technical 
person can interpret.

**The result:** SMEs over-order stock, under-prepare for demand drops, 
and miss early warning signs hidden in their own sales data.

NatWest serves over 1 million SME customers. Every one of them has 
historical transaction data. None of them have a forecasting team.

---

## The Solution

Upload a weekly sales or revenue CSV. In under 60 seconds, Synapse 
returns:

- A **12-week forecast** with upper/lower confidence bands — not just 
  a single number, but an honest range
- A **naive baseline comparison** that proves the model isn't 
  overfitting
- **Anomaly detection** that flags unusual spikes and dips with 
  Z-scores and AI explanations in plain English
- A **scenario simulator** — "what happens to my revenue if growth 
  drops 15%?"
- A **model confidence score** — so the business owner knows when to 
  trust the forecast and when to be cautious
- **Hold-out validation** — the model proves its own accuracy against 
  real held-out data before you act on it

Everything is explainable. Everything is readable by a non-technical 
business owner or bank relationship manager.

---

## Who This Is For

| User | How they use Synapse |
|---|---|
| SME owner | Upload monthly sales CSV, get 12-week revenue outlook before applying for a NatWest business loan |
| NatWest relationship manager | Run a client's data through Synapse in a meeting to demonstrate cash flow risk |
| Finance analyst | Validate Prophet forecast accuracy vs naive baseline before presenting to board |
| Operations manager | Detect anomalies in weekly demand data before they become stockouts |

---

## How It Maps to the Problem Statement

| Judging Criterion | How Synapse Delivers |
|---|---|
| Predict likely values for future periods | Prophet model generates weekly yhat values for 4–26 weeks ahead |
| Show a range of outcomes, not just a single number | Shaded confidence band (yhat_lower / yhat_upper) visible on every chart |
| Compare to a simple baseline to avoid overfitting | Rolling mean naive baseline rendered alongside Prophet on the same chart |
| Detect early warning signs | Z-score anomaly detection flags spikes and dips with severity and date |
| Explanations short enough for non-experts | Groq Llama 3.3 generates 2–3 sentence plain-English summaries per forecast and per anomaly |

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Forecasting | Facebook Prophet | Handles seasonality, missing data, and trend shifts — ideal for SME sales patterns |
| Baseline | Rolling mean (naive) | Industry-standard benchmark; guards against overfitting |
| Anomaly Detection | Z-score on rolling window | Interpretable, fast, no black box |
| AI Explainer | Groq API — Llama 3.3 70B | Free tier, sub-second latency, plain-English output |
| Backend | FastAPI + Uvicorn | Lightweight, async, production-ready |
| Frontend | Next.js 14 + Tailwind CSS | Fast, responsive, modern |
| Charts | Recharts | Composable, customisable confidence band support |
| Language | Python 3.10, TypeScript | |

---

## Install and Run

### Prerequisites
- Python 3.10+
- Node.js 18+
- Free Groq API key from https://console.groq.com

### 1. Clone
```bash
git clone https://github.com/harshil-2507/Synapse
cd Synapse
```

### 2. Backend
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Add your GROQ_API_KEY to .env
uvicorn main:app --reload
```

Download the demo dataset from 
https://www.kaggle.com/datasets/yasserh/walmart-dataset  
Rename to `walmart.csv` and place at `data/walmart.csv`

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000 — the demo loads automatically.

---

## Using Synapse

**Demo mode:** Loads Walmart weekly retail sales data automatically  
**Your data:** Click "Ingest Dataset (CSV)" — any CSV with a date 
column and a numeric value column  

**Forecast tab** — Prophet prediction with confidence bands and naive 
baseline  
**Anomalies tab** — All flagged spikes/dips, click any for AI 
explanation  
**Scenario tab** — Adjust growth rate ±30%, compare against baseline  
**Validate tab** — Hold-out accuracy proof: Prophet MAE vs Baseline MAE  

---

## API Reference
GET  /api/default?periods=8        # Demo forecast
POST /api/upload?periods=8         # Upload CSV forecast
GET  /api/scenario?growth_rate=10  # Scenario (demo data)
POST /api/scenario?growth_rate=10  # Scenario (uploaded CSV)
GET  /api/anomaly/explain          # AI explanation for anomaly
GET  /api/validate?periods=8       # Hold-out validation (demo)
POST /api/validate?periods=8       # Hold-out validation (uploaded)
GET  /health                       # Health check


---

## Architecture
Browser (Next.js 14)
│
├── page.tsx              — Dashboard orchestrator
├── ForecastChart.tsx     — Recharts confidence band chart
├── AnomalyList.tsx       — Anomaly feed + AI explanation panel
├── ScenarioPanel.tsx     — Growth simulator + comparison chart
├── SummaryCard.tsx       — Groq AI summary with animated reveal
├── ConfidenceCard.tsx    — Model confidence gauge + progress bar
└── ValidationPanel.tsx   — Hold-out accuracy comparison
│
▼ HTTP (FastAPI)
│
├── main.py           — Route definitions
├── forecaster.py     — Prophet model + naive baseline + confidence scoring
├── anomaly.py        — Z-score detection engine
├── scenarios.py      — What-if growth simulation
├── explainer.py      — Groq API integration
└── data_loader.py    — CSV parsing + weekly resampling


---

## Limitations

- Groq free tier rate limits may delay AI summaries by 1–2 seconds; 
  forecast data always returns immediately
- Prophet needs at least 2 full seasonal cycles for best accuracy; 
  sparse data produces wider confidence bands
- CSV auto-detects date/value columns by keyword — very unusual column 
  names may need renaming to `date` and `value`

---

## Future Roadmap

- **NatWest integration** — Direct feed from NatWest business account 
  transaction data, no CSV upload needed
- **Multi-series** — Compare multiple product lines or store locations 
  on one chart
- **Threshold alerts** — Email/SMS when anomaly Z-score exceeds 
  configurable limit
- **Loan readiness score** — Combine forecast trend + confidence score 
  into a single SME creditworthiness signal for NatWest relationship 
  managers

---

## Team

Built for NatWest Code for Purpose 2026 — 2-person team, 
built overnight.

