import pandas as pd
import numpy as np
from prophet import Prophet

def run_forecast(df: pd.DataFrame, periods: int = 8) -> dict:
    m = Prophet(interval_width=0.80, yearly_seasonality=True, weekly_seasonality=False)
    m.fit(df)

    future = m.make_future_dataframe(periods=periods, freq='W')
    forecast = m.predict(future)

    # naive baseline: rolling mean of last 8 weeks
    baseline_val = df['y'].tail(8).mean()
    baseline = pd.DataFrame({
        'ds': future['ds'].tail(periods),
        'baseline': [baseline_val] * periods
    })

    result_df = forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].tail(len(df) + periods)
    result_df = result_df.merge(baseline, on='ds', how='left')

    history = df.rename(columns={'y': 'actual'})
    result_df = result_df.merge(history, on='ds', how='left')

    return {
        "forecast": result_df.assign(
            ds=result_df['ds'].dt.strftime('%Y-%m-%d')
        ).fillna('').to_dict(orient='records'),
        "trend": round(float(forecast['trend'].iloc[-1] - forecast['trend'].iloc[-periods]), 2),
        "periods": periods
    }



def compute_confidence(df: pd.DataFrame, forecast: dict) -> dict:
    """
    Score model confidence based on data quality signals.
    Returns a score (0-100), label, color, and plain-English reason.
    """
    score = 100
    reasons = []

    # Signal 1: Data length (need at least 2 years for seasonality)
    weeks = len(df)
    if weeks < 52:
        score -= 40
        reasons.append(f"only {weeks} weeks of history (52+ recommended)")
    elif weeks < 104:
        score -= 15
        reasons.append(f"{weeks} weeks of history (104+ ideal for seasonality)")

    # Signal 2: Data volatility (high std/mean = noisy data)
    cv = df['y'].std() / df['y'].mean() if df['y'].mean() != 0 else 1
    if cv > 1.0:
        score -= 25
        reasons.append("high data volatility detected")
    elif cv > 0.5:
        score -= 10
        reasons.append("moderate data volatility")

    # Signal 3: Forecast uncertainty width
    forecast_rows = [r for r in forecast["forecast"] if r.get("baseline") == ""]
    if forecast_rows:
        avg_width = sum(
            (r["yhat_upper"] - r["yhat_lower"]) / max(abs(r["yhat"]), 1)
            for r in forecast_rows
        ) / len(forecast_rows)
        if avg_width > 0.5:
            score -= 20
            reasons.append("wide forecast uncertainty bands")
        elif avg_width > 0.25:
            score -= 8

    score = max(0, min(100, score))

    if score >= 75:
        label, color, bg = "High", "#15803d", "#f0fdf4"
    elif score >= 45:
        label, color, bg = "Medium", "#b45309", "#fffbeb"
    else:
        label, color, bg = "Low", "#dc2626", "#fef2f2"

    reason = (
        "Strong data quality with consistent patterns." if not reasons
        else f"Confidence reduced because: {'; '.join(reasons)}."
    )

    return {"score": score, "label": label, "color": color, "bg": bg, "reason": reason}