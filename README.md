# Synapse — Geopolitical Risk & AI Revenue Forecasting for SMEs

>  Built for NatWest Code for Purpose 2026 · Hackathon Project

Synapse gives SME finance teams and NatWest relationship managers a firm-level geopolitical risk score, a lag-adjusted stressed revenue forecast, and plain-English AI explanations — in under 60 seconds.

---

##  The Core Problem

Financial markets are increasingly shaped by geopolitical events — conflicts, political instability, trade disruptions. But the way this actually hurts a company is not random. It travels through a very specific path:

**A geopolitical shock hits a region → companies with revenue exposure in that region absorb the damage → their stock and revenue drops → the bank holding their debt or equity faces hidden risk**

The problem is that *nobody is currently measuring this transmission path in real time at the firm level.*

**What most models do wrong:**
- Predict stock prices using past stock prices only (pure technical analysis)
- Treat geopolitical risk as background noise, not a structured input
- Give a single country-level risk score with no connection to a specific company's exposure

**What banks actually need:**
- *"Company X gets 60% of revenue from the Middle East — how does a conflict intensity spike there affect their loan repayment probability?"*
- *"Our portfolio has 14 companies with significant Russia/Ukraine exposure — what's our aggregate stress scenario?"*
- Evidence-backed, auditable forecasts — not gut feel

This gap is what Synapse fills.

---

##  The Insight Nobody Else Is Using

**Geographic revenue exposure % is the transmission mechanism between a geopolitical event and firm-level financial impact.**

This is the core intellectual contribution of Synapse. If Company A gets 10% of revenue from a conflict zone and Company B gets 60%, they are not equally exposed — standard models treat them identically. Synapse doesn't.

**The formula at the heart of Synapse:**
```
Firm Geopolitical Risk Score = Σ (Region Exposure % × Region Conflict Risk Score)

Stress-Adjusted Forecast = Baseline Forecast × (1 - Firm Risk Score × Sensitivity Factor)
                           applied with a 2-4 week lag
```

---

##  Who Feels This Pain

| User | The Pain | How Synapse Helps |
|---|---|---|
| **NatWest Relationship Manager** | Client applying for a £2M loan gets 55% of revenue from the Middle East. No tool to quantify how a 40% rise in conflict intensity affects revenue. | Runs the client's data through Synapse and quantifies the exact financial risk. |
| **NatWest Portfolio Risk Analyst** | Managing 50+ clients, needs stress tests based on geopolitical escalations — currently done manually in Excel with static quarterly data. | Aggregates firm-level risk scores for real-time stress scenarios across the portfolio. |
| **SME Owner** | Knows geopolitics is affecting their supply chain but cannot quantify it to ask the bank for credit. | Gets a 12-week forecast, a geopolitical exposure score, and stress scenario models as evidence. |

---

##  What Synapse Actually Does — Feature by Feature

### Feature 1 — Revenue Forecast Engine
- Upload a weekly sales CSV → Facebook Prophet generates a 4–26 week forward forecast
- Includes confidence bands (upper/lower bounds), not just a single number
- A naive rolling-mean baseline runs alongside it to prove the model isn't overfitting
- Hold-out validation compares Prophet accuracy vs baseline on real held-out data

### Feature 2 — Anomaly Detection with AI Explanation
- Z-score detection on a rolling window flags unusual spikes and dips
- Each anomaly is timestamped with severity score, direction, and deviation %
- Groq Llama 3.3 generates a plain-English explanation for each anomaly

### Feature 3 — Geographic Revenue Exposure Input
- User enters the company's revenue breakdown by region (e.g. Middle East 45%, Europe 30%)
- This is the transmission bridge between geopolitical data and firm-level impact

### Feature 4 — Weighted Geopolitical Risk Score
- Pulls conflict intensity, political stability, GDP growth, and inflation from the Global Conflict dataset
- Computes a weighted 0–100 firm-level risk score based on revenue exposure percentages

