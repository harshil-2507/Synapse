export interface ForecastPoint {
  ds: string;
  yhat: number;
  yhat_lower: number;
  yhat_upper: number;
  baseline: number | string;
  actual: number | string;
}

export interface Anomaly {
  date: string;
  value: number;
  expected: number;
  direction: "spike" | "dip";
  deviation_pct: number;
  z_score: number;
}

export interface ForecastResponse {
  forecast: { forecast: ForecastPoint[]; trend: number; periods: number };
  anomalies: Anomaly[];
  summary: string;
}