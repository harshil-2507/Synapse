"use client";
import { useState, useCallback, useEffect } from "react";
import axios from "axios";
import { ForecastResponse, Anomaly } from "./types";
import ForecastChart from "./components/ForecastChart";
import AnomalyList from "./components/AnomalyList";
import ScenarioPanel from "./components/ScenarioPanel";
import SummaryCard from "./components/SummaryCard";
import ConfidenceCard from "./components/ConfidenceCard";
import ValidationPanel from "./components/ValidationPanel";
import GeoRiskPanel from "./components/GeoRiskPanel";


const API = "http://localhost:8000";

export default function Dashboard() {
  const [data, setData] = useState<ForecastResponse | null>(null);
  const [scenarioData, setScenarioData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [scenarioLoading, setScenarioLoading] = useState(false);
  const [periods, setPeriods] = useState(8);
  const [growthRate, setGrowthRate] = useState(0);
  const [removeOutliers, setRemoveOutliers] = useState(false);
  const [activeAnomaly, setActiveAnomaly] = useState<Anomaly | null>(null);
  const [anomalyExplanation, setAnomalyExplanation] = useState("");
  const [explainLoading, setExplainLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<
    "forecast" | "anomalies" | "scenario" | "validate" | "georisk"
  >("forecast");

  const loadDefault = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/default?periods=${periods}`);
      setData(res.data);
      setScenarioData(null);
      setUploadedFile(null);
    } finally {
      setLoading(false);
    }
  }, [periods]);

  useEffect(() => { loadDefault(); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFile(file);
    setLoading(true);
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await axios.post(`${API}/api/upload?periods=${periods}`, form);
      setData(res.data);
      setScenarioData(null);
    } finally {
      setLoading(false);
    }
  };

  const runScenario = async () => {
    setScenarioLoading(true);
    try {
      if (uploadedFile) {
        const form = new FormData();
        form.append("file", uploadedFile);
        const res = await axios.post(
          `${API}/api/scenario?growth_rate=${growthRate}&remove_outliers=${removeOutliers}&periods=${periods}`,
          form
        );
        setScenarioData(res.data);
      } else {
        const res = await axios.get(
          `${API}/api/scenario?growth_rate=${growthRate}&remove_outliers=${removeOutliers}&periods=${periods}`
        );
        setScenarioData(res.data);
      }
      setActiveTab("scenario");
    } finally {
      setScenarioLoading(false);
    }
  };

  const explainAnomaly = async (anomaly: Anomaly) => {
    setActiveAnomaly(anomaly);
    setExplainLoading(true);
    setAnomalyExplanation("");
    try {
      const res = await axios.get(`${API}/api/anomaly/explain`, {
        params: {
          date: anomaly.date,
          value: anomaly.value,
          expected: anomaly.expected,
          direction: anomaly.direction,
          deviation_pct: anomaly.deviation_pct,
        },
      });
      setAnomalyExplanation(res.data.explanation);
    } finally {
      setExplainLoading(false);
    }
  };

  const chartData = data?.forecast.forecast.map(p => ({
    date: p.ds.slice(0, 10),
    Forecast: p.yhat,
    "Upper Bound": p.yhat_upper,
    "Lower Bound": p.yhat_lower,
    Actual: p.actual !== "" ? Number(p.actual) : undefined,
    Baseline: p.baseline !== "" ? Number(p.baseline) : undefined,
  })) ?? [];

  const scenarioForecast = (scenarioData as any)?.forecast?.forecast ?? [];
  const originalForecast = data?.forecast?.forecast ?? [];
  const scenarioChartData = Array.isArray(scenarioForecast)
    ? scenarioForecast.slice(-periods).map((p: any) => {
      const pDate = p.ds.slice(0, 10);
      const match = originalForecast.find((b: any) => b.ds.slice(0, 10) === pDate);
      return {
        date: pDate,
        Baseline: match ? Number(match.yhat) : null,
        Scenario: Number(p.yhat),
        "Scenario Upper": Number(p.yhat_upper),
        "Scenario Lower": Number(p.yhat_lower),
      };
    }).filter((p: any) => p.Baseline !== null && p.Baseline > 0)
    : [];

  const tabs = ["forecast", "anomalies", "scenario", "validate", "georisk"] as const;

  const heroStats = [
    {
      label: "Training Window",
      value: data ? `${data.forecast.forecast.filter((p: any) => p.actual !== "").length}` : "—",
      suffix: "wks",
      icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    },
    {
      label: "Prediction Horizon",
      value: `${periods}`,
      suffix: "wks",
      icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    },
    {
      label: "Detected Outliers",
      value: data ? `${data.anomalies.length}` : "—",
      suffix: "found",
      icon: "M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z",
    },
    {
      label: "Net Demand Shift",
      value: data
        ? data.forecast.trend > 0
          ? `+${(data.forecast.trend / 1000).toFixed(0)}K`
          : `${(data.forecast.trend / 1000).toFixed(0)}K`
        : "—",
      suffix: "",
      icon:
        data && data.forecast.trend > 0
          ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
          : "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <style>{`
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes heroFadeUp {
          from { opacity:0; transform:translateY(16px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes chartLineDraw {
          from { stroke-dashoffset: 1000; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes statCountIn {
          from { opacity:0; transform:translateY(8px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>

      {/* ── HERO ── */}
      <div style={{
        background: "linear-gradient(135deg, #2d0f47 0%, #42145f 40%, #5a1f7a 70%, #6b21a8 100%)",
        borderRadius: 20,
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 8px 48px rgba(66,20,95,0.35)",
        animation: "heroFadeUp 0.5s ease forwards",
      }}>
        {/* Decorative orbs */}
        <div style={{ position: "absolute", top: -100, right: -80, width: 320, height: 320, background: "radial-gradient(circle,rgba(218,24,132,0.12) 0%,transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -80, left: "30%", width: 260, height: 260, background: "radial-gradient(circle,rgba(255,255,255,0.03) 0%,transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "30%", right: "20%", width: 140, height: 140, background: "radial-gradient(circle,rgba(37,99,235,0.1) 0%,transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />

        {/* ── TOP: title + buttons ── */}
        <div style={{ padding: "32px 36px 24px", position: "relative" }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 24 }}>
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(218,24,132,0.2)", border: "1px solid rgba(218,24,132,0.3)", borderRadius: 20, padding: "3px 12px", marginBottom: 14 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#da1884" }} />
                <span style={{ fontSize: 11, color: "#f9a8d4", fontWeight: 600, letterSpacing: "0.06em" }}>Curated</span>
              </div>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: "white", letterSpacing: "-0.025em", lineHeight: 1.25, margin: "0 0 10px", maxWidth: 540 }}>
                Synapse — Probabilistic Forecasting<br />with Built-in Validation
              </h1>
              <p style={{ color: "rgba(216,180,254,0.7)", fontSize: 13, lineHeight: 1.65, margin: 0, maxWidth: 460 }}>
                Generate statistically grounded forecasts with confidence intervals, anomaly detection, and baseline benchmarking.
              </p>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, flexShrink: 0 }}>
              <button onClick={loadDefault} disabled={loading} style={{
                padding: "10px 22px", background: "white", color: "#42145f", border: "none",
                borderRadius: 10, fontSize: 13, fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1,
                boxShadow: "0 2px 12px rgba(0,0,0,0.2)", transition: "transform 0.15s ease, box-shadow 0.15s ease",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.25)" }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.2)" }}>
                {loading ? "Loading..." : "Load Sample Dataset"}
              </button>
              <label style={{
                padding: "10px 22px", background: "rgba(255,255,255,0.1)", color: "white",
                border: "1px solid rgba(255,255,255,0.18)", borderRadius: 10, fontSize: 13,
                fontWeight: 600, cursor: "pointer", transition: "background 0.15s ease",
                display: "inline-block",
              }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.18)")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}>
                Ingest Dataset (CSV)
                <input type="file" accept=".csv" onChange={handleUpload} style={{ display: "none" }} />
              </label>
              {uploadedFile && (
                <button onClick={() => { setUploadedFile(null); loadDefault(); }} style={{
                  padding: "10px 16px", background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.55)",
                  border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 13, cursor: "pointer",
                  transition: "background 0.15s ease",
                }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}>
                  ✕ Reset
                </button>
              )}
            </div>
          </div>

          {/* Horizon pills */}
          <div style={{ marginTop: 20, paddingTop: 18, borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 11, color: "rgba(216,180,254,0.6)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", flexShrink: 0 }}>
              Horizon
            </span>
            <div style={{ display: "flex", gap: 5 }}>
              {[4, 8, 12, 16, 20, 26].map(w => (
                <button key={w} onClick={() => setPeriods(w)} style={{
                  padding: "4px 12px", borderRadius: 7, fontSize: 12, fontWeight: 600,
                  border: "none", cursor: "pointer", transition: "all 0.15s ease",
                  background: periods === w ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.07)",
                  color: periods === w ? "#42145f" : "rgba(255,255,255,0.6)",
                  boxShadow: periods === w ? "0 2px 8px rgba(0,0,0,0.2)" : "none",
                }}>{w}w</button>
              ))}
            </div>
          </div>
        </div>

        {/* ── BOTTOM TWO COLUMNS ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1.1fr 1fr",
          borderTop: "1px solid rgba(255,255,255,0.07)",
        }}>

          {/* LEFT: marketing + visual */}
          <div style={{
            padding: "26px 36px 30px",
            borderRight: "1px solid rgba(255,255,255,0.07)",
            position: "relative", overflow: "hidden",
            display: "flex", flexDirection: "column", justifyContent: "space-between",
            minHeight: 190,
          }}>
            {/* Animated background chart line */}
            <svg style={{ position: "absolute", bottom: 0, left: 0, right: 0, opacity: 0.1 }} height="90" viewBox="0 0 600 90" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartLineGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#da1884" />
                  <stop offset="50%" stopColor="#c084fc" />
                  <stop offset="100%" stopColor="#60a5fa" />
                </linearGradient>
              </defs>
              <polyline
                points="0,70 60,65 120,50 180,58 240,35 300,42 360,22 420,30 480,18 540,24 600,10"
                fill="none"
                stroke="url(#chartLineGrad)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <polygon
                points="0,70 60,65 120,50 180,58 240,35 300,42 360,22 420,30 480,18 540,24 600,10 600,90 0,90"
                fill="url(#chartLineGrad)"
                opacity="0.25"
              />
            </svg>

            <div style={{ position: "relative", zIndex: 1 }}>
              <p style={{
                fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
                color: "rgba(218,24,132,0.85)", textTransform: "uppercase",
                margin: "0 0 10px",
              }}>
                AI-Powered · Time Series Intelligence
              </p>
              <p style={{
                fontSize: 20, fontWeight: 800, color: "white",
                lineHeight: 1.3, margin: "0 0 18px",
                letterSpacing: "-0.02em",
              }}>
                From raw data to{" "}
                <span style={{
                  background: "linear-gradient(90deg, #f9a8d4, #c084fc, #93c5fd)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}>
                  actionable foresight
                </span>
              </p>

              {/* Feature pills */}
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {[
                  { icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", label: "Prophet Model" },
                  { icon: "M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z", label: "Anomaly Detection" },
                  { icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", label: "Hold-out Validation" },
                ].map(f => (
                  <div key={f.label} style={{
                    display: "flex", alignItems: "center", gap: 6,
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 8, padding: "5px 10px",
                  }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                      <path d={f.icon} stroke="rgba(255,255,255,0.75)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>{f.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: 2×2 stats grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
            {heroStats.map((s, i) => (
              <div key={s.label} style={{
                padding: "22px 24px",
                borderRight: i % 2 === 0 ? "1px solid rgba(255,255,255,0.07)" : "none",
                borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.07)" : "none",
                display: "flex", flexDirection: "column", justifyContent: "space-between",
                gap: 10,
                animation: `statCountIn 0.4s ease ${0.1 + i * 0.08}s both`,
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: "rgba(255,255,255,0.09)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <path d={s.icon} stroke="rgba(255,255,255,0.75)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                    <span style={{
                      fontSize: 28, fontWeight: 800, color: "white",
                      letterSpacing: "-0.03em", lineHeight: 1,
                    }}>
                      {s.value}
                    </span>
                    {s.suffix && (
                      <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.4)" }}>{s.suffix}</span>
                    )}
                  </div>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", margin: "5px 0 0", fontWeight: 500, letterSpacing: "0.01em" }}>
                    {s.label}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* ── LOADING ── */}
      {loading && (
        <div className="fade-up card" style={{ textAlign: "center", padding: "64px 24px" }}>
          <div style={{
            width: 48, height: 48,
            background: "linear-gradient(135deg,#42145f,#6b21a8)",
            borderRadius: 14, margin: "0 auto 16px",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
              style={{ animation: "spin 1s linear infinite" }}>
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
                stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <p style={{ fontWeight: 600, color: "#42145f", marginBottom: 4 }}>Running forecast model</p>
          <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>
            Prophet is analysing patterns and generating predictions...
          </p>
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      {data && !loading && (
        <>
          {data.confidence && <ConfidenceCard confidence={data.confidence} />}
          {data.summary && <SummaryCard summary={data.summary} />}

          {/* Tab bar */}
          <div style={{
            display: "inline-flex",
            background: "rgba(255,255,255,0.9)",
            border: "1px solid rgba(66,20,95,0.1)",
            borderRadius: 14, padding: 4, gap: 2,
            boxShadow: "0 2px 8px rgba(66,20,95,0.06)",
          }}>
            {tabs.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                padding: "8px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                border: "none", cursor: "pointer", textTransform: "capitalize",
                transition: "all 0.2s ease",
                color: activeTab === tab ? "white" : "#6b7280",
                background: activeTab === tab
                  ? "linear-gradient(135deg,#42145f,#5a1f7a)"
                  : "transparent",
                boxShadow: activeTab === tab ? "0 2px 12px rgba(66,20,95,0.35)" : "none",
              }}>
                {tab === "georisk"
                  ? "Geo Risk"
                  : tab === "anomalies"
                    ? `Anomalies (${data.anomalies.length})`
                    : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {activeTab === "forecast" && (
            <ForecastChart chartData={chartData} anomalies={data.anomalies} />
          )}
          {activeTab === "anomalies" && (
            <AnomalyList
              anomalies={data.anomalies}
              activeAnomaly={activeAnomaly}
              anomalyExplanation={anomalyExplanation}
              explainLoading={explainLoading}
              onSelect={explainAnomaly}
            />
          )}
          {activeTab === "scenario" && (
            <ScenarioPanel
              growthRate={growthRate}
              removeOutliers={removeOutliers}
              scenarioLoading={scenarioLoading}
              scenarioChartData={scenarioChartData}
              hasScenario={!!scenarioData}
              onGrowthChange={setGrowthRate}
              onOutliersChange={setRemoveOutliers}
              onRun={runScenario}
            />
          )}
          {activeTab === "validate" && (
            <ValidationPanel periods={periods} uploadedFile={uploadedFile} />
          )}
          {activeTab === "georisk" && (
            <GeoRiskPanel
              periods={periods}
              forecastRecords={data?.forecast?.forecast ?? []}
            />
          )}
        </>
      )}

      {/* ── EMPTY STATE ── */}
      {!data && !loading && (
        <div className="card fade-up" style={{ textAlign: "center", padding: "80px 24px" }}>
          <div style={{
            width: 56, height: 56,
            background: "linear-gradient(135deg,#42145f,#6b21a8)",
            borderRadius: 16, margin: "0 auto 16px",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path d="M3 17l5-5 4 4 9-9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p style={{ fontWeight: 700, color: "#42145f", fontSize: 16, marginBottom: 6 }}>Ready to forecast</p>
          <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>
            Load the sample dataset or upload your own CSV to get started
          </p>
        </div>
      )}
    </div>
  );
}