### Feature 5 — Lag-Adjusted Stress Forecast
- Takes the firm's weighted risk score and applies it to their revenue forecast
- Models a 2–4 week lag — geopolitical shocks don't hit revenue instantly
- Renders baseline forecast vs geopolitically stressed forecast — the gap is the bank's hidden risk

### Feature 6 — Scenario Simulator
- Adjust growth rate assumptions (±30%) and outlier removal
- Runs what-if scenarios: *"what if growth drops 10% AND Middle East conflict escalates?"*

### Feature 7 — AI Risk Briefing
- Groq generates a firm-specific 5-sentence risk briefing
- Readable by a non-technical SME owner or relationship manager

### Feature 8 — Model Confidence Score
- 0–100 confidence score derived from data quality, forecast horizon, and anomaly frequency
- Displayed with gauge + label: High / Medium / Low

### Feature 9 — AI Stock Predictor
- Enter any ticker symbol → XGBoost model trained on 6-month price history
- Technical features: daily returns, 5-day & 10-day moving averages
- AI-generated stock insight via Groq with geopolitical risk context

---

##  Architecture & How We Built It

### High-Level Data Flow

```
┌──────────────────────────────────────────────────────────────────────┐
│                         USER INPUT                                   │
│  CSV Upload / Demo Data / Ticker Symbol / Revenue Exposure by Region │
└──────────────────┬───────────────────────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────────────────────────┐
│                    FastAPI Backend (Python)                           │
│                                                                      │
│  ┌─────────────────┐   ┌──────────────────┐   ┌──────────────────┐  │
│  │  data_loader.py  │   │  forecaster.py   │   │   anomaly.py     │  │
│  │  CSV parsing +   │──▶│  Prophet model   │──▶│  Z-score rolling │  │
│  │  auto-detection  │   │  + naive baseline│   │  window detection│  │
│  │  + weekly resamp │   │  + confidence    │   │                  │  │
│  └─────────────────┘   │  + hold-out val  │   └──────────────────┘  │
│                         └──────────────────┘                         │
│  ┌─────────────────┐   ┌──────────────────┐   ┌──────────────────┐  │
│  │  geo_risk.py     │   │  scenarios.py    │   │  explainer.py    │  │
│  │  Conflict dataset│   │  Growth ±30%     │   │  Groq Llama 3.3  │  │
│  │  scoring engine  │   │  + outlier       │   │  Plain-English   │  │
│  │  + weighted firm │   │  removal         │   │  AI summaries    │  │
│  │  risk + stress   │   │                  │   │                  │  │
│  │  forecast + lag  │   └──────────────────┘   └──────────────────┘  │
│  └─────────────────┘                                                 │
│  ┌─────────────────┐                                                 │
│  │  stock_model.py  │                                                │
│  │  yfinance data   │                                                │
│  │  + XGBoost model │                                                │
│  └─────────────────┘                                                 │
│                                                                      │
│  main.py — FastAPI route definitions, CORS, request orchestration    │
└──────────────────┬───────────────────────────────────────────────────┘
                   │ HTTP/JSON
                   ▼
┌──────────────────────────────────────────────────────────────────────┐
│                    Next.js 14 Frontend (TypeScript)                   │
│                                                                      │
│  page.tsx — Main dashboard orchestrator with 4 tabs:                 │
│     Overview    │   Prediction Flows  │   Geo Risk  │   Stocks │
│                                                                      │
│  Built-in Widgets (page.tsx):                                        │
│    • GlobalHeatmap       — 8-region live risk index grid             │
│    • CommoditiesTicker   — Simulated oil/gold/wheat live prices      │
│    • GeopoliticsNewsFeed — AI-curated geopolitical event feed         │
│    • GeoPriceForecast    — SVG chart: base vs risk-adjusted forecast  │
│    • RiskEventSimulator  — Crisis scenario with intensity slider      │
│    • CountryRiskScorecard— Multi-dimension country risk breakdown     │
│    • StockPredictor      — Ticker search + XGBoost + AI insights     │
│                                                                      │
│  Standalone Components (app/components/):                            │
│    • GeoRiskPanel.tsx    — Revenue exposure input + weighted risk     │
│    • ForecastChart.tsx   — Recharts confidence band chart             │
│    • AnomalyList.tsx     — Anomaly feed + AI explanation panel        │
│    • ScenarioPanel.tsx   — Growth simulator + comparison chart        │
│    • SummaryCard.tsx     — Groq AI summary with animated reveal       │
│    • ConfidenceCard.tsx  — Model confidence gauge + progress bar      │
│    • ValidationPanel.tsx — Hold-out accuracy comparison               │
│    • StatsRow.tsx        — Summary statistics display                 │
└──────────────────────────────────────────────────────────────────────┘
```

