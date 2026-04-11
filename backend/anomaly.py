import pandas as pd
import numpy as np

def detect_anomalies(df: pd.DataFrame, threshold: float = 1.5) -> list:
    df = df.copy()
    df['rolling_mean'] = df['y'].rolling(window=8, min_periods=1).mean()
    df['rolling_std'] = df['y'].rolling(window=8, min_periods=1).std().fillna(df['y'].std())
    df['z_score'] = (df['y'] - df['rolling_mean']) / df['rolling_std']

    anomalies = df[df['z_score'].abs() > threshold].copy()
    result = []
    for _, row in anomalies.iterrows():
        direction = "spike" if row['z_score'] > 0 else "dip"
        pct = round(abs((row['y'] - row['rolling_mean']) / row['rolling_mean']) * 100, 1)
        result.append({
            "date": row['ds'].strftime('%Y-%m-%d'),
            "value": round(float(row['y']), 2),
            "expected": round(float(row['rolling_mean']), 2),
            "direction": direction,
            "deviation_pct": pct,
            "z_score": round(float(row['z_score']), 2)
        })
    return result