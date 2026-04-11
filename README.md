# ForecastIQ — AI Predictive Forecasting

ForecastIQ turns any business time series into honest, explainable forecasts — built for non-technical decision makers. Upload a CSV of historical data and instantly receive a forecast with uncertainty bands, anomaly detection with AI explanations, and a scenario simulator to test what-if growth assumptions.

**Intended users:** Business analysts, operations teams, and product managers who need to look ahead without relying on data science expertise.

---

## Features

- **Forecasting with confidence bands** — Prophet model generates weekly predictions with upper/lower uncertainty ranges (not just a single number)
- **Naive baseline comparison** — Rolling mean baseline rendered alongside Prophet forecast to guard against over-fitting
- **Anomaly detection** — Z-score detection flags unexpected spikes and dips with severity scores and visual markers
- **AI plain-English explanations** — Groq (Llama 3.3) generates 2–3 sentence summaries for both overall forecasts and individual anomalies, readable by non-experts
- **Scenario simulator** — Adjust growth rate (±30%) and toggle outlier removal to compare forecasts side-by-side
- **CSV upload** — Works on any time series CSV with a date column and a numeric value column (auto-detects columns, resamples to weekly)
- **Pre-loaded Walmart demo** — Retail sales dataset loads on startup for immediate judge evaluation

---

## Tech Stack

| Layer | Technology |
|---|---|
| Forecasting | Facebook Prophet |
| Baseline | Rolling mean (naive) |
| Anomaly Detection | Z-score on rolling window |
| AI Explainer | Groq API — Llama 3.3 70B (free tier) |
| Backend | FastAPI + Uvicorn |
| Frontend | Next.js 14 + Tailwind CSS |
| Charts | Recharts |
| Language | Python 3.10, TypeScript |

---

## Install and Run

### Prerequisites
- Python 3.10+
- Node.js 18+
- A free Groq API key from https://console.groq.com

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd forecastiq
```

### 2. Backend setup
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env and paste your GROQ_API_KEY
```

Download the Walmart dataset from https://www.kaggle.com/datasets/yasserh/walmart-dataset
Rename to `walmart.csv` and place it at `forecastiq/data/walmart.csv`

Start the backend:
```bash
uvicorn main:app --reload
```

### 3. Frontend setup
```bash
cd ../frontend
npm install
npm run dev
```

Open http://localhost:3000 — the Walmart demo loads automatically.

---

## Usage

**Load demo:** Click "Load Walmart Demo" (auto-loads on start)  
**Upload your data:** Click "Upload CSV" — any CSV with a date column and numeric value column  
**View forecast:** Forecast tab shows Prophet prediction + confidence bands + baseline  
**Detect anomalies:** Anomalies tab lists all flagged spikes/dips — click any to get an AI explanation  
**Run scenarios:** Scenario tab → adjust growth rate slider → click "Run Scenario"

### API endpoints

GET  /api/default?periods=8          # Walmart demo forecast
POST /api/upload?periods=8           # Upload CSV forecast
GET  /api/scenario?growth_rate=10    # Scenario with default data
POST /api/scenario?growth_rate=10    # Scenario with uploaded CSV
GET  /api/anomaly/explain            # AI explanation for anomaly
GET  /health                         # Health check


---

## Architecture

Browser (Next.js)
│
├── ForecastChart.tsx   — Recharts confidence band visualisation
├── AnomalyList.tsx     — Anomaly feed + AI explanation panel
├── ScenarioPanel.tsx   — Slider UI + side-by-side chart
├── SummaryCard.tsx     — Groq AI summary display
└── StatsRow.tsx        — Key metrics overview
│
▼
FastAPI Backend
│
├── forecaster.py       — Prophet model + naive baseline
├── anomaly.py          — Z-score detection
├── scenarios.py        — What-if growth simulation
├── explainer.py        — Groq API calls
└── data_loader.py      — CSV parsing + weekly resampling



---

## Limitations

- Groq free tier rate limits may delay AI summaries briefly; forecast data always returns immediately
- Prophet requires at least 2 full seasonal cycles for optimal accuracy; sparse data produces wider confidence bands
- CSV upload auto-detects date/value columns by keyword matching — very unusual column names may need manual renaming to `date` and `value`

---

## Future Improvements

- Email/Slack alerts when anomalies exceed a configurable threshold
- Multi-series forecasting (compare multiple products or regions)
- Model confidence score displayed per forecast based on data quality