### Backend Deep Dive — How Each Module Works

#### `data_loader.py` — Smart CSV Ingestion
The data loader auto-detects date and value columns by keyword matching (`date`, `time`, `sale`, `revenue`, `amount`, etc.), handles multiple date formats including Excel serial dates, forward/back-fills missing numeric values, and weekly-resamples large datasets (500+ rows). This means users can throw almost any CSV at Synapse and it will just work.

#### `forecaster.py` — Prophet + Naive Baseline + Confidence Scoring
- **Prophet model** is configured with 80% confidence intervals, yearly seasonality enabled, weekly seasonality disabled (since data is already weekly-aggregated)
- **Naive baseline** is a simple rolling mean of the last 8 weeks — the industry-standard benchmark for proving the forecast isn't just memorising noise
- **Confidence scoring** evaluates three signals: data length (penalises <52 weeks), data volatility (coefficient of variation), and forecast uncertainty width. Returns a 0–100 score with a human-readable reason
- **Hold-out validation** withholds the last N weeks, trains on the rest, then compares Prophet MAE/MAPE vs baseline — this is how the model proves its own accuracy

#### `geo_risk.py` — The Core Innovation (Geopolitical Risk Engine)
This is where the novel contribution lives. The scoring uses **nonlinear mathematical models** instead of simple linear formulas:

- **Conflict intensity** → saturating exponential: `40 × (1 - e^(-conflict/2))` — high conflict has diminishing marginal risk increase
- **Political stability** → sigmoid: `30 × (1 / (1 + e^stability))` — captures the tipping-point nature of political instability
- **GDP growth** → asymmetric penalty: contraction penalised more sharply than growth rewards, using `20 × (1 - e^(gdp/3))` for negative GDP
- **Inflation** → logarithmic pressure: `10 × ln(1 + max(inflation-2, 0))` — inflation below 2% is baseline, above 2% creates escalating pressure

The **weighted firm risk** uses nonlinear sensitivity for revenue impact aggregation: `(1 - e^(-impact/10)) × 10 × exposure%` — this prevents unrealistically large impact estimates when multiple high-risk regions combine.

The **stress forecast** applies a **sigmoid-based shock diffusion model** with three additional layers:
1. **Exponential lag ramp** instead of linear (shock effects accelerate, not linearly increase)
2. **Volatility sensitivity** — wider Prophet confidence bands amplify the stress effect
3. **Momentum effect** — declining forecast trends amplify downside stress, rising trends cushion it

#### `explainer.py` — Groq LLM Integration
Wraps the Groq API (Llama 3.3 70B Versatile) with graceful fallback. Two functions: `explain_forecast` (2–3 sentence summary of trend + anomalies) and `explain_anomaly` (2 sentence explanation of a specific spike/dip). The geo briefing endpoint in `main.py` uses a detailed 5-sentence prompt template that includes the full exposure breakdown.

#### `scenarios.py` — What-If Growth Simulation
Applies a user-defined growth rate (±30%) to the raw data before re-running Prophet. Optionally removes outliers beyond 2σ. This lets users stress-test the forecast under different growth assumptions independently of geopolitical risk.

