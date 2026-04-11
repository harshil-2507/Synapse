import pandas as pd
import numpy as np
from io import StringIO

def load_walmart(path: str) -> pd.DataFrame:
    df = pd.read_csv(path)
    df['Date'] = pd.to_datetime(df['Date'], dayfirst=True)
    df = df.groupby('Date')['Weekly_Sales'].sum().reset_index()
    df.columns = ['ds', 'y']
    df = df.sort_values('ds').reset_index(drop=True)
    return df

def load_uploaded(contents: str) -> pd.DataFrame:
    try:
        df = pd.read_csv(StringIO(contents))
    except Exception as e:
        raise ValueError(f"Could not parse CSV: {e}")
    
    df.columns = [c.strip().lower().replace(' ', '_') for c in df.columns]
    
    date_candidates = [c for c in df.columns if any(k in c for k in ['date', 'time', 'week', 'month', 'year', 'day', 'period'])]
    date_col = date_candidates[0] if date_candidates else df.columns[0]
    
    val_candidates = [c for c in df.columns if any(k in c for k in ['sale', 'value', 'revenue', 'count', 'amount', 'price', 'qty', 'quantity', 'total', 'close', 'open'])]
    val_col = val_candidates[0] if val_candidates else df.columns[1]
    
    df = df[[date_col, val_col]].copy()
    df.columns = ['ds', 'y']
    df['ds'] = pd.to_datetime(df['ds'], infer_datetime_format=True, errors='coerce')
    df['y'] = pd.to_numeric(df['y'], errors='coerce')
    df = df.dropna().sort_values('ds').reset_index(drop=True)
    
    # Resample to weekly if more than 500 rows (daily data)
    if len(df) > 500:
        df = df.set_index('ds').resample('W').sum().reset_index()
        df = df[df['y'] > 0]
    
    if len(df) < 10:
        raise ValueError("Not enough valid data rows (minimum 10 required)")
    
    return df