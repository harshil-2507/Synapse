"use client";
import { useState, useEffect } from "react";
import axios from "axios";

const API = "http://localhost:8000";

interface ExposureRow {
  id: number;
  region: string;
  exposure_pct: number;
}

interface RegionDetail {
  region: string;
  exposure_pct: number;
  risk_score: number | null;
  contribution: number;
  label: string;
  color: string;
  conflict_intensity: number | null;
  gdp_growth: number | null;
  year: number | null;
}

interface WeightedRisk {
  available: boolean;
  firm_score: number;
  label: string;
  color: string;
  bg: string;
  estimated_revenue_impact_pct: number;
  region_details: RegionDetail[];
  top_risk_region: string;
  top_risk_contribution: number;
  company_name: string;
}

interface StressPoint {
  date: string;
  Forecast: number;
  Stressed: number;
  Upper: number;
  Lower: number;
}

interface Props {
  periods: number;
  forecastRecords: any[];
}

const PRESET_REGIONS = [
  // Major global economies (Top GDP powers)
  "USA", "China", "India", "Japan", "Germany", "UK", "France",
  "Italy", "Canada", "Brazil", "Russia",

  // Asia-Pacific economic + strategic hubs
  "South Korea", "Indonesia", "Australia", "Vietnam", "Thailand",
  "Philippines", "Malaysia", "Singapore",

  // Middle East / energy + geopolitical risk zones
  "Saudi Arabia", "UAE", "Iran", "Iraq", "Israel", "Qatar",
  "Turkey", "Yemen",

  // Europe (economic + geopolitical exposure)
  "Spain", "Poland", "Netherlands", "Ukraine", "Sweden",
  "Switzerland", "Belgium",

  // Africa (growth + instability regions)
  "Nigeria", "Egypt", "Sudan", "South Africa", "Ethiopia", "Kenya",

  // Americas (economic + trade exposure)
  "Mexico", "Argentina", "Colombia",

  // High-conflict / strategic tension zones
  "Pakistan", "Afghanistan", "Syria", "Myanmar"
];

let nextId = 1;

