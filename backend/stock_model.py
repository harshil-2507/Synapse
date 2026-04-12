import pandas as pd
import yfinance as yf
from xgboost import XGBRegressor
from sklearn.model_selection import train_test_split

def get_stock_data(ticker: str):
    df = yf.download(ticker, period="6mo", interval="1d")
    df = df[['Close']]
    df['Return'] = df['Close'].pct_change()
    df['MA5'] = df['Close'].rolling(5).mean()
    df['MA10'] = df['Close'].rolling(10).mean()
    df.dropna(inplace=True)
    return df

def train_model(df):
    X = df[['Return', 'MA5', 'MA10']]
    y = df['Close']

    model = XGBRegressor(n_estimators=100, max_depth=4)
    model.fit(X, y)
    return model

def predict_next(ticker: str):
    df = get_stock_data(ticker)
    model = train_model(df)

    last_row = df.iloc[-1][['Return', 'MA5', 'MA10']]
    pred_price = model.predict([last_row])[0]
    current_price = df.iloc[-1]['Close']

    change = pred_price - current_price
    pct = (change / current_price) * 100

    return {
        "current": float(current_price),
        "predicted": float(pred_price),
        "change": float(change),
        "pct": float(pct),
        "trend": ["UP" if x > 0 else "DOWN" for x in change]
    }