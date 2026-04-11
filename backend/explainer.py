import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def _call(prompt: str) -> str:
    try:
        res = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=150
        )
        return res.choices[0].message.content.strip()
    except Exception:
        return "AI summary temporarily unavailable. Forecast and anomaly data above are fully accurate."

def explain_forecast(trend: float, periods: int, anomalies: list) -> str:
    anomaly_text = f"A {anomalies[0]['direction']} of {anomalies[0]['deviation_pct']}% on {anomalies[0]['date']}." if anomalies else "No anomalies detected."
    return _call(f"You are a business analyst. In 2-3 plain English sentences for a non-technical manager, summarize: forecast horizon {periods} weeks, trend change {trend:+.0f} units, {anomaly_text} No bullet points.")

def explain_anomaly(anomaly: dict) -> str:
    return _call(f"You are a business analyst. In 2 sentences for a non-technical manager, explain: a {anomaly['direction']} on {anomaly['date']}, actual {anomaly['value']:,.0f} vs expected {anomaly['expected']:,.0f}, deviation {anomaly['deviation_pct']}%. Suggest one reason. No bullet points.")