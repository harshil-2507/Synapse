import os
import pandas as pd
from fastapi import FastAPI, UploadFile, File, Query, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from dotenv import load_dotenv

from data_loader import load_walmart, load_uploaded
from forecaster import run_forecast, compute_confidence, run_holdout_validation
from anomaly import detect_anomalies
from scenarios import run_scenario
from explainer import explain_forecast, explain_anomaly
from geo_risk import (
    load_geo_data, compute_geo_risk_score, get_available_countries,
    compute_weighted_firm_risk, compute_stress_forecast
)

load_dotenv()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

WALMART_PATH = "../data/walmart.csv"
GEO_PATH = "../data/geo_conflict.csv"


# ── Forecast ──────────────────────────────────────────────────────────────────

@app.get("/api/default")
def default_forecast(periods: int = Query(8, ge=1, le=26)):
    df = load_walmart(WALMART_PATH)
    forecast = run_forecast(df, periods)
    anomalies = detect_anomalies(df)
    summary = explain_forecast(forecast["trend"], periods, anomalies)
    confidence = compute_confidence(df, forecast)
    return {"forecast": forecast, "anomalies": anomalies, "summary": summary, "confidence": confidence}


@app.post("/api/upload")
async def upload_forecast(file: UploadFile = File(...), periods: int = Query(8)):
    try:
        contents = await file.read()
        df = load_uploaded(contents.decode("utf-8"))
        forecast = run_forecast(df, periods)
        anomalies = detect_anomalies(df)
        summary = explain_forecast(forecast["trend"], periods, anomalies)
        confidence = compute_confidence(df, forecast)
        return {"forecast": forecast, "anomalies": anomalies, "summary": summary, "confidence": confidence}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")


# ── Scenario ──────────────────────────────────────────────────────────────────

@app.api_route("/api/scenario", methods=["GET", "POST"])
async def scenario(
    request: Request,
    growth_rate: float = Query(0.0),
    remove_outliers: bool = Query(False),
    periods: int = Query(8)
):
    df = load_walmart(WALMART_PATH)
    if request.method == "POST":
        try:
            form = await request.form()
            file = form.get("file")
            if file and hasattr(file, "filename") and file.filename:
                contents = await file.read()
                if len(contents) > 10:
                    df = load_uploaded(contents.decode("utf-8"))
        except Exception:
            pass
    result = run_scenario(df, growth_rate, remove_outliers, periods)
    return {"forecast": result, "trend": result["trend"], "periods": result["periods"]}


# ── Anomaly ───────────────────────────────────────────────────────────────────

@app.get("/api/anomaly/explain")
def anomaly_explain(date: str, value: float, expected: float, direction: str, deviation_pct: float):
    anomaly = {"date": date, "value": value, "expected": expected, "direction": direction, "deviation_pct": deviation_pct}
    return {"explanation": explain_anomaly(anomaly)}


# ── Validation ────────────────────────────────────────────────────────────────

@app.get("/api/validate")
def validate(periods: int = Query(8)):
    df = load_walmart(WALMART_PATH)
    return run_holdout_validation(df, holdout_weeks=periods)


@app.post("/api/validate")
async def validate_upload(file: UploadFile = File(...), periods: int = Query(8)):
    try:
        contents = await file.read()
        df = load_uploaded(contents.decode("utf-8"))
        return run_holdout_validation(df, holdout_weeks=periods)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Geo Risk — Single Country ─────────────────────────────────────────────────

@app.get("/api/geo/countries")
def geo_countries():
    try:
        df = load_geo_data(GEO_PATH)
        return {"countries": get_available_countries(df)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/geo/risk")
def geo_risk(country: str):
    try:
        df = load_geo_data(GEO_PATH)
        return compute_geo_risk_score(df, country)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Geo Risk — Weighted Firm-Level (THE CORE NEW ENDPOINT) ────────────────────

class ExposureItem(BaseModel):
    region: str
    exposure_pct: float

class WeightedRiskRequest(BaseModel):
    exposures: List[ExposureItem]
    company_name: str = "the company"

@app.post("/api/geo/weighted-risk")
def geo_weighted_risk(body: WeightedRiskRequest):
    """
    Core endpoint. Takes company name + list of {region, exposure_pct}.
    Returns firm-level weighted geopolitical risk score.
    """
    try:
        df = load_geo_data(GEO_PATH)
        exposures = [{"region": e.region, "exposure_pct": e.exposure_pct} for e in body.exposures]
        result = compute_weighted_firm_risk(df, exposures)
        result["company_name"] = body.company_name
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Geo Risk — Stress Forecast ────────────────────────────────────────────────

class StressForecastRequest(BaseModel):
    firm_score: float
    forecast_records: list
    lag_weeks: int = 3

@app.post("/api/geo/stress-forecast")
def geo_stress_forecast(body: StressForecastRequest):
    """
    Takes the existing Prophet forecast + firm_score.
    Returns lag-adjusted stressed forecast for chart overlay.
    """
    try:
        stressed = compute_stress_forecast(body.forecast_records, body.firm_score, body.lag_weeks)
        return {"stressed_forecast": stressed}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Geo Risk — AI Briefing (firm-aware) ───────────────────────────────────────

class BriefingRequest(BaseModel):
    company_name: str
    firm_score: float
    estimated_revenue_impact_pct: float
    region_details: list
    top_risk_region: str = ""

@app.post("/api/geo/briefing")
def geo_briefing(body: BriefingRequest):
    """
    Firm-specific AI briefing using full exposure breakdown.
    """
    try:
        from explainer import client

        exposure_lines = "\n".join(
            f"  - {r['region']}: {r['exposure_pct']}% exposure, risk score {r['risk_score']}/100 ({r['label']})"
            for r in body.region_details if r.get('risk_score') is not None
        )

        prompt = f"""You are a senior financial risk analyst at NatWest bank.

Company: {body.company_name}
Firm Geopolitical Risk Score: {body.firm_score}/100
Estimated Revenue Impact if risks materialise: -{body.estimated_revenue_impact_pct}%
Highest risk exposure: {body.top_risk_region}

Geographic Revenue Exposure Breakdown:
{exposure_lines}

Write exactly 3 sentences in plain English for a non-technical SME business owner or bank relationship manager.
Sentence 1: Describe the company's overall geopolitical risk posture based on the exposure breakdown.
Sentence 2: Explain what the estimated revenue impact means in practical terms.
Sentence 3: Give one specific, actionable recommendation.
Be direct. No jargon. No bullet points."""

        res = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=200,
        )
        return {"briefing": res.choices[0].message.content.strip()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Health ────────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok"}