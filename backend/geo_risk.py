import pandas as pd
import numpy as np


def load_geo_data(path: str) -> pd.DataFrame:
    df = pd.read_csv(path)
    df.columns = [c.strip().lower().replace(' ', '_') for c in df.columns]
    return df


def get_available_countries(df: pd.DataFrame) -> list:
    return sorted(df['country'].dropna().unique().tolist())


def compute_geo_risk_score(df: pd.DataFrame, country: str) -> dict:
    row = df[df['country'].str.lower() == country.lower()]
    if row.empty:
        return {"available": False, "country": country}
    row = row.sort_values('year', ascending=False).head(1)
    r = row.iloc[0]

    score = 0
    breakdown = {}

    conflict = float(r.get('conflict_intensity', 0) or 0)
    conflict_score = min(conflict / 4 * 40, 40)
    score += conflict_score
    breakdown['conflict_intensity'] = round(conflict_score, 1)

    stability = float(r.get('political_stability_index', 0) or 0)
    stability_score = max(0, min((-stability + 2.5) / 5 * 30, 30))
    score += stability_score
    breakdown['political_instability'] = round(stability_score, 1)

    gdp = float(r.get('gdp_growth', 2) or 2)
    gdp_score = max(0, min((-gdp + 5) / 10 * 20, 20))
    score += gdp_score
    breakdown['economic_weakness'] = round(gdp_score, 1)

    inflation = float(r.get('inflation_rate', 2) or 2)
    inflation_score = min(max(inflation - 2, 0) / 20 * 10, 10)
    score += inflation_score
    breakdown['inflation_pressure'] = round(inflation_score, 1)

    score = round(min(score, 100), 1)

    if score >= 65:
        label, color, bg = "High Risk", "#dc2626", "#fef2f2"
    elif score >= 35:
        label, color, bg = "Moderate Risk", "#b45309", "#fffbeb"
    else:
        label, color, bg = "Low Risk", "#15803d", "#f0fdf4"

    impact_pct = round(conflict * 3.5 + max(-gdp, 0) * 1.2, 1)

    return {
        "available": True,
        "country": country,
        "year": int(r.get('year', 2023)),
        "score": score,
        "label": label,
        "color": color,
        "bg": bg,
        "breakdown": breakdown,
        "estimated_revenue_impact_pct": impact_pct,
        "conflict_intensity": round(conflict, 2),
        "gdp_growth": round(gdp, 2),
        "inflation_rate": round(float(r.get('inflation_rate', 0) or 0), 2),
        "political_stability": round(stability, 2),
    }


def compute_weighted_firm_risk(df: pd.DataFrame, exposures: list) -> dict:
    """
    exposures: [{"region": "China", "exposure_pct": 60}, ...]
    Returns firm-level weighted risk score and per-region breakdown.
    """
    total_pct = sum(e['exposure_pct'] for e in exposures)
    if total_pct == 0:
        return {"available": False, "reason": "Total exposure is 0%"}

    weighted_score = 0.0
    weighted_impact = 0.0
    region_details = []

    for e in exposures:
        country = e['region']
        pct = e['exposure_pct'] / 100.0
        risk = compute_geo_risk_score(df, country)

        if risk['available']:
            contribution = round(risk['score'] * pct, 2)
            impact_contribution = round(risk['estimated_revenue_impact_pct'] * pct, 2)
            weighted_score += contribution
            weighted_impact += impact_contribution
            region_details.append({
                "region": country,
                "exposure_pct": e['exposure_pct'],
                "risk_score": risk['score'],
                "contribution": contribution,
                "label": risk['label'],
                "color": risk['color'],
                "conflict_intensity": risk['conflict_intensity'],
                "gdp_growth": risk['gdp_growth'],
                "year": risk['year'],
            })
        else:
            region_details.append({
                "region": country,
                "exposure_pct": e['exposure_pct'],
                "risk_score": None,
                "contribution": 0,
                "label": "No data",
                "color": "#9ca3af",
                "conflict_intensity": None,
                "gdp_growth": None,
                "year": None,
            })

    firm_score = round(min(weighted_score, 100), 1)

    if firm_score >= 65:
        label, color, bg = "High Risk", "#dc2626", "#fef2f2"
    elif firm_score >= 35:
        label, color, bg = "Moderate Risk", "#b45309", "#fffbeb"
    else:
        label, color, bg = "Low Risk", "#15803d", "#f0fdf4"

    # Highest risk region drives the headline
    top_region = max(
        [r for r in region_details if r['risk_score'] is not None],
        key=lambda x: x['contribution'],
        default=None
    )

    return {
        "available": True,
        "firm_score": firm_score,
        "label": label,
        "color": color,
        "bg": bg,
        "estimated_revenue_impact_pct": round(weighted_impact, 1),
        "region_details": region_details,
        "top_risk_region": top_region['region'] if top_region else None,
        "top_risk_contribution": top_region['contribution'] if top_region else 0,
    }


def compute_stress_forecast(forecast_records: list, firm_score: float, lag_weeks: int = 3) -> list:
    """
    Takes existing Prophet forecast records and returns a stress-adjusted version.
    Applies firm_score as a dampening factor after lag_weeks of delay.
    Only applied to future (non-actual) data points.
    """
    impact_factor = 1 - (firm_score / 100) * 0.25  # max 25% revenue hit at score=100
    stressed = []

    future_points = [r for r in forecast_records if r.get('actual') == '' or r.get('actual') is None]
    
    for i, record in enumerate(future_points):
        # Lag: first lag_weeks points are unaffected, then ramp in
        if i < lag_weeks:
            ramp = (i / lag_weeks)  # partial effect
        else:
            ramp = 1.0

        effective_factor = 1 - (1 - impact_factor) * ramp

        stressed.append({
            "date": record['ds'],
            "Forecast": round(record['yhat'], 2),
            "Stressed": round(record['yhat'] * effective_factor, 2),
            "Upper": round(record['yhat_upper'] * effective_factor, 2),
            "Lower": round(record['yhat_lower'] * effective_factor, 2),
        })

    return stressed