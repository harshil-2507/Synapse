import pandas as pd
from forecaster import run_forecast

def run_scenario(df: pd.DataFrame, growth_rate: float = 0.0, remove_outliers: bool = False, periods: int = 8) -> dict:
    df = df.copy()

    if remove_outliers:
        mean, std = df['y'].mean(), df['y'].std()
        df = df[abs(df['y'] - mean) < 2 * std]

    if growth_rate != 0.0:
        df['y'] = df['y'] * (1 + growth_rate / 100)

    return run_forecast(df, periods=periods)