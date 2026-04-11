import os
import pandas as pd
from fastapi import FastAPI, UploadFile, File, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from data_loader import load_walmart, load_uploaded
from forecaster import run_forecast, compute_confidence, run_holdout_validation
from anomaly import detect_anomalies
from scenarios import run_scenario
from explainer import explain_forecast, explain_anomaly


load_dotenv()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

WALMART_PATH = "../data/walmart.csv"

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
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")

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

@app.get("/api/anomaly/explain")
def anomaly_explain(date: str, value: float, expected: float, direction: str, deviation_pct: float):
    anomaly = {"date": date, "value": value, "expected": expected, "direction": direction, "deviation_pct": deviation_pct}
    return {"explanation": explain_anomaly(anomaly)}


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
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=str(e))
    

    
@app.get("/health")
def health():
    return {"status": "ok"}