#### `stock_model.py` — XGBoost Stock Predictor
Downloads 6 months of daily data via yfinance, engineers three features (daily return, 5-day MA, 10-day MA), trains an XGBoost regressor (100 trees, max depth 4), and predicts the next day's close. The AI insights endpoint in `main.py` then wraps this with a Groq-generated 5-sentence equity strategy briefing.

#### `main.py` — API Route Orchestration
16 endpoints total, organised into sections:
- **Forecast**: `GET /api/default`, `POST /api/upload` — demo vs custom CSV
- **Scenario**: `GET|POST /api/scenario` — growth simulation
- **Anomaly**: `GET /api/anomaly/explain` — AI anomaly explanation
- **Validation**: `GET|POST /api/validate` — hold-out accuracy proof
- **Geo Risk**: `GET /api/geo/countries`, `GET /api/geo/risk`, `POST /api/geo/weighted-risk`, `POST /api/geo/stress-forecast`, `POST /api/geo/briefing`
- **Stock**: `GET /api/stock`, `POST /api/stock/insights`
- **Health**: `GET /health`

### Frontend Deep Dive — How the Dashboard Works

#### `page.tsx` — 758-line Dashboard Orchestrator
The main page is a single-page app with four tabs: **Overview**, **Prediction Flows**, **Geo Risk Model**, and **Stock Predictor**. It manages forecast state, CSV upload, and period selection at the top level and passes data down to child components.

**Six inline widgets** are built directly in page.tsx for the Overview and Predictions tabs:
- **GlobalHeatmap** — 8-region grid with hardcoded risk scores, colour-coded (green → red), with progress bars showing relative risk
- **CommoditiesTicker** — 6 commodities with simulated live price ticks every 2.8s using `setInterval` + random walk
- **GeopoliticsNewsFeed** — 5 curated stories with severity badges, region tags, and market impact strings
- **GeoPriceForecast** — Hand-drawn SVG chart with three lines (risk-adjusted, base forecast, neutral baseline) + gradient fills
- **RiskEventSimulator** — 3 crisis scenarios (Hormuz closure, Russia-NATO, China-Taiwan blockade) with an intensity slider that scales impact percentages dynamically
- **CountryRiskScorecard** — 4-country drill-down with 5 risk dimensions each, rendered as horizontal bar charts

#### `GeoRiskPanel.tsx` — The Core Geo Risk Interface (27KB)
The largest and most complex component. Handles the full geo risk workflow:
1. User enters company name + revenue exposure by region
2. Calls `POST /api/geo/weighted-risk` to get firm-level score
3. Calls `POST /api/geo/stress-forecast` with the firm score + Prophet forecast records
4. Calls `POST /api/geo/briefing` for the AI risk briefing
5. Renders: exposure input form, per-region risk breakdown, stress chart overlay, AI briefing panel

#### Other Components
- **ForecastChart.tsx** — Recharts `ComposedChart` with Area (confidence band), Line (yhat + baseline), and Scatter (actuals)
- **AnomalyList.tsx** — Clickable anomaly list, each row calls `/api/anomaly/explain` for AI explanation on demand
- **ScenarioPanel.tsx** — Growth rate slider + toggle for outlier removal, renders scenario overlay chart
- **SummaryCard.tsx** — Animated text reveal of the Groq AI forecast summary
- **ConfidenceCard.tsx** — Circular gauge + progress bar + reasons breakdown for model confidence
- **ValidationPanel.tsx** — Side-by-side MAE/MAPE comparison + chart of Actual vs Prophet vs Baseline on hold-out data
- **StatsRow.tsx** — Quick stats: total data points, forecast horizon, trend direction

---

##  Why This Wins Against Other Teams

| What other teams build | What Synapse builds |
|---|---|
| Stock price prediction from past prices | **Geopolitical shock transmission through revenue exposure** |
| Single country risk score | **Firm-specific weighted risk score based on revenue** |
| Generic forecasting dashboard | **Actionable banking tool with live stress testing** |
| Technical output for data scientists | **Plain-English AI briefings for SME owners and RMs** |
| Static analysis | **Live forecast + anomaly detection + scenario simulation** |

