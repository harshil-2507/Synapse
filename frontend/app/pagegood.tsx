"use client";
import { useState, useCallback, useEffect } from "react";
import axios from "axios";
import { ForecastResponse, Anomaly } from "./types";
import ForecastChart from "./components/ForecastChart";
import AnomalyList from "./components/AnomalyList";
import ScenarioPanel from "./components/ScenarioPanel";
import GeoRiskPanel from "./components/GeoRiskPanel";

const API = "http://localhost:8000";

// ── INLINE WIDGET: Global Volatility Heatmap ──────────────────────────────────
function GlobalHeatmap() {
  const regions = [
    { name: "Middle East", score: 88, color: "#ef4444", countries: ["IRN", "IRQ", "SYR", "YEM"] },
    { name: "Eastern Europe", score: 74, color: "#f97316", countries: ["UKR", "BLR", "MDA", "GEO"] },
    { name: "East Asia", score: 52, color: "#eab308", countries: ["TWN", "PRK", "MMR", "PHL"] },
    { name: "Sub-Saharan Africa", score: 61, color: "#f97316", countries: ["SDN", "ETH", "MLI", "MOZ"] },
    { name: "South Asia", score: 45, color: "#eab308", countries: ["AFG", "PAK", "BGD", "NPL"] },
    { name: "Latin America", score: 38, color: "#84cc16", countries: ["VEN", "COL", "HND", "HTI"] },
    { name: "Central Asia", score: 29, color: "#22c55e", countries: ["KAZ", "UZB", "TJK", "KGZ"] },
    { name: "Western Europe", score: 18, color: "#22c55e", countries: ["DEU", "FRA", "GBR", "ITA"] },
  ];

  const getLabel = (score: number) =>
    score >= 75 ? "CRITICAL" : score >= 55 ? "HIGH" : score >= 35 ? "MODERATE" : "LOW";

  return (
    <div style={{
      background: "rgba(255,255,255,0.97)",
      border: "1px solid rgba(66,20,95,0.1)",
      borderRadius: 16,
      padding: "22px 24px",
      boxShadow: "0 2px 16px rgba(66,20,95,0.07)",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <div style={{
              width: 8, height: 8, borderRadius: "50%", background: "#ef4444",
              boxShadow: "0 0 6px rgba(239,68,68,0.6)",
              animation: "pulse 2s ease-in-out infinite",
            }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#ef4444", textTransform: "uppercase" }}>
              Live Risk Index
            </span>
          </div>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#1e1b4b" }}>
            Global Volatility Heatmap
          </h3>
        </div>
        <div style={{
          display: "flex", gap: 10, fontSize: 10, fontWeight: 700, letterSpacing: "0.06em",
          color: "#6b7280", textTransform: "uppercase", alignItems: "center",
        }}>
          {[{ c: "#22c55e", l: "Low" }, { c: "#eab308", l: "Moderate" }, { c: "#f97316", l: "High" }, { c: "#ef4444", l: "Critical" }].map(x => (
            <span key={x.l} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: x.c, display: "inline-block" }} />
              {x.l}
            </span>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
        {regions.map((r) => (
          <div key={r.name} style={{
            background: `linear-gradient(135deg, ${r.color}12 0%, ${r.color}06 100%)`,
            border: `1px solid ${r.color}30`,
            borderRadius: 12,
            padding: "14px 16px",
            position: "relative",
            overflow: "hidden",
          }}>
            {/* Background fill bar */}
            <div style={{
              position: "absolute", bottom: 0, left: 0,
              width: `${r.score}%`, height: 3,
              background: r.color, borderRadius: "0 0 0 12px", opacity: 0.6,
            }} />
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", color: r.color, marginBottom: 4, textTransform: "uppercase" }}>
              {getLabel(r.score)}
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#1e1b4b", marginBottom: 6, lineHeight: 1.3 }}>
              {r.name}
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
              <span style={{ fontSize: 26, fontWeight: 900, color: r.color, letterSpacing: "-0.03em", lineHeight: 1 }}>
                {r.score}
              </span>
              <span style={{ fontSize: 10, color: "#9ca3af", fontWeight: 600 }}>/100</span>
            </div>
            <div style={{ display: "flex", gap: 4, marginTop: 8, flexWrap: "wrap" }}>
              {r.countries.slice(0, 3).map(c => (
                <span key={c} style={{
                  fontSize: 9, fontWeight: 700, color: "#6b7280",
                  background: "rgba(0,0,0,0.04)", borderRadius: 4, padding: "2px 5px",
                  letterSpacing: "0.05em",
                }}>{c}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── INLINE WIDGET: Live Commodities Ticker ────────────────────────────────────
function CommoditiesTicker() {
  const [tick, setTick] = useState(0);

  const commodities = [
    { name: "Brent Crude", symbol: "XBR/USD", price: 87.42, change: +1.23, pct: +1.43, unit: "bbl", icon: "🛢️" },
    { name: "WTI Crude", symbol: "WTI/USD", price: 83.19, change: +0.87, pct: +1.06, unit: "bbl", icon: "⛽" },
    { name: "Natural Gas", symbol: "NG/USD", price: 2.718, change: -0.041, pct: -1.49, unit: "MMBtu", icon: "🔥" },
    { name: "Gold", symbol: "XAU/USD", price: 2334.50, change: +18.70, pct: +0.81, unit: "oz", icon: "🥇" },
    { name: "Wheat", symbol: "ZW/USD", price: 545.25, change: -6.75, pct: -1.22, unit: "bu", icon: "🌾" },
    { name: "Copper", symbol: "HG/USD", price: 4.58, change: +0.03, pct: +0.66, unit: "lb", icon: "🔧" },
  ];

  // Simulate minor fluctuations
  const [prices, setPrices] = useState(commodities.map(c => c.price));
  useEffect(() => {
    const interval = setInterval(() => {
      setPrices(prev => prev.map((p, i) => {
        const delta = (Math.random() - 0.49) * commodities[i].price * 0.0008;
        return Math.round((p + delta) * 100) / 100;
      }));
      setTick(t => t + 1);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      background: "rgba(255,255,255,0.97)",
      border: "1px solid rgba(66,20,95,0.1)",
      borderRadius: 16,
      padding: "22px 24px",
      boxShadow: "0 2px 16px rgba(66,20,95,0.07)",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <div style={{
              width: 8, height: 8, borderRadius: "50%", background: "#22c55e",
              boxShadow: "0 0 6px rgba(34,197,94,0.6)",
              animation: "pulse 1.5s ease-in-out infinite",
            }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#16a34a", textTransform: "uppercase" }}>
              Market Feed
            </span>
          </div>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#1e1b4b" }}>
            Live Oil &amp; Commodities
          </h3>
        </div>
        <span style={{
          fontSize: 10, color: "#9ca3af", fontWeight: 600,
          background: "rgba(0,0,0,0.03)", borderRadius: 6, padding: "4px 8px",
          border: "1px solid rgba(0,0,0,0.06)",
        }}>
          Simulated · Delayed 15min
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
        {commodities.map((c, i) => {
          const live = prices[i];
          const liveChange = live - c.price + c.change;
          const up = liveChange >= 0;
          return (
            <div key={c.symbol} style={{
              background: up ? "linear-gradient(135deg,#f0fdf4,#dcfce7)" : "linear-gradient(135deg,#fff1f2,#ffe4e6)",
              border: `1px solid ${up ? "#bbf7d0" : "#fecdd3"}`,
              borderRadius: 12, padding: "14px 16px",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#374151" }}>{c.name}</div>
                  <div style={{ fontSize: 9, color: "#9ca3af", fontWeight: 600, letterSpacing: "0.05em" }}>{c.symbol}</div>
                </div>
                <span style={{ fontSize: 18 }}>{c.icon}</span>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <span style={{ fontSize: 20, fontWeight: 900, color: "#1e1b4b", letterSpacing: "-0.02em" }}>
                  {live < 10 ? live.toFixed(3) : live.toFixed(2)}
                </span>
                <span style={{ fontSize: 9, color: "#6b7280", fontWeight: 600 }}>{c.unit}</span>
              </div>
              <div style={{
                display: "flex", alignItems: "center", gap: 4, marginTop: 4,
                fontSize: 11, fontWeight: 700, color: up ? "#16a34a" : "#dc2626",
              }}>
                <span>{up ? "▲" : "▼"}</span>
                <span>{Math.abs(liveChange).toFixed(2)}</span>
                <span style={{ fontWeight: 500, opacity: 0.75 }}>
                  ({up ? "+" : ""}{c.pct.toFixed(2)}%)
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── INLINE WIDGET: Hot Geopolitics News Feed ──────────────────────────────────
function GeopoliticsNewsFeed() {
  const stories = [
    {
      time: "14m ago", region: "Middle East", severity: "critical",
      headline: "Iran expands uranium enrichment capacity at Fordow facility",
      impact: "Energy +3.2% · Gold +1.1%", tags: ["Sanctions", "Nuclear"],
    },
    {
      time: "41m ago", region: "Eastern Europe", severity: "high",
      headline: "NATO activates rapid response units along eastern flank amid escalation signals",
      impact: "EUR/USD −0.4% · Defense ETF +2.7%", tags: ["NATO", "Conflict"],
    },
    {
      time: "1h ago", region: "East Asia", severity: "high",
      headline: "Taiwan Strait naval drills trigger fresh semiconductor supply chain warnings",
      impact: "SOX −1.8% · TSM −2.3%", tags: ["Trade", "Supply Chain"],
    },
    {
      time: "2h ago", region: "Sub-Saharan Africa", severity: "moderate",
      headline: "Mali junta expels ECOWAS delegation; regional stability under renewed pressure",
      impact: "CFA exposure ↑ · Cocoa +0.9%", tags: ["Governance", "Sanctions"],
    },
    {
      time: "3h ago", region: "South Asia", severity: "moderate",
      headline: "Pakistan-IMF talks stall as military spending review delays reform package",
      impact: "PKR −1.2% · Sovereign risk premium +18bps", tags: ["Debt", "IMF"],
    },
  ];

  const severityMeta = {
    critical: { color: "#ef4444", bg: "#fef2f2", border: "#fecaca", dot: "#ef4444" },
    high: { color: "#f97316", bg: "#fff7ed", border: "#fed7aa", dot: "#f97316" },
    moderate: { color: "#eab308", bg: "#fefce8", border: "#fef08a", dot: "#eab308" },
  };

  return (
    <div style={{
      background: "rgba(255,255,255,0.97)",
      border: "1px solid rgba(66,20,95,0.1)",
      borderRadius: 16,
      padding: "22px 24px",
      boxShadow: "0 2px 16px rgba(66,20,95,0.07)",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <div style={{
              width: 8, height: 8, borderRadius: "50%", background: "#6b21a8",
              boxShadow: "0 0 6px rgba(107,33,168,0.5)",
              animation: "pulse 2.5s ease-in-out infinite",
            }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#6b21a8", textTransform: "uppercase" }}>
              Signal Feed
            </span>
          </div>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#1e1b4b" }}>
            Hot Geopolitical Events
          </h3>
        </div>
        <span style={{ fontSize: 10, color: "#9ca3af", fontWeight: 600, background: "rgba(0,0,0,0.03)", borderRadius: 6, padding: "4px 8px", border: "1px solid rgba(0,0,0,0.06)" }}>
          AI-curated · 5 sources
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {stories.map((s, i) => {
          const meta = severityMeta[s.severity as keyof typeof severityMeta];
          return (
            <div key={i} style={{
              background: meta.bg,
              border: `1px solid ${meta.border}`,
              borderRadius: 12,
              padding: "14px 16px",
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: 12,
              alignItems: "start",
            }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{
                    fontSize: 9, fontWeight: 800, color: meta.color,
                    background: "rgba(255,255,255,0.7)", borderRadius: 5,
                    padding: "2px 7px", textTransform: "uppercase", letterSpacing: "0.08em",
                    border: `1px solid ${meta.border}`,
                  }}>
                    {s.severity}
                  </span>
                  <span style={{ fontSize: 10, color: "#6b7280", fontWeight: 600 }}>{s.region}</span>
                  <span style={{ fontSize: 10, color: "#9ca3af" }}>·</span>
                  <span style={{ fontSize: 10, color: "#9ca3af" }}>{s.time}</span>
                </div>
                <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 700, color: "#111827", lineHeight: 1.4 }}>
                  {s.headline}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 11, color: "#374151", fontWeight: 600, fontFamily: "monospace" }}>
                    📊 {s.impact}
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
                {s.tags.map(t => (
                  <span key={t} style={{
                    fontSize: 9, fontWeight: 700, color: "#6b7280",
                    background: "rgba(255,255,255,0.8)", borderRadius: 5,
                    padding: "2px 7px", letterSpacing: "0.06em", whiteSpace: "nowrap",
                    border: "1px solid rgba(0,0,0,0.08)",
                  }}>{t}</span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── INLINE WIDGET: Sanctions Exposure Tracker ─────────────────────────────────
function SanctionsTracker() {
  const entities = [
    { country: "Russia", exposure: 91, sectors: ["Energy", "Finance", "Defense"], regimes: ["US OFAC", "EU", "UK"] },
    { country: "Iran", exposure: 87, sectors: ["Energy", "IRGC", "Shipping"], regimes: ["UN", "US OFAC", "EU"] },
    { country: "North Korea", exposure: 78, sectors: ["Arms", "Cyber", "Finance"], regimes: ["UN", "US", "EU"] },
    { country: "Venezuela", exposure: 62, sectors: ["Oil", "Finance", "Gold"], regimes: ["US OFAC", "EU"] },
    { country: "Myanmar", exposure: 44, sectors: ["Military", "Jade", "Timber"], regimes: ["US", "EU", "UK"] },
    { country: "Belarus", exposure: 38, sectors: ["Finance", "Tech", "Potash"], regimes: ["US", "EU", "UK"] },
  ];

  return (
    <div style={{
      background: "rgba(255,255,255,0.97)",
      border: "1px solid rgba(66,20,95,0.1)",
      borderRadius: 16,
      padding: "22px 24px",
      boxShadow: "0 2px 16px rgba(66,20,95,0.07)",
    }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <div style={{
            width: 8, height: 8, borderRadius: "50%", background: "#7c3aed",
            boxShadow: "0 0 6px rgba(124,58,237,0.5)",
          }} />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#7c3aed", textTransform: "uppercase" }}>
            Compliance Layer
          </span>
        </div>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#1e1b4b" }}>
          Sanctions Exposure Index
        </h3>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {entities.map((e) => {
          const color = e.exposure >= 80 ? "#ef4444" : e.exposure >= 60 ? "#f97316" : "#eab308";
          return (
            <div key={e.country} style={{
              display: "grid", gridTemplateColumns: "96px 1fr 180px",
              alignItems: "center", gap: 12, padding: "10px 12px",
              background: "rgba(0,0,0,0.02)", borderRadius: 10,
              border: "1px solid rgba(0,0,0,0.05)",
            }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: "#111827" }}>{e.country}</div>
                <div style={{ fontSize: 9, color: "#9ca3af", fontWeight: 600, marginTop: 2 }}>
                  {e.regimes.join(" · ")}
                </div>
              </div>
              <div>
                <div style={{ height: 6, background: "#f3f4f6", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${e.exposure}%`, background: color, borderRadius: 3, transition: "width 0.6s ease" }} />
                </div>
                <div style={{ display: "flex", gap: 4, marginTop: 6, flexWrap: "wrap" }}>
                  {e.sectors.map(s => (
                    <span key={s} style={{ fontSize: 9, color: "#6b7280", background: "rgba(0,0,0,0.05)", borderRadius: 4, padding: "1px 5px", fontWeight: 600 }}>{s}</span>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 3, justifyContent: "flex-end" }}>
                <span style={{ fontSize: 22, fontWeight: 900, color, letterSpacing: "-0.03em" }}>{e.exposure}</span>
                <span style={{ fontSize: 10, color: "#9ca3af", fontWeight: 600 }}>/100</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── INLINE WIDGET: Conflict Intensity Monitor ─────────────────────────────────
function ConflictMonitor() {
  const conflicts = [
    { name: "Russia–Ukraine War", intensity: 96, phase: "Active Combat", trend: "stable", fatalities: "800K+", started: "Feb 2022" },
    { name: "Gaza–Israel Conflict", intensity: 89, phase: "Escalating", trend: "up", fatalities: "35K+", started: "Oct 2023" },
    { name: "Sudan Civil War", intensity: 76, phase: "Active", trend: "up", fatalities: "15K+", started: "Apr 2023" },
    { name: "Sahel Insurgency", intensity: 58, phase: "Ongoing", trend: "stable", fatalities: "8K/yr", started: "2012" },
    { name: "Myanmar Civil War", intensity: 52, phase: "Fragmented", trend: "stable", fatalities: "6K+", started: "Feb 2021" },
    { name: "Haiti Gang Crisis", intensity: 41, phase: "Deteriorating", trend: "up", fatalities: "1.5K/yr", started: "2021" },
  ];

  return (
    <div style={{
      background: "rgba(255,255,255,0.97)",
      border: "1px solid rgba(66,20,95,0.1)",
      borderRadius: 16,
      padding: "22px 24px",
      boxShadow: "0 2px 16px rgba(66,20,95,0.07)",
    }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#dc2626", animation: "pulse 1.8s ease-in-out infinite", boxShadow: "0 0 6px rgba(220,38,38,0.5)" }} />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#dc2626", textTransform: "uppercase" }}>
            Threat Monitor
          </span>
        </div>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#1e1b4b" }}>
          Conflict Intensity Monitor
        </h3>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {conflicts.map((c) => {
          const color = c.intensity >= 80 ? "#ef4444" : c.intensity >= 60 ? "#f97316" : "#eab308";
          const trendIcon = c.trend === "up" ? "↑" : c.trend === "down" ? "↓" : "→";
          const trendColor = c.trend === "up" ? "#ef4444" : c.trend === "down" ? "#22c55e" : "#9ca3af";
          return (
            <div key={c.name} style={{
              display: "grid", gridTemplateColumns: "1fr 60px 90px",
              gap: 12, alignItems: "center",
              padding: "10px 12px",
              background: "rgba(0,0,0,0.02)",
              borderRadius: 10, border: "1px solid rgba(0,0,0,0.05)",
            }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: "#111827" }}>{c.name}</span>
                  <span style={{ fontSize: 9, fontWeight: 700, color: trendColor }}>{trendIcon}</span>
                </div>
                <div style={{ height: 5, background: "#f3f4f6", borderRadius: 3 }}>
                  <div style={{ height: "100%", width: `${c.intensity}%`, background: `linear-gradient(90deg, ${color}99, ${color})`, borderRadius: 3 }} />
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                  <span style={{ fontSize: 9, color: "#9ca3af" }}>{c.phase}</span>
                  <span style={{ fontSize: 9, color: "#9ca3af" }}>Since {c.started}</span>
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 9, color: "#9ca3af", fontWeight: 600, marginBottom: 2 }}>Deaths</div>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#374151" }}>{c.fatalities}</div>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 2, justifyContent: "flex-end" }}>
                <span style={{ fontSize: 20, fontWeight: 900, color, letterSpacing: "-0.03em" }}>{c.intensity}</span>
                <span style={{ fontSize: 9, color: "#9ca3af" }}>/100</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── INLINE WIDGET: Macro-Political Shock Radar ────────────────────────────────
function MacroPoliticalRadar() {
  const shocks = [
    { label: "Election Volatility", value: 72, icon: "🗳️", desc: "12 major elections in 2025 H2" },
    { label: "Coup/Regime Risk", value: 48, icon: "⚠️", desc: "3 states in fragile transition" },
    { label: "Trade War Exposure", value: 65, icon: "⚡", desc: "US-China tariff escalation" },
    { label: "Currency Crisis Prob.", value: 39, icon: "💱", desc: "EM debt cycle stress" },
    { label: "Food Security Index", value: 58, icon: "🌍", desc: "Climate-driven disruption" },
    { label: "Cyber-State Risk", value: 54, icon: "🛡️", desc: "Critical infra targeting" },
  ];

  return (
    <div style={{
      background: "rgba(255,255,255,0.97)",
      border: "1px solid rgba(66,20,95,0.1)",
      borderRadius: 16,
      padding: "22px 24px",
      boxShadow: "0 2px 16px rgba(66,20,95,0.07)",
    }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#0ea5e9", boxShadow: "0 0 6px rgba(14,165,233,0.5)" }} />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#0ea5e9", textTransform: "uppercase" }}>
            Macro Intelligence
          </span>
        </div>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#1e1b4b" }}>
          Macro-Political Shock Indicators
        </h3>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
        {shocks.map((s) => {
          const color = s.value >= 70 ? "#ef4444" : s.value >= 50 ? "#f97316" : "#22c55e";
          const circumference = 2 * Math.PI * 20;
          const dash = (s.value / 100) * circumference;
          return (
            <div key={s.label} style={{
              background: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.05)",
              borderRadius: 12, padding: "14px 14px",
              display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
            }}>
              <svg width="60" height="60" viewBox="0 0 50 50" style={{ marginBottom: 8 }}>
                <circle cx="25" cy="25" r="20" fill="none" stroke="#f3f4f6" strokeWidth="4" />
                <circle cx="25" cy="25" r="20" fill="none" stroke={color} strokeWidth="4"
                  strokeDasharray={`${dash} ${circumference}`}
                  strokeLinecap="round"
                  transform="rotate(-90 25 25)"
                />
                <text x="25" y="29" textAnchor="middle" fontSize="11" fontWeight="800" fill={color}>{s.value}</text>
              </svg>
              <div style={{ fontSize: 16, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#1e1b4b", lineHeight: 1.3, marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 10, color: "#9ca3af", lineHeight: 1.4 }}>{s.desc}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── MAIN DASHBOARD ─────────────────────────────────────────────────────────────
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
    "overview" | "forecast" | "anomalies" | "scenario" | "georisk"
  >("overview");

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

  const tabs = ["overview", "forecast", "anomalies", "scenario", "georisk"] as const;

  const heroStats = [
    {
      label: "Active Conflicts",
      value: "38",
      suffix: "zones",
      icon: "M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z",
    },
    {
      label: "Sanctions Regimes",
      value: "14",
      suffix: "active",
      icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    },
    {
      label: "Risk Alerts Today",
      value: "12",
      suffix: "new",
      icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
    },
    {
      label: "Prediction Horizon",
      value: `${periods}`,
      suffix: "wks",
      icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
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
        @keyframes statCountIn {
          from { opacity:0; transform:translateY(8px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>

      {/* ── HERO ── */}
      <div style={{
        background: "linear-gradient(135deg, #0f0c29 0%, #1a0533 30%, #2d0f47 60%, #42145f 85%, #1e3a5f 100%)",
        borderRadius: 20,
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 8px 48px rgba(15,12,41,0.5)",
        animation: "heroFadeUp 0.5s ease forwards",
      }}>
        {/* Decorative orbs */}
        <div style={{ position: "absolute", top: -100, right: -80, width: 320, height: 320, background: "radial-gradient(circle,rgba(239,68,68,0.10) 0%,transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -80, left: "30%", width: 260, height: 260, background: "radial-gradient(circle,rgba(255,255,255,0.03) 0%,transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "30%", right: "20%", width: 160, height: 160, background: "radial-gradient(circle,rgba(14,165,233,0.08) 0%,transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
        {/* Globe SVG watermark */}
        <svg style={{ position: "absolute", right: 320, top: "50%", transform: "translateY(-50%)", opacity: 0.04, pointerEvents: "none" }} width="220" height="220" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="1" />
          <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" stroke="white" strokeWidth="1" />
          <path d="M2 12h20" stroke="white" strokeWidth="1" />
          <path d="M2 7h20M2 17h20" stroke="white" strokeWidth="0.5" />
        </svg>

        {/* TOP: title + buttons */}
        <div style={{ padding: "32px 36px 24px", position: "relative" }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 24 }}>
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.35)", borderRadius: 20, padding: "3px 12px", marginBottom: 14 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444", animation: "pulse 1.5s infinite" }} />
                <span style={{ fontSize: 11, color: "#fca5a5", fontWeight: 600, letterSpacing: "0.06em" }}>LIVE · Geopolitical Intelligence</span>
              </div>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: "white", letterSpacing: "-0.025em", lineHeight: 1.25, margin: "0 0 10px", maxWidth: 540 }}>
                Synapse — Geopolitical<br />Economic Prediction Engine
              </h1>
              <p style={{ color: "rgba(186,230,253,0.7)", fontSize: 13, lineHeight: 1.65, margin: 0, maxWidth: 460 }}>
                Geopolitical risk modeling as a first-class signal layer — forecasts that dynamically adjust for regional instability, conflict intensity, sanctions exposure, and macro-political shocks.
              </p>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, flexShrink: 0 }}>
              <button onClick={loadDefault} disabled={loading} style={{
                padding: "10px 22px", background: "white", color: "#0f0c29", border: "none",
                borderRadius: 10, fontSize: 13, fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1,
                boxShadow: "0 2px 12px rgba(0,0,0,0.3)", transition: "transform 0.15s ease",
              }}>
                {loading ? "Loading..." : "Load Market Data"}
              </button>
              <label style={{
                padding: "10px 22px", background: "rgba(255,255,255,0.1)", color: "white",
                border: "1px solid rgba(255,255,255,0.18)", borderRadius: 10, fontSize: 13,
                fontWeight: 600, cursor: "pointer", display: "inline-block",
              }}>
                Ingest Dataset (CSV)
                <input type="file" accept=".csv" onChange={handleUpload} style={{ display: "none" }} />
              </label>
              {uploadedFile && (
                <button onClick={() => { setUploadedFile(null); loadDefault(); }} style={{
                  padding: "10px 16px", background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.55)",
                  border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 13, cursor: "pointer",
                }}>✕ Reset</button>
              )}
            </div>
          </div>

          {/* Horizon pills */}
          <div style={{ marginTop: 20, paddingTop: 18, borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 11, color: "rgba(186,230,253,0.6)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", flexShrink: 0 }}>
              Forecast Horizon
            </span>
            <div style={{ display: "flex", gap: 5 }}>
              {[4, 8, 12, 16, 20, 26].map(w => (
                <button key={w} onClick={() => setPeriods(w)} style={{
                  padding: "4px 12px", borderRadius: 7, fontSize: 12, fontWeight: 600,
                  border: "none", cursor: "pointer", transition: "all 0.15s ease",
                  background: periods === w ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.07)",
                  color: periods === w ? "#0f0c29" : "rgba(255,255,255,0.6)",
                  boxShadow: periods === w ? "0 2px 8px rgba(0,0,0,0.3)" : "none",
                }}>{w}w</button>
              ))}
            </div>
          </div>
        </div>

        {/* BOTTOM: feature pills + stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          {/* LEFT: feature pills */}
          <div style={{ padding: "22px 36px 28px", borderRight: "1px solid rgba(255,255,255,0.07)", display: "flex", flexDirection: "column", justifyContent: "center", gap: 12 }}>
            {/* Animated SVG line */}
            <svg style={{ position: "absolute", bottom: 0, left: 0, right: 0, opacity: 0.07, pointerEvents: "none" }} height="70" viewBox="0 0 600 70" preserveAspectRatio="none">
              <defs>
                <linearGradient id="geoLineGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="50%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#0ea5e9" />
                </linearGradient>
              </defs>
              <polyline points="0,55 80,50 160,38 220,45 280,22 350,32 420,16 500,24 600,8"
                fill="none" stroke="url(#geoLineGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(239,68,68,0.8)", textTransform: "uppercase", margin: 0 }}>
              Powered by · Geopolitical AI
            </p>
            <p style={{ fontSize: 18, fontWeight: 800, color: "white", lineHeight: 1.3, margin: 0, letterSpacing: "-0.02em" }}>
              From instability signals to{" "}
              <span style={{ background: "linear-gradient(90deg, #fca5a5, #c084fc, #7dd3fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                market foresight
              </span>
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[
                { icon: "M12 2a10 10 0 100 20 10 10 0 000-20z", label: "Risk Heatmap" },
                { icon: "M13 10V3L4 14h7v7l9-11h-7z", label: "Conflict Monitor" },
                { icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", label: "Sanctions Layer" },
                { icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", label: "Prophet Forecast" },
              ].map(f => (
                <div key={f.label} style={{
                  display: "flex", alignItems: "center", gap: 6,
                  background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)",
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

          {/* RIGHT: stats grid */}
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
                }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <path d={s.icon} stroke="rgba(255,255,255,0.75)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                    <span style={{ fontSize: 28, fontWeight: 800, color: "white", letterSpacing: "-0.03em", lineHeight: 1 }}>{s.value}</span>
                    {s.suffix && <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.4)" }}>{s.suffix}</span>}
                  </div>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", margin: "5px 0 0", fontWeight: 500 }}>{s.label}</p>
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
            background: "linear-gradient(135deg,#0f0c29,#42145f)",
            borderRadius: 14, margin: "0 auto 16px",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ animation: "spin 1s linear infinite" }}>
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
                stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <p style={{ fontWeight: 600, color: "#0f0c29", marginBottom: 4 }}>Ingesting geopolitical signals…</p>
          <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>Calibrating forecast against risk layers</p>
        </div>
      )}

      {/* ── TAB BAR (always visible after load) ── */}
      {data && !loading && (
        <>
          <div style={{
            display: "inline-flex",
            background: "rgba(255,255,255,0.9)",
            border: "1px solid rgba(66,20,95,0.1)",
            borderRadius: 14, padding: 4, gap: 2,
            boxShadow: "0 2px 8px rgba(15,12,41,0.08)",
          }}>
            {tabs.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                padding: "8px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                border: "none", cursor: "pointer",
                transition: "all 0.2s ease",
                color: activeTab === tab ? "white" : "#6b7280",
                background: activeTab === tab
                  ? "linear-gradient(135deg,#0f0c29,#42145f)"
                  : "transparent",
                boxShadow: activeTab === tab ? "0 2px 12px rgba(15,12,41,0.35)" : "none",
              }}>
                {tab === "georisk" ? "Geo Risk Model"
                  : tab === "anomalies" ? `Anomalies (${data.anomalies.length})`
                    : tab === "overview" ? "🌍 Overview"
                      : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* ── OVERVIEW TAB: all geo widgets ── */}
          {activeTab === "overview" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <GlobalHeatmap />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <CommoditiesTicker />
                <GeopoliticsNewsFeed />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <SanctionsTracker />
                <ConflictMonitor />
              </div>
              <MacroPoliticalRadar />
            </div>
          )}

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
            background: "linear-gradient(135deg,#0f0c29,#42145f)",
            borderRadius: 16, margin: "0 auto 16px",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" />
              <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" stroke="white" strokeWidth="1.5" />
              <path d="M2 12h20" stroke="white" strokeWidth="1.5" />
            </svg>
          </div>
          <p style={{ fontWeight: 700, color: "#0f0c29", fontSize: 16, marginBottom: 6 }}>Ready to analyse risk</p>
          <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>
            Load market data or upload a CSV to activate geopolitical signal layers
          </p>
        </div>
      )}
    </div>
  );
}
