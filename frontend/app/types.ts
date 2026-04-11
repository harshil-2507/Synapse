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

export interface Confidence {
  score: number;
  label: "High" | "Medium" | "Low";
  color: string;
  bg: string;
  reason: string;
}

export interface ForecastResponse {
  forecast: { forecast: ForecastPoint[]; trend: number; periods: number };
  anomalies: Anomaly[];
  summary: string;
  confidence: Confidence;
}

export interface ValidationResult {
  available: boolean;
  reason?: string;
  holdout_weeks?: number;
  prophet_mae?: number;
  baseline_mae?: number;
  prophet_mape?: number;
  baseline_mape?: number;
  improvement_pct?: number;
  prophet_wins?: boolean;
  comparison?: { date: string; Actual: number; Prophet: number; Baseline: number }[];
}