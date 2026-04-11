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

def run_holdout_validation(df: pd.DataFrame, holdout_weeks: int = 8) -> dict:
    """
    Hold out the last N weeks, train on the rest, 
    predict the holdout period, compare Prophet vs naive baseline.
    """
    if len(df) < holdout_weeks + 20:
        return {"available": False, "reason": "Not enough data for validation"}

    train = df.iloc[:-holdout_weeks].copy()
    actual = df.iloc[-holdout_weeks:].copy()

    # Train Prophet on history only
    m = Prophet(interval_width=0.80, yearly_seasonality=True, weekly_seasonality=False)
    m.fit(train)
    future = m.make_future_dataframe(periods=holdout_weeks, freq='W')
    forecast = m.predict(future)
    prophet_preds = forecast['yhat'].iloc[-holdout_weeks:].values
    actual_vals = actual['y'].values

    # Naive baseline: mean of last 8 weeks of training data
    baseline_val = train['y'].tail(8).mean()
    baseline_preds = np.array([baseline_val] * holdout_weeks)

    # Metrics
    def mae(preds, actuals):
        return float(np.mean(np.abs(preds - actuals)))

    def mape(preds, actuals):
        mask = actuals != 0
        return float(np.mean(np.abs((actuals[mask] - preds[mask]) / actuals[mask])) * 100)

    prophet_mae = mae(prophet_preds, actual_vals)
    baseline_mae = mae(baseline_preds, actual_vals)
    prophet_mape = mape(prophet_preds, actual_vals)
    baseline_mape = mape(baseline_preds, actual_vals)
    improvement = ((baseline_mae - prophet_mae) / baseline_mae * 100) if baseline_mae > 0 else 0

    # Build comparison chart data
    comparison = []
    for i, row in enumerate(actual.itertuples()):
        comparison.append({
            "date": row.ds.strftime('%Y-%m-%d'),
            "Actual": round(float(row.y), 2),
            "Prophet": round(float(prophet_preds[i]), 2),
            "Baseline": round(float(baseline_val), 2),
        })

    return {
        "available": True,
        "holdout_weeks": holdout_weeks,
        "prophet_mae": round(prophet_mae, 2),
        "baseline_mae": round(baseline_mae, 2),
        "prophet_mape": round(prophet_mape, 2),
        "baseline_mape": round(baseline_mape, 2),
        "improvement_pct": round(improvement, 1),
        "prophet_wins": prophet_mae < baseline_mae,
        "comparison": comparison
    }