export default function GeoRiskPanel({ periods, forecastRecords }: Props) {
  const [companyName, setCompanyName] = useState("My Company");
  const [rows, setRows] = useState<ExposureRow[]>([
    { id: nextId++, region: "China", exposure_pct: 45 },
    { id: nextId++, region: "India", exposure_pct: 35 },
    { id: nextId++, region: "Germany", exposure_pct: 20 },
  ]);
  const [countries, setCountries] = useState<string[]>(PRESET_REGIONS);
  const [result, setResult] = useState<WeightedRisk | null>(null);
  const [stressed, setStressed] = useState<StressPoint[]>([]);
  const [briefing, setBriefing] = useState("");
  const [loading, setLoading] = useState(false);
  const [briefingLoading, setBriefingLoading] = useState(false);
  const [stressLoading, setStressLoading] = useState(false);

  const totalPct = rows.reduce((s, r) => s + r.exposure_pct, 0);
  const isValid = Math.abs(totalPct - 100) < 0.5 && rows.length > 0;

  useEffect(() => {
    axios.get(`${API}/api/geo/countries`)
      .then(r => { if (r.data.countries?.length) setCountries(r.data.countries); })
      .catch(() => {});
  }, []);

  const addRow = () => {
    const used = rows.map(r => r.region);
    const next = countries.find(c => !used.includes(c)) || "USA";
    setRows(prev => [...prev, { id: nextId++, region: next, exposure_pct: 0 }]);
  };

  const removeRow = (id: number) => setRows(prev => prev.filter(r => r.id !== id));

  const updateRow = (id: number, field: "region" | "exposure_pct", value: any) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: field === "exposure_pct" ? Number(value) : value } : r));
  };

  const distributeEvenly = () => {
    const each = Math.floor(100 / rows.length);
    const remainder = 100 - each * rows.length;
    setRows(prev => prev.map((r, i) => ({ ...r, exposure_pct: each + (i === 0 ? remainder : 0) })));
  };

  const runAnalysis = async () => {
    if (!isValid) return;
    setLoading(true);
    setResult(null);
    setStressed([]);
    setBriefing("");

    try {
      // Step 1: weighted firm risk
      const riskRes = await axios.post(`${API}/api/geo/weighted-risk`, {
        company_name: companyName,
        exposures: rows.map(r => ({ region: r.region, exposure_pct: r.exposure_pct })),
      });
      const riskData: WeightedRisk = riskRes.data;
      setResult(riskData);

      // Step 2: stress forecast (parallel)
      if (forecastRecords.length > 0) {
        setStressLoading(true);
        axios.post(`${API}/api/geo/stress-forecast`, {
          firm_score: riskData.firm_score,
          forecast_records: forecastRecords,
          lag_weeks: 3,
        }).then(r => {
          setStressed(r.data.stressed_forecast);
          setStressLoading(false);
        }).catch(() => setStressLoading(false));
      }

      // Step 3: AI briefing (parallel)
      setBriefingLoading(true);
      axios.post(`${API}/api/geo/briefing`, {
        company_name: companyName,
        firm_score: riskData.firm_score,
        estimated_revenue_impact_pct: riskData.estimated_revenue_impact_pct,
        region_details: riskData.region_details,
        top_risk_region: riskData.top_risk_region || "",
      }).then(r => {
        setBriefing(r.data.briefing);
        setBriefingLoading(false);
      }).catch(() => setBriefingLoading(false));

    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <style>{`
        @keyframes geoFadeUp {
          from { opacity:0; transform:translateY(8px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes dotBounce {
          0%,100% { transform:translateY(0); opacity:0.4; }
          50% { transform:translateY(-4px); opacity:1; }
        }
        @keyframes barGrow {
          from { width: 0%; }
        }
        @keyframes pctWarning {
          0%,100% { opacity:1; }
          50% { opacity:0.5; }
        }
      `}</style>

      {/* ── HEADER ── */}
      <div className="card" style={{ animation: "geoFadeUp 0.4s ease forwards" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 9,
                background: "linear-gradient(135deg, #42145f, #6b21a8)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2"/>
                  <path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"
                    stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <h2 style={{ fontWeight: 800, color: "#111827", fontSize: 16, margin: 0, letterSpacing: "-0.01em" }}>
                  Geopolitical Risk Overlay
                </h2>
                <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>
                  Enter your company's geographic revenue exposure to compute firm-level risk
                </p>
              </div>
            </div>
          </div>

          {/* Company name input */}
          <input
            value={companyName}
            onChange={e => setCompanyName(e.target.value)}
            placeholder="Company name"
            style={{
              padding: "8px 14px", borderRadius: 10, fontSize: 13, fontWeight: 600,
              border: "1px solid rgba(66,20,95,0.15)", color: "#374151",
              background: "white", outline: "none", minWidth: 200,
            }}
          />
        </div>

        {/* ── EXPOSURE INPUT TABLE ── */}
        <div style={{ marginTop: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", letterSpacing: "0.07em", textTransform: "uppercase" }}>
              Revenue Exposure by Region
            </span>
            <button onClick={distributeEvenly} style={{
              fontSize: 11, fontWeight: 600, color: "#6b21a8",
              background: "rgba(107,33,168,0.06)", border: "1px solid rgba(107,33,168,0.15)",
              borderRadius: 6, padding: "3px 10px", cursor: "pointer",
            }}>
              Distribute evenly
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {rows.map((row, idx) => (
              <div key={row.id} style={{
                display: "grid", gridTemplateColumns: "1fr 160px 36px",
                gap: 8, alignItems: "center",
                animation: `geoFadeUp 0.3s ease ${idx * 0.05}s both`,
              }}>
                {/* Region select */}
                <select
                  value={row.region}
                  onChange={e => updateRow(row.id, "region", e.target.value)}
                  style={{
                    padding: "8px 12px", borderRadius: 9, fontSize: 13, fontWeight: 600,
                    border: "1px solid rgba(66,20,95,0.12)", color: "#374151",
                    background: "white", cursor: "pointer", outline: "none",
                  }}
                >
                  {countries.map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                {/* % input + bar */}
                <div style={{ position: "relative" }}>
                  <input
                    type="number"
                    min={0} max={100}
                    value={row.exposure_pct}
                    onChange={e => updateRow(row.id, "exposure_pct", e.target.value)}
                    style={{
                      width: "100%", padding: "8px 32px 8px 12px",
                      borderRadius: 9, fontSize: 13, fontWeight: 700,
                      border: "1px solid rgba(66,20,95,0.12)", color: "#374151",
                      background: "white", outline: "none", boxSizing: "border-box",
                    }}
                  />
                  <span style={{
                    position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                    fontSize: 12, fontWeight: 700, color: "#9ca3af",
                  }}>%</span>
                </div>

                {/* Remove */}
                <button onClick={() => removeRow(row.id)} style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.1)",
                  color: "#dc2626", cursor: "pointer", fontSize: 16, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>×</button>
              </div>
            ))}
          </div>

          {/* Total row */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            marginTop: 12, paddingTop: 12, borderTop: "1px solid #f3f4f6",
          }}>
            <button onClick={addRow} style={{
              fontSize: 12, fontWeight: 600, color: "#6b21a8",
              background: "none", border: "1px dashed rgba(107,33,168,0.3)",
              borderRadius: 8, padding: "5px 14px", cursor: "pointer",
            }}>
              + Add Region
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{
                fontSize: 13, fontWeight: 800,
                color: isValid ? "#15803d" : "#dc2626",
                animation: !isValid ? "pctWarning 1.5s ease infinite" : "none",
              }}>
                {totalPct}% {isValid ? "✓" : `— must equal 100%`}
              </span>
              <button
                onClick={runAnalysis}
                disabled={loading || !isValid}
                style={{
                  padding: "9px 24px",
                  background: isValid
                    ? "linear-gradient(135deg, #42145f, #6b21a8)"
                    : "#e5e7eb",
                  color: isValid ? "white" : "#9ca3af",
                  border: "none", borderRadius: 10,
                  fontSize: 13, fontWeight: 700,
                  cursor: loading || !isValid ? "not-allowed" : "pointer",
                  boxShadow: isValid ? "0 4px 12px rgba(66,20,95,0.3)" : "none",
                  transition: "all 0.2s ease",
                }}
              >
                {loading ? "Analysing..." : "Run Analysis"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── RESULTS ── */}
      {result?.available && (
        <>
          {/* Firm Score + Region Breakdown */}
          <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 16 }}>

            {/* Firm Score Card */}
            <div className="card" style={{
              background: result.bg,
              border: `1px solid ${result.color}20`,
              animation: "geoFadeUp 0.4s ease 0.1s both",
            }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "#9ca3af", textTransform: "uppercase", margin: "0 0 14px" }}>
                Firm Geopolitical Risk Score
              </p>

              <div style={{ display: "flex", alignItems: "flex-end", gap: 6, marginBottom: 8 }}>
                <span style={{ fontSize: 56, fontWeight: 900, color: result.color, lineHeight: 1, letterSpacing: "-0.04em" }}>
                  {result.firm_score}
                </span>
                <span style={{ fontSize: 16, color: "#9ca3af", fontWeight: 600, paddingBottom: 10 }}>/100</span>
              </div>

              <span style={{
                display: "inline-block", fontSize: 12, fontWeight: 700,
                padding: "3px 12px", borderRadius: 20,
                background: `${result.color}15`, color: result.color,
                border: `1px solid ${result.color}25`, marginBottom: 20,
              }}>
                {result.label}
              </span>

              <div style={{ borderTop: `1px solid ${result.color}15`, paddingTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: "#6b7280" }}>Revenue at Risk</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: result.color }}>
                    −{result.estimated_revenue_impact_pct}%
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: "#6b7280" }}>Highest Exposure</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#111827" }}>
                    {result.top_risk_region || "—"}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: "#6b7280" }}>Regions Analysed</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#111827" }}>
                    {result.region_details.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Region Breakdown Bars */}
            <div className="card" style={{ animation: "geoFadeUp 0.4s ease 0.15s both" }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "#9ca3af", textTransform: "uppercase", margin: "0 0 16px" }}>
                Risk Contribution by Region
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {result.region_details.map((r, i) => (
                  <div key={r.region}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{r.region}</span>
                        <span style={{
                          fontSize: 10, fontWeight: 600, padding: "1px 7px", borderRadius: 4,
                          background: `${r.color}12`, color: r.color, border: `1px solid ${r.color}20`,
                        }}>
                          {r.label}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ fontSize: 11, color: "#9ca3af" }}>{r.exposure_pct}% exposure</span>
                        <span style={{ fontSize: 13, fontWeight: 800, color: r.color, minWidth: 50, textAlign: "right" }}>
                          {r.risk_score !== null ? `${r.risk_score}/100` : "N/A"}
                        </span>
                      </div>
                    </div>
                    {/* Contribution bar — shows weighted contribution to firm score */}
                    <div style={{ height: 7, background: "#f3f4f6", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{
                        height: "100%", borderRadius: 4,
                        background: r.color,
                        width: `${Math.min((r.contribution / result.firm_score) * 100, 100)}%`,
                        transition: `width 0.9s cubic-bezier(0.4,0,0.2,1) ${i * 0.1}s`,
                        boxShadow: `0 0 6px ${r.color}40`,
                      }}/>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
                      <span style={{ fontSize: 10, color: "#9ca3af" }}>
                        {r.conflict_intensity !== null ? `Conflict: ${r.conflict_intensity}/4` : ""}
                        {r.gdp_growth !== null ? ` · GDP: ${r.gdp_growth > 0 ? "+" : ""}${r.gdp_growth}%` : ""}
                        {r.year ? ` · ${r.year}` : ""}
                      </span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: r.color }}>
                        {r.contribution.toFixed(1)} pts contribution
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stress Forecast Chart */}
          {(stressed.length > 0 || stressLoading) && (
            <div className="card" style={{ animation: "geoFadeUp 0.4s ease 0.2s both" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div>
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "#9ca3af", textTransform: "uppercase", margin: "0 0 3px" }}>
                    Lag-Adjusted Stress Forecast
                  </p>
                  <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>
                    Baseline vs geopolitically stressed forecast · 3-week lag applied
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <div style={{ width: 24, height: 3, background: "#6b21a8", borderRadius: 2 }}/>
                    <span style={{ fontSize: 11, color: "#6b7280" }}>Baseline</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <div style={{ width: 24, height: 3, borderRadius: 2, borderTop: "2px dashed #dc2626", borderBottom: "none", borderLeft: "none", borderRight: "none" }}/>
                    <span style={{ fontSize: 11, color: "#6b7280" }}>Stressed</span>
                  </div>
                </div>
              </div>

              {stressLoading ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "24px 0" }}>
                  <span style={{ fontSize: 12, color: "#9ca3af" }}>Computing stress forecast</span>
                  {[0,1,2].map(i => (
                    <div key={i} style={{
                      width: 5, height: 5, borderRadius: "50%",
                      background: i === 0 ? "#da1884" : i === 1 ? "#6b21a8" : "#2563eb",
                      animation: `dotBounce 1s ease-in-out ${i*0.2}s infinite`,
                    }}/>
                  ))}
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <div style={{ minWidth: 500, position: "relative", height: 160 }}>
                    {/* Simple SVG chart — baseline vs stressed */}
                    <svg width="100%" height="160" viewBox={`0 0 ${stressed.length * 40} 160`} preserveAspectRatio="none">
                      {(() => {
                        const vals = stressed.flatMap(p => [p.Forecast, p.Stressed]);
                        const min = Math.min(...vals) * 0.95;
                        const max = Math.max(...vals) * 1.05;
                        const range = max - min || 1;
                        const w = stressed.length * 40;
                        const h = 140;

                        const px = (i: number) => (i / (stressed.length - 1)) * w;
                        const py = (v: number) => h - ((v - min) / range) * h + 10;

                        const baselinePath = stressed.map((p, i) => `${i === 0 ? "M" : "L"}${px(i)},${py(p.Forecast)}`).join(" ");
                        const stressedPath = stressed.map((p, i) => `${i === 0 ? "M" : "L"}${px(i)},${py(p.Stressed)}`).join(" ");

                        // Shaded area between
                        const areaPath = [
                          ...stressed.map((p, i) => `${i === 0 ? "M" : "L"}${px(i)},${py(p.Forecast)}`),
                          ...stressed.slice().reverse().map((p, i) => `L${px(stressed.length - 1 - i)},${py(p.Stressed)}`),
                          "Z"
                        ].join(" ");

                        return (
                          <>
                            <path d={areaPath} fill="rgba(220,38,38,0.08)" />
                            <path d={baselinePath} fill="none" stroke="#6b21a8" strokeWidth="2" strokeLinecap="round" />
                            <path d={stressedPath} fill="none" stroke="#dc2626" strokeWidth="2" strokeDasharray="5,3" strokeLinecap="round" />
                            {/* X axis labels */}
                            {stressed.map((p, i) => (
                              i % 2 === 0 && (
                                <text key={i} x={px(i)} y={155} textAnchor="middle" fontSize="9" fill="#9ca3af">
                                  {p.date.slice(5)}
                                </text>
                              )
                            ))}
                          </>
                        );
                      })()}
                    </svg>
                  </div>

                  {/* Gap summary */}
                  {stressed.length > 0 && (
                    <div style={{
                      marginTop: 12, padding: "10px 14px",
                      background: "rgba(220,38,38,0.04)",
                      border: "1px solid rgba(220,38,38,0.1)",
                      borderRadius: 10,
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                    }}>
                      <span style={{ fontSize: 12, color: "#6b7280" }}>
                        Peak stress gap (baseline vs stressed) at week {stressed.length}
                      </span>
                      <span style={{ fontSize: 14, fontWeight: 800, color: "#dc2626" }}>
                        −{((stressed[stressed.length-1].Forecast - stressed[stressed.length-1].Stressed) / stressed[stressed.length-1].Forecast * 100).toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* AI Risk Briefing */}
          <div className="card" style={{
            borderLeft: "4px solid #42145f",
            animation: "geoFadeUp 0.4s ease 0.25s both",
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: "linear-gradient(135deg, #fdf2f8, #ede9fe)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5L12 2z" fill="url(#geoGrad)"/>
                  <defs>
                    <linearGradient id="geoGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#da1884"/>
                      <stop offset="100%" stopColor="#6b21a8"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase",
                    background: "linear-gradient(90deg, #da1884, #6b21a8)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  }}>
                    AI Risk Briefing — {result.company_name}
                  </span>
                  {briefingLoading && (
                    <div style={{ display: "flex", gap: 3 }}>
                      {[0,1,2].map(i => (
                        <div key={i} style={{
                          width: 4, height: 4, borderRadius: "50%",
                          background: i === 0 ? "#da1884" : i === 1 ? "#6b21a8" : "#2563eb",
                          animation: `dotBounce 1s ease-in-out ${i*0.2}s infinite`,
                        }}/>
                      ))}
                    </div>
                  )}
                </div>
                <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.75, margin: 0 }}>
                  {briefing || (briefingLoading ? "" : "AI briefing will appear here.")}
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Empty state */}
      {!result && !loading && (
        <div className="card" style={{ textAlign: "center", padding: "48px 24px" }}>
          <div style={{
            width: 48, height: 48, background: "rgba(66,20,95,0.06)", borderRadius: 14,
            margin: "0 auto 14px", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#42145f" strokeWidth="2"/>
              <path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"
                stroke="#42145f" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <p style={{ fontWeight: 700, color: "#42145f", margin: "0 0 4px", fontSize: 15 }}>
            Enter your exposure to get started
          </p>
          <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>
            Add the regions where your company generates revenue, set the percentages to total 100%, then run the analysis
          </p>
        </div>
      )}
    </div>
  );
}