---

##  The NatWest Fit

1. **Portfolio Risk** — Gives NatWest a firm-level geopolitical risk score to aggregate a real stress testing tool across SME/corporate portfolios.
2. **Regional Exposure** — Revenue exposure mappings directly align with how NatWest evaluates geographic concentration risk in their loan book.
3. **SME Empowerment** — Democratises institutional-grade geopolitical risk analysis for small businesses.

---

##  Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| Forecasting | Facebook Prophet | Handles seasonality, trend shifts, missing data |
| Baseline | Rolling mean | Industry-standard benchmark, guards against overfitting |
| Anomaly Detection | Z-score on rolling window | Fast, interpretable, no black box |
| Geopolitical Scoring | Pandas + NumPy | Transparent, auditable nonlinear formulas |
| Stock Prediction | XGBoost + yfinance | Fast gradient boosting on technical features |
| AI Explanations | Groq API — Llama 3.3 70B | Sub-second latency, free tier, plain-English output |
| Backend | FastAPI + Uvicorn | Lightweight, async, production-ready |
| Frontend | Next.js 14 + Tailwind CSS | Fast, responsive, modern |
| Charts | Recharts + custom SVG | Confidence band support, composable API |

---

##  Datasets

| Dataset | What It Provides | How Synapse Uses It |
|---|---|---|
| **User-uploaded CSV** | Company's own revenue/sales history | Prophet forecasting engine input |
| **Walmart weekly sales (demo)** | Ready-to-run demonstration data | Shows the system working in 60 seconds |
| **Global Conflict Economy Military Governance** | Country-level conflict intensity, political stability, GDP growth, inflation | Geopolitical risk scoring per region |

---

##  Install and Run

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

The demo dataset (`walmart.csv` and `geo_conflict.csv`) is already included in `data/`.

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000 — the demo loads automatically.

---

## 📡 API Reference

```
# Forecast
GET  /api/default?periods=8          # Demo forecast (Walmart data)
POST /api/upload?periods=8           # Upload CSV forecast

# Scenario
GET  /api/scenario?growth_rate=10    # Scenario (demo data)
POST /api/scenario?growth_rate=10    # Scenario (uploaded CSV)

# Anomaly
GET  /api/anomaly/explain            # AI explanation for anomaly

# Validation
GET  /api/validate?periods=8         # Hold-out validation (demo)
POST /api/validate?periods=8         # Hold-out validation (uploaded)

# Geo Risk
GET  /api/geo/countries              # List available countries
GET  /api/geo/risk?country=Iran      # Single country risk score
POST /api/geo/weighted-risk          # Firm-level weighted risk (core)
POST /api/geo/stress-forecast        # Lag-adjusted stressed forecast
POST /api/geo/briefing               # AI risk briefing

# Stock
GET  /api/stock?ticker=AAPL          # Stock prediction
POST /api/stock/insights             # AI stock insight

# Health
GET  /health                         # Health check
```

---

##  Limitations

- Groq free tier rate limits may delay AI summaries by 1–2 seconds; forecast data always returns immediately
- Prophet needs at least 2 full seasonal cycles for best accuracy; sparse data produces wider confidence bands
- CSV auto-detects date/value columns by keyword — very unusual column names may need renaming to `date` and `value`
- Stock predictions are single-day forward only; not suitable for long-term investment decisions

---

##  Future Roadmap

- **NatWest integration** — Direct feed from NatWest business account transaction data, no CSV upload needed
- **Multi-series** — Compare multiple product lines or store locations on one chart
- **Threshold alerts** — Email/SMS when anomaly Z-score exceeds configurable limit
- **Loan readiness score** — Combine forecast trend + confidence score into a single SME creditworthiness signal
- **Real-time conflict data** — Replace static dataset with live ACLED/GDELT event stream
- **Portfolio aggregation** — Upload multiple firms, see aggregate geopolitical exposure across the loan book

---

##  Team

Built for **NatWest Code for Purpose 2026** — hackathon project, built overnight.
