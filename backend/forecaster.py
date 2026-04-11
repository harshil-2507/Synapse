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