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
        raise ValueError(f"Could not parse CSV file: {e}")

    # -----------------------------
    # Normalize columns
    # -----------------------------
    df.columns = [c.strip().lower().replace(' ', '_') for c in df.columns]

    # -----------------------------
    # Auto-detect columns
    # -----------------------------
    date_candidates = [
        c for c in df.columns
        if any(k in c for k in ['date', 'time', 'week', 'month', 'year', 'day', 'period'])
    ]
    date_col = date_candidates[0] if date_candidates else df.columns[0]

    val_candidates = [
        c for c in df.columns
        if any(k in c for k in ['sale', 'value', 'revenue', 'count', 'amount',
                                'price', 'qty', 'quantity', 'total', 'close', 'open'])
    ]
    val_col = val_candidates[0] if val_candidates else df.columns[1]

    df = df[[date_col, val_col]].copy()
    df.columns = ['ds', 'y']

    # -----------------------------
    # FIX 1: FORCE SAFE DATE PARSING (multi-format + numeric safe)
    # -----------------------------
    df['ds_raw'] = df['ds']

    # try numeric dates first (Excel serial support)
    df['ds'] = pd.to_numeric(df['ds'], errors='ignore')

    df['ds'] = pd.to_datetime(
        df['ds'],
        errors='coerce',
        infer_datetime_format=True
    )

    # fallback second pass for failed rows
    mask = df['ds'].isna()
    if mask.any():
        df.loc[mask, 'ds'] = pd.to_datetime(df.loc[mask, 'ds_raw'], errors='coerce')

    df = df.drop(columns=['ds_raw'])

    # -----------------------------
    # FIX 2: numeric cleaning
    # -----------------------------
    df['y'] = pd.to_numeric(df['y'], errors='coerce')

    # -----------------------------
    # SMART CLEANING (no full destruction)
    # -----------------------------
    valid_before = len(df)

    df = df.dropna(subset=['ds'])

    # if too many values missing, DO NOT hard fail immediately
    if len(df) == 0:
        raise ValueError(
            "All date values failed to parse. "
            "Check format (expected: YYYY-MM-DD, DD/MM/YYYY, or numeric Excel dates)."
        )

    # fill missing numeric values safely
    df['y'] = df['y'].ffill().bfill()

    df = df.sort_values('ds').reset_index(drop=True)

    # -----------------------------
    # Resampling
    # -----------------------------
    if len(df) > 500:
        df = (
            df.set_index('ds')
              .resample('W')
              .sum()
              .reset_index()
        )
        df = df[df['y'] > 0]

    # -----------------------------
    # FINAL VALIDATION
    # -----------------------------
    if len(df) < 10:
        raise ValueError(
            f"Not enough valid rows after preprocessing. "
            f"Original rows: {valid_before}, Final rows: {len(df)}. "
            f"Likely issue: date format mismatch or empty numeric column."
        )

    return df