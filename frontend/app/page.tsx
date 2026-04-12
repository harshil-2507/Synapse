"use client";
import { useState, useCallback, useEffect } from "react";
import axios from "axios";
import { ForecastResponse } from "./types";
import GeoRiskPanel from "./components/GeoRiskPanel";

const API = "http://localhost:8000";

// ─────────────────────────────────────────────────────────────────────────────
// WIDGET 1 · Global Volatility Heatmap (KEPT — good)
// ─────────────────────────────────────────────────────────────────────────────
function GlobalHeatmap() {
  const regions = [
    { name: "Middle East",       score: 88, color: "#ef4444", countries: ["IRN","IRQ","SYR","YEM"] },
    { name: "Eastern Europe",    score: 74, color: "#f97316", countries: ["UKR","BLR","MDA","GEO"] },
    { name: "Sub-Saharan Africa",score: 61, color: "#f97316", countries: ["SDN","ETH","MLI","MOZ"] },
    { name: "East Asia",         score: 52, color: "#eab308", countries: ["TWN","PRK","MMR","PHL"] },
    { name: "South Asia",        score: 45, color: "#eab308", countries: ["AFG","PAK","BGD","NPL"] },
    { name: "Latin America",     score: 38, color: "#84cc16", countries: ["VEN","COL","HND","HTI"] },
    { name: "Central Asia",      score: 29, color: "#22c55e", countries: ["KAZ","UZB","TJK","KGZ"] },
    { name: "Western Europe",    score: 18, color: "#22c55e", countries: ["DEU","FRA","GBR","ITA"] },
  ];
  const getLabel = (s: number) => s >= 75 ? "CRITICAL" : s >= 55 ? "HIGH" : s >= 35 ? "MODERATE" : "LOW";

  return (
    <div style={{ background:"rgba(255,255,255,0.97)", border:"1px solid rgba(66,20,95,0.1)", borderRadius:16, padding:"22px 24px", boxShadow:"0 2px 16px rgba(66,20,95,0.07)" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:"#ef4444", boxShadow:"0 0 6px rgba(239,68,68,0.6)", animation:"pulse 2s ease-in-out infinite" }} />
            <span style={{ fontSize:11, fontWeight:700, letterSpacing:"0.1em", color:"#ef4444", textTransform:"uppercase" }}>Live Risk Index</span>
          </div>
          <h3 style={{ margin:0, fontSize:15, fontWeight:800, color:"#1e1b4b" }}>Global Volatility Heatmap</h3>
        </div>
        <div style={{ display:"flex", gap:10, fontSize:10, fontWeight:700, letterSpacing:"0.06em", color:"#6b7280", textTransform:"uppercase", alignItems:"center" }}>
          {[{c:"#22c55e",l:"Low"},{c:"#eab308",l:"Moderate"},{c:"#f97316",l:"High"},{c:"#ef4444",l:"Critical"}].map(x=>(
            <span key={x.l} style={{ display:"flex", alignItems:"center", gap:4 }}>
              <span style={{ width:8, height:8, borderRadius:2, background:x.c, display:"inline-block" }} />{x.l}
            </span>
          ))}
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
        {regions.map(r=>(
          <div key={r.name} style={{ background:`linear-gradient(135deg,${r.color}12 0%,${r.color}06 100%)`, border:`1px solid ${r.color}30`, borderRadius:12, padding:"14px 16px", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", bottom:0, left:0, width:`${r.score}%`, height:3, background:r.color, borderRadius:"0 0 0 12px", opacity:0.6 }} />
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.07em", color:r.color, marginBottom:4, textTransform:"uppercase" }}>{getLabel(r.score)}</div>
            <div style={{ fontSize:12, fontWeight:700, color:"#1e1b4b", marginBottom:6, lineHeight:1.3 }}>{r.name}</div>
            <div style={{ display:"flex", alignItems:"baseline", gap:3 }}>
              <span style={{ fontSize:26, fontWeight:900, color:r.color, letterSpacing:"-0.03em", lineHeight:1 }}>{r.score}</span>
              <span style={{ fontSize:10, color:"#9ca3af", fontWeight:600 }}>/100</span>
            </div>
            <div style={{ display:"flex", gap:4, marginTop:8, flexWrap:"wrap" }}>
              {r.countries.slice(0,3).map(c=>(
                <span key={c} style={{ fontSize:9, fontWeight:700, color:"#6b7280", background:"rgba(0,0,0,0.04)", borderRadius:4, padding:"2px 5px", letterSpacing:"0.05em" }}>{c}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WIDGET 2 · Live Commodities Ticker (KEPT — good)
// ─────────────────────────────────────────────────────────────────────────────
function CommoditiesTicker() {
  const base = [
    { name:"Brent Crude",  symbol:"XBR/USD", price:87.42,   change:+1.23,  pct:+1.43, unit:"bbl",   icon:"🛢️" },
    { name:"WTI Crude",    symbol:"WTI/USD", price:83.19,   change:+0.87,  pct:+1.06, unit:"bbl",   icon:"⛽" },
    { name:"Natural Gas",  symbol:"NG/USD",  price:2.718,   change:-0.041, pct:-1.49, unit:"MMBtu", icon:"🔥" },
    { name:"Gold",         symbol:"XAU/USD", price:2334.50, change:+18.70, pct:+0.81, unit:"oz",    icon:"🥇" },
    { name:"Wheat",        symbol:"ZW/USD",  price:545.25,  change:-6.75,  pct:-1.22, unit:"bu",    icon:"🌾" },
    { name:"Copper",       symbol:"HG/USD",  price:4.58,    change:+0.03,  pct:+0.66, unit:"lb",    icon:"🔧" },
  ];
  const [prices, setPrices] = useState(base.map(c=>c.price));
  useEffect(()=>{
    const iv = setInterval(()=>{
      setPrices(prev=>prev.map((p,i)=>Math.round((p+(Math.random()-0.49)*base[i].price*0.0008)*100)/100));
    },2800);
    return ()=>clearInterval(iv);
  },[]);

  return (
    <div style={{ background:"rgba(255,255,255,0.97)", border:"1px solid rgba(66,20,95,0.1)", borderRadius:16, padding:"22px 24px", boxShadow:"0 2px 16px rgba(66,20,95,0.07)" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:"#22c55e", boxShadow:"0 0 6px rgba(34,197,94,0.6)", animation:"pulse 1.5s ease-in-out infinite" }} />
            <span style={{ fontSize:11, fontWeight:700, letterSpacing:"0.1em", color:"#16a34a", textTransform:"uppercase" }}>Market Feed</span>
          </div>
          <h3 style={{ margin:0, fontSize:15, fontWeight:800, color:"#1e1b4b" }}>Live Oil &amp; Commodities</h3>
        </div>
        <span style={{ fontSize:10, color:"#9ca3af", fontWeight:600, background:"rgba(0,0,0,0.03)", borderRadius:6, padding:"4px 8px", border:"1px solid rgba(0,0,0,0.06)" }}>Simulated · Delayed 15min</span>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
        {base.map((c,i)=>{
          const live=prices[i];
          const diff=live-c.price+c.change;
          const up=diff>=0;
          return (
            <div key={c.symbol} style={{ background:up?"linear-gradient(135deg,#f0fdf4,#dcfce7)":"linear-gradient(135deg,#fff1f2,#ffe4e6)", border:`1px solid ${up?"#bbf7d0":"#fecdd3"}`, borderRadius:12, padding:"14px 16px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                <div>
                  <div style={{ fontSize:11, fontWeight:800, color:"#374151" }}>{c.name}</div>
                  <div style={{ fontSize:9, color:"#9ca3af", fontWeight:600, letterSpacing:"0.05em" }}>{c.symbol}</div>
                </div>
                <span style={{ fontSize:18 }}>{c.icon}</span>
              </div>
              <div style={{ display:"flex", alignItems:"baseline", gap:4 }}>
                <span style={{ fontSize:20, fontWeight:900, color:"#1e1b4b", letterSpacing:"-0.02em" }}>{live<10?live.toFixed(3):live.toFixed(2)}</span>
                <span style={{ fontSize:9, color:"#6b7280", fontWeight:600 }}>{c.unit}</span>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:4, marginTop:4, fontSize:11, fontWeight:700, color:up?"#16a34a":"#dc2626" }}>
                <span>{up?"▲":"▼"}</span>
                <span>{Math.abs(diff).toFixed(2)}</span>
                <span style={{ fontWeight:500, opacity:0.75 }}>({up?"+":""}{c.pct.toFixed(2)}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WIDGET 3 · Hot Geopolitical Events (KEPT — good)
// ─────────────────────────────────────────────────────────────────────────────
function GeopoliticsNewsFeed() {
  const stories = [
    { time:"14m ago", region:"Middle East",    severity:"critical", headline:"Iran expands uranium enrichment capacity at Fordow facility",                     impact:"Energy +3.2% · Gold +1.1%",         tags:["Sanctions","Nuclear"]    },
    { time:"41m ago", region:"Eastern Europe", severity:"high",     headline:"NATO activates rapid response units along eastern flank amid escalation signals", impact:"EUR/USD −0.4% · Defense ETF +2.7%", tags:["NATO","Conflict"]        },
    { time:"1h ago",  region:"East Asia",      severity:"high",     headline:"Taiwan Strait naval drills trigger fresh semiconductor supply chain warnings",     impact:"SOX −1.8% · TSM −2.3%",            tags:["Trade","Supply Chain"]   },
    { time:"2h ago",  region:"Sub-Saharan",    severity:"moderate", headline:"Mali junta expels ECOWAS delegation; regional stability under renewed pressure",  impact:"CFA exposure ↑ · Cocoa +0.9%",      tags:["Governance","Sanctions"] },
    { time:"3h ago",  region:"South Asia",     severity:"moderate", headline:"Pakistan-IMF talks stall as military spending review delays reform package",       impact:"PKR −1.2% · Sovereign risk +18bps", tags:["Debt","IMF"]             },
  ];
  const sev: Record<string,{color:string;bg:string;border:string}> = {
    critical:{ color:"#ef4444", bg:"#fef2f2", border:"#fecaca" },
    high:    { color:"#f97316", bg:"#fff7ed", border:"#fed7aa" },
    moderate:{ color:"#eab308", bg:"#fefce8", border:"#fef08a" },
  };
  return (
    <div style={{ background:"rgba(255,255,255,0.97)", border:"1px solid rgba(66,20,95,0.1)", borderRadius:16, padding:"22px 24px", boxShadow:"0 2px 16px rgba(66,20,95,0.07)" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:"#6b21a8", boxShadow:"0 0 6px rgba(107,33,168,0.5)", animation:"pulse 2.5s ease-in-out infinite" }} />
            <span style={{ fontSize:11, fontWeight:700, letterSpacing:"0.1em", color:"#6b21a8", textTransform:"uppercase" }}>Signal Feed</span>
          </div>
          <h3 style={{ margin:0, fontSize:15, fontWeight:800, color:"#1e1b4b" }}>Hot Geopolitical Events</h3>
        </div>
        <span style={{ fontSize:10, color:"#9ca3af", fontWeight:600, background:"rgba(0,0,0,0.03)", borderRadius:6, padding:"4px 8px", border:"1px solid rgba(0,0,0,0.06)" }}>AI-curated · 5 sources</span>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {stories.map((s,i)=>{
          const m=sev[s.severity];
          return (
            <div key={i} style={{ background:m.bg, border:`1px solid ${m.border}`, borderRadius:12, padding:"14px 16px", display:"grid", gridTemplateColumns:"1fr auto", gap:12, alignItems:"start" }}>
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                  <span style={{ fontSize:9, fontWeight:800, color:m.color, background:"rgba(255,255,255,0.7)", borderRadius:5, padding:"2px 7px", textTransform:"uppercase", letterSpacing:"0.08em", border:`1px solid ${m.border}` }}>{s.severity}</span>
                  <span style={{ fontSize:10, color:"#6b7280", fontWeight:600 }}>{s.region}</span>
                  <span style={{ fontSize:10, color:"#9ca3af" }}>· {s.time}</span>
                </div>
                <p style={{ margin:"0 0 8px", fontSize:13, fontWeight:700, color:"#111827", lineHeight:1.4 }}>{s.headline}</p>
                <span style={{ fontSize:11, color:"#374151", fontWeight:600, fontFamily:"monospace" }}>📊 {s.impact}</span>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:4, alignItems:"flex-end" }}>
                {s.tags.map(t=>(
                  <span key={t} style={{ fontSize:9, fontWeight:700, color:"#6b7280", background:"rgba(255,255,255,0.8)", borderRadius:5, padding:"2px 7px", letterSpacing:"0.06em", whiteSpace:"nowrap", border:"1px solid rgba(0,0,0,0.08)" }}>{t}</span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WIDGET 4 · Geo-Adjusted Price Forecast  (NEW · Prediction Flow)
// ─────────────────────────────────────────────────────────────────────────────
function GeoPriceForecast() {
  const [asset, setAsset] = useState("Brent Crude");
  const assets: Record<string,{unit:string;weeks:number[];riskAdj:number[];baseline:number[]}> = {
    "Brent Crude": { unit:"$/bbl",  weeks:[87.4,89.1,91.8,88.3,93.5,96.2,94.7,98.1], riskAdj:[87.4,91.5,96.2,91.0,99.8,103.4,101.2,106.5], baseline:[87.4,87.9,88.5,88.2,89.0,89.7,90.1,90.8] },
    "Gold":        { unit:"$/oz",   weeks:[2334,2351,2389,2362,2410,2445,2428,2467],  riskAdj:[2334,2378,2431,2398,2468,2512,2490,2543],    baseline:[2334,2340,2348,2345,2355,2363,2370,2378] },
    "Wheat":       { unit:"¢/bu",   weeks:[545,539,551,562,548,571,580,568],           riskAdj:[545,543,568,584,570,598,612,597],             baseline:[545,547,549,551,553,555,558,560] },
  };
  const d = assets[asset];
  const maxVal = Math.max(...d.riskAdj)*1.04;
  const minVal = Math.min(...d.baseline)*0.97;
  const range  = maxVal-minVal;
  const W=520; const H=160; const PAD={l:44,r:16,t:16,b:28};
  const cW=W-PAD.l-PAD.r; const cH=H-PAD.t-PAD.b;
  const toY=(v:number)=>PAD.t+cH-((v-minVal)/range)*cH;
  const toX=(i:number)=>PAD.l+i*(cW/(d.weeks.length-1));
  const line=(arr:number[])=>arr.map((v,i)=>`${i===0?"M":"L"}${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(" ");
  const area=(arr:number[])=>line(arr)+` L${toX(arr.length-1).toFixed(1)},${(PAD.t+cH).toFixed(1)} L${toX(0).toFixed(1)},${(PAD.t+cH).toFixed(1)} Z`;
  const riskUplift=((d.riskAdj[7]-d.weeks[7])/d.weeks[7]*100).toFixed(1);

  return (
    <div style={{ background:"rgba(255,255,255,0.97)", border:"1px solid rgba(66,20,95,0.1)", borderRadius:16, padding:"22px 24px", boxShadow:"0 2px 16px rgba(66,20,95,0.07)" }}>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:16 }}>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:"#7c3aed", boxShadow:"0 0 6px rgba(124,58,237,0.5)" }} />
            <span style={{ fontSize:11, fontWeight:700, letterSpacing:"0.1em", color:"#7c3aed", textTransform:"uppercase" }}>Prediction Flow</span>
          </div>
          <h3 style={{ margin:0, fontSize:15, fontWeight:800, color:"#1e1b4b" }}>Geo-Adjusted Price Forecast</h3>
          <p style={{ margin:"4px 0 0", fontSize:12, color:"#6b7280" }}>8-week outlook · geopolitical risk premium baked in</p>
        </div>
        <div style={{ display:"flex", gap:6 }}>
          {Object.keys(assets).map(a=>(
            <button key={a} onClick={()=>setAsset(a)} style={{ padding:"5px 12px", borderRadius:8, fontSize:11, fontWeight:700, border:"none", cursor:"pointer", background:asset===a?"linear-gradient(135deg,#0f0c29,#42145f)":"rgba(0,0,0,0.04)", color:asset===a?"white":"#6b7280", transition:"all 0.15s" }}>{a}</button>
          ))}
        </div>
      </div>
      <div style={{ display:"flex", gap:16, marginBottom:12 }}>
        {[{c:"#7c3aed",l:"Risk-Adjusted"},{c:"#0ea5e9",l:"Base Forecast"},{c:"#94a3b8",l:"Neutral Baseline"}].map(x=>(
          <span key={x.l} style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:"#6b7280", fontWeight:600 }}>
            <span style={{ width:20, height:2.5, background:x.c, borderRadius:2, display:"inline-block" }} />{x.l}
          </span>
        ))}
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow:"visible" }}>
        <defs>
          <linearGradient id="riskFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.18" /><stop offset="100%" stopColor="#7c3aed" stopOpacity="0.01" />
          </linearGradient>
          <linearGradient id="baseFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.10" /><stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.01" />
          </linearGradient>
        </defs>
        {[0,0.25,0.5,0.75,1].map(pct=>{
          const y=PAD.t+cH*pct; const v=maxVal-pct*range;
          return <g key={pct}><line x1={PAD.l} y1={y} x2={PAD.l+cW} y2={y} stroke="#f1f5f9" strokeWidth="1"/><text x={PAD.l-6} y={y+4} textAnchor="end" fontSize="9" fill="#94a3b8">{v.toFixed(0)}</text></g>;
        })}
        {d.weeks.map((_,i)=><text key={i} x={toX(i)} y={H-6} textAnchor="middle" fontSize="9" fill="#94a3b8">W{i+1}</text>)}
        <path d={area(d.riskAdj)} fill="url(#riskFill)" />
        <path d={area(d.weeks)}   fill="url(#baseFill)" />
        <path d={line(d.baseline)} fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 3" />
        <path d={line(d.weeks)}    fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d={line(d.riskAdj)}  fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {d.riskAdj.map((v,i)=><circle key={i} cx={toX(i)} cy={toY(v)} r="3.5" fill="white" stroke="#7c3aed" strokeWidth="2"/>)}
      </svg>
      <div style={{ display:"flex", gap:12, marginTop:12 }}>
        <div style={{ flex:1, background:"linear-gradient(135deg,#f5f3ff,#ede9fe)", border:"1px solid #ddd6fe", borderRadius:10, padding:"10px 14px" }}>
          <div style={{ fontSize:10, fontWeight:700, color:"#7c3aed", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:2 }}>Geo Risk Premium</div>
          <div style={{ fontSize:20, fontWeight:900, color:"#4c1d95" }}>+{riskUplift}%</div>
          <div style={{ fontSize:10, color:"#6b7280" }}>vs base at week 8</div>
        </div>
        <div style={{ flex:1, background:"linear-gradient(135deg,#f0f9ff,#e0f2fe)", border:"1px solid #bae6fd", borderRadius:10, padding:"10px 14px" }}>
          <div style={{ fontSize:10, fontWeight:700, color:"#0ea5e9", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:2 }}>8-Week Target</div>
          <div style={{ fontSize:20, fontWeight:900, color:"#0c4a6e" }}>{d.riskAdj[7].toFixed(1)}</div>
          <div style={{ fontSize:10, color:"#6b7280" }}>{d.unit} · risk-adjusted</div>
        </div>
        <div style={{ flex:1, background:"linear-gradient(135deg,#fff7ed,#ffedd5)", border:"1px solid #fed7aa", borderRadius:10, padding:"10px 14px" }}>
          <div style={{ fontSize:10, fontWeight:700, color:"#f97316", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:2 }}>Signal Drivers</div>
          <div style={{ fontSize:11, fontWeight:700, color:"#7c2d12", lineHeight:1.5 }}>Iran · NATO · OPEC+</div>
          <div style={{ fontSize:10, color:"#6b7280" }}>top contributing risks</div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WIDGET 5 · Risk Event Impact Simulator  (NEW · Prediction Flow)
// ─────────────────────────────────────────────────────────────────────────────
function RiskEventSimulator() {
  const [scenario, setScenario] = useState(0);
  const [intensity, setIntensity] = useState(50);
  const scenarios = [
    { name:"Iran Strait of Hormuz Closure", icon:"🚢",
      impacts:[
        {asset:"Brent Crude",  dir:+1, basePct:18, color:"#ef4444"},
        {asset:"Gold",         dir:+1, basePct:8,  color:"#f97316"},
        {asset:"S&P 500",      dir:-1, basePct:6,  color:"#6b21a8"},
        {asset:"USD Index",    dir:+1, basePct:3,  color:"#0ea5e9"},
        {asset:"Wheat",        dir:+1, basePct:5,  color:"#eab308"},
        {asset:"Shipping ETF", dir:-1, basePct:12, color:"#ef4444"},
      ]},
    { name:"Russia–NATO Direct Incident", icon:"⚡",
      impacts:[
        {asset:"Natural Gas",  dir:+1, basePct:25, color:"#ef4444"},
        {asset:"Gold",         dir:+1, basePct:12, color:"#f97316"},
        {asset:"EUR/USD",      dir:-1, basePct:4,  color:"#6b21a8"},
        {asset:"Defense ETF",  dir:+1, basePct:15, color:"#22c55e"},
        {asset:"S&P 500",      dir:-1, basePct:9,  color:"#6b21a8"},
        {asset:"Wheat",        dir:+1, basePct:11, color:"#eab308"},
      ]},
    { name:"China–Taiwan Blockade", icon:"🔒",
      impacts:[
        {asset:"Semiconductors",dir:-1,basePct:22, color:"#ef4444"},
        {asset:"Gold",          dir:+1,basePct:10, color:"#f97316"},
        {asset:"CNY/USD",       dir:-1,basePct:5,  color:"#6b21a8"},
        {asset:"Oil",           dir:+1,basePct:14, color:"#ef4444"},
        {asset:"S&P 500",       dir:-1,basePct:13, color:"#6b21a8"},
        {asset:"USD Index",     dir:+1,basePct:6,  color:"#0ea5e9"},
      ]},
  ];
  const sc = scenarios[scenario];
  const scale = intensity/100;

  return (
    <div style={{ background:"rgba(255,255,255,0.97)", border:"1px solid rgba(66,20,95,0.1)", borderRadius:16, padding:"22px 24px", boxShadow:"0 2px 16px rgba(66,20,95,0.07)" }}>
      <div style={{ marginBottom:16 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
          <div style={{ width:8, height:8, borderRadius:"50%", background:"#dc2626", boxShadow:"0 0 6px rgba(220,38,38,0.5)" }} />
          <span style={{ fontSize:11, fontWeight:700, letterSpacing:"0.1em", color:"#dc2626", textTransform:"uppercase" }}>Prediction Flow</span>
        </div>
        <h3 style={{ margin:0, fontSize:15, fontWeight:800, color:"#1e1b4b" }}>Risk Event Impact Simulator</h3>
        <p style={{ margin:"4px 0 0", fontSize:12, color:"#6b7280" }}>Dial a crisis scenario · see predicted market dislocations</p>
      </div>
      <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
        {scenarios.map((s,i)=>(
          <button key={i} onClick={()=>setScenario(i)} style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 14px", borderRadius:10, fontSize:12, fontWeight:700, border:"none", cursor:"pointer", background:scenario===i?"linear-gradient(135deg,#7f1d1d,#dc2626)":"rgba(0,0,0,0.04)", color:scenario===i?"white":"#374151", transition:"all 0.15s", boxShadow:scenario===i?"0 2px 10px rgba(220,38,38,0.3)":"none" }}>
            <span>{s.icon}</span>{s.name}
          </button>
        ))}
      </div>
      <div style={{ marginBottom:20 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
          <span style={{ fontSize:11, fontWeight:700, color:"#374151", textTransform:"uppercase", letterSpacing:"0.06em" }}>Crisis Intensity</span>
          <span style={{ fontSize:13, fontWeight:900, color:intensity>=75?"#ef4444":intensity>=45?"#f97316":"#22c55e" }}>{intensity}% — {intensity>=75?"Severe":intensity>=45?"Significant":"Moderate"}</span>
        </div>
        <div style={{ position:"relative", height:6, background:"#f1f5f9", borderRadius:3 }}>
          <div style={{ position:"absolute", left:0, top:0, height:"100%", width:`${intensity}%`, background:"linear-gradient(90deg,#22c55e,#eab308,#ef4444)", borderRadius:3, transition:"width 0.1s" }} />
          <input type="range" min={10} max={100} value={intensity} onChange={e=>setIntensity(+e.target.value)} style={{ position:"absolute", inset:0, opacity:0, width:"100%", cursor:"pointer", margin:0 }} />
        </div>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {sc.impacts.map(imp=>{
          const pct=(imp.basePct*scale).toFixed(1);
          const barW=Math.min(imp.basePct*scale,100);
          return (
            <div key={imp.asset} style={{ display:"grid", gridTemplateColumns:"130px 1fr 64px", alignItems:"center", gap:10 }}>
              <span style={{ fontSize:12, fontWeight:700, color:"#374151" }}>{imp.asset}</span>
              <div style={{ height:8, background:"#f1f5f9", borderRadius:4, overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${barW}%`, background:imp.dir>0?`linear-gradient(90deg,${imp.color}55,${imp.color})`:`linear-gradient(90deg,#6b21a855,#6b21a8)`, borderRadius:4, transition:"width 0.3s ease" }} />
              </div>
              <span style={{ fontSize:13, fontWeight:900, color:imp.dir>0?"#ef4444":"#6b21a8", textAlign:"right" }}>{imp.dir>0?"+":"-"}{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WIDGET 6 · Country Risk Scorecard  (NEW · Prediction Flow)
// ─────────────────────────────────────────────────────────────────────────────
function CountryRiskScorecard() {
  const [selected, setSelected] = useState("Iran");
  const countries: Record<string,{overall:number;flag:string;region:string;dims:{label:string;score:number;color:string}[];outlook:string;outlookColor:string;events:string[]}> = {
    "Iran":      { overall:88, flag:"🇮🇷", region:"Middle East",    outlook:"Deteriorating", outlookColor:"#ef4444",
      dims:[{label:"Nuclear Escalation",score:91,color:"#ef4444"},{label:"Sanctions Severity",score:94,color:"#ef4444"},{label:"Internal Stability",score:62,color:"#f97316"},{label:"Regional Proxy Risk",score:85,color:"#ef4444"},{label:"Energy Disruption",score:78,color:"#f97316"}],
      events:["Fordow enrichment expansion","IRGC proxy escalation in Yemen","SWIFT exclusion maintained"] },
    "Russia":    { overall:79, flag:"🇷🇺", region:"Eastern Europe", outlook:"Stable-High",    outlookColor:"#f97316",
      dims:[{label:"Military Escalation",score:82,color:"#ef4444"},{label:"Sanctions Severity",score:88,color:"#ef4444"},{label:"Energy Leverage",score:71,color:"#f97316"},{label:"Ruble Stability",score:55,color:"#eab308"},{label:"Cyber Threat",score:76,color:"#f97316"}],
      events:["Black Sea grain route tension","Rosneft sanctions enforcement","Wagner Group restructuring"] },
    "China":     { overall:52, flag:"🇨🇳", region:"East Asia",      outlook:"Watchlist",      outlookColor:"#eab308",
      dims:[{label:"Taiwan Strait Risk",score:65,color:"#f97316"},{label:"Trade War Exposure",score:58,color:"#eab308"},{label:"Debt Contagion",score:47,color:"#eab308"},{label:"Supply Chain Control",score:72,color:"#f97316"},{label:"Currency Risk",score:38,color:"#84cc16"}],
      events:["PLA naval exercises in Taiwan Strait","Evergrande liquidation impact","Rare earth export restrictions"] },
    "Venezuela": { overall:61, flag:"🇻🇪", region:"Latin America",  outlook:"Elevated",       outlookColor:"#f97316",
      dims:[{label:"Political Instability",score:74,color:"#f97316"},{label:"Oil Sanctions",score:68,color:"#f97316"},{label:"Currency Crisis",score:81,color:"#ef4444"},{label:"Migration Risk",score:55,color:"#eab308"},{label:"Default Probability",score:48,color:"#eab308"}],
      events:["OFAC oil license expiry","Maduro election dispute","Guyana border escalation"] },
  };
  const c = countries[selected];
  const scoreColor = c.overall>=75?"#dc2626":c.overall>=50?"#ea580c":"#ca8a04";
  const scoreBg    = c.overall>=75?"linear-gradient(135deg,#fef2f2,#fee2e2)":c.overall>=50?"linear-gradient(135deg,#fff7ed,#ffedd5)":"linear-gradient(135deg,#fefce8,#fef9c3)";
  const scoreBorder= c.overall>=75?"#fecaca":c.overall>=50?"#fed7aa":"#fef08a";

  return (
    <div style={{ background:"rgba(255,255,255,0.97)", border:"1px solid rgba(66,20,95,0.1)", borderRadius:16, padding:"22px 24px", boxShadow:"0 2px 16px rgba(66,20,95,0.07)" }}>
      <div style={{ marginBottom:16 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
          <div style={{ width:8, height:8, borderRadius:"50%", background:"#0ea5e9", boxShadow:"0 0 6px rgba(14,165,233,0.5)" }} />
          <span style={{ fontSize:11, fontWeight:700, letterSpacing:"0.1em", color:"#0ea5e9", textTransform:"uppercase" }}>Prediction Flow</span>
        </div>
        <h3 style={{ margin:0, fontSize:15, fontWeight:800, color:"#1e1b4b" }}>Country Risk Scorecard</h3>
      </div>
      <div style={{ display:"flex", gap:6, marginBottom:18, flexWrap:"wrap" }}>
        {Object.keys(countries).map(name=>(
          <button key={name} onClick={()=>setSelected(name)} style={{ padding:"6px 14px", borderRadius:8, fontSize:12, fontWeight:700, border:"none", cursor:"pointer", background:selected===name?"linear-gradient(135deg,#0f0c29,#1e3a5f)":"rgba(0,0,0,0.04)", color:selected===name?"white":"#374151", transition:"all 0.15s", display:"flex", alignItems:"center", gap:5 }}>
            <span>{countries[name].flag}</span>{name}
          </button>
        ))}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"200px 1fr", gap:20 }}>
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div style={{ background:scoreBg, border:`1px solid ${scoreBorder}`, borderRadius:14, padding:"20px 16px", textAlign:"center" }}>
            <div style={{ fontSize:12, fontWeight:700, color:"#6b7280", marginBottom:4 }}>{c.flag} {selected}</div>
            <div style={{ fontSize:11, color:"#9ca3af", marginBottom:12 }}>{c.region}</div>
            <div style={{ fontSize:52, fontWeight:900, color:scoreColor, letterSpacing:"-0.04em", lineHeight:1 }}>{c.overall}</div>
            <div style={{ fontSize:10, color:"#9ca3af", marginTop:4, marginBottom:12 }}>Overall Risk / 100</div>
            <div style={{ display:"inline-flex", alignItems:"center", gap:5, background:"rgba(255,255,255,0.7)", borderRadius:8, padding:"5px 10px" }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background:c.outlookColor, animation:"pulse 2s infinite" }} />
              <span style={{ fontSize:11, fontWeight:700, color:c.outlookColor }}>{c.outlook}</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize:10, fontWeight:700, color:"#9ca3af", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:8 }}>Key Triggers</div>
            {c.events.map((e,i)=>(
              <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:6, marginBottom:6 }}>
                <div style={{ width:5, height:5, borderRadius:"50%", background:"#dc2626", marginTop:4, flexShrink:0 }} />
                <span style={{ fontSize:11, color:"#374151", lineHeight:1.4 }}>{e}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div style={{ fontSize:10, fontWeight:700, color:"#9ca3af", textTransform:"uppercase", letterSpacing:"0.07em" }}>Risk Dimensions</div>
          {c.dims.map(d=>(
            <div key={d.label}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                <span style={{ fontSize:12, fontWeight:700, color:"#374151" }}>{d.label}</span>
                <span style={{ fontSize:12, fontWeight:900, color:d.color }}>{d.score}</span>
              </div>
              <div style={{ height:8, background:"#f1f5f9", borderRadius:4, overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${d.score}%`, background:`linear-gradient(90deg,${d.color}70,${d.color})`, borderRadius:4, transition:"width 0.5s ease" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// stock predictor function
function StockPredictor() {
  const [ticker, setTicker] = useState("");
  const [data, setData] = useState<any>(null);
  const [insight, setInsight] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchPrediction = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/stock?ticker=${ticker}`);
      setData(res.data);
    } finally {
      setLoading(false);
    }
  };

  const fetchInsights = async () => {
  const res = await axios.post(`${API}/api/stock/insights`, {
    ticker,
    company_name: ticker,
    current_price: data.current,
    predicted_price: data.predicted,
    pct_change: data.pct,
    trend: data.trend,
    geo_risk_score: 65, // later connect to GeoRisk API
    key_regions: ["Middle East", "China"]
  });

  setInsight(res.data.insight);
};

  return (
    <div style={{
      background:"rgba(255,255,255,0.97)",
      border:"1px solid rgba(66,20,95,0.1)",
      borderRadius:16,
      padding:"22px 24px",
      boxShadow:"0 2px 16px rgba(66,20,95,0.07)"
    }}>
      
      <h3 style={{ fontWeight:800, color:"#1e1b4b" }}>
        AI Stock Predictor
      </h3>

      {/* Search */}
      <div style={{ display:"flex", gap:10, marginTop:10 }}>
        <input
          placeholder="Enter Ticker (AAPL, TSLA)"
          value={ticker}
          onChange={e=>setTicker(e.target.value)}
          style={{
            flex:1,
            padding:"10px",
            borderRadius:8,
            border:"1px solid #ddd"
          }}
        />
        <button onClick={fetchPrediction} style={{
          background:"linear-gradient(135deg,#0f0c29,#42145f)",
          color:"white",
          border:"none",
          borderRadius:8,
          padding:"10px 16px",
          fontWeight:700
        }}>
          Predict
        </button>
      </div>

      {/* Result */}
      {data && (
        <div style={{ marginTop:16 }}>
          <div style={{ fontSize:20, fontWeight:800 }}>
            ₹{data.current.toFixed(2)} → ₹{data.predicted.toFixed(2)}
          </div>

          <div style={{
            color: data.trend === "UP" ? "#16a34a" : "#dc2626",
            fontWeight:700
          }}>
            {data.trend} {data.pct.toFixed(2)}%
          </div>

          {/* AI Insight */}
          <button onClick={fetchInsights} style={{
            marginTop:12,
            padding:"8px 14px",
            borderRadius:8,
            background:"linear-gradient(135deg,#7c3aed,#0ea5e9)",
            color:"white",
            border:"none",
            fontWeight:700
          }}>
            AI Insights
          </button>

          {insight && (
            <div style={{
              marginTop:12,
              background:"#f8fafc",
              padding:"12px",
              borderRadius:8,
              fontSize:13
            }}>
              {insight}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [data, setData]               = useState<ForecastResponse | null>(null);
  const [loading, setLoading]         = useState(false);
  const [periods, setPeriods]         = useState(8);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [activeTab, setActiveTab]     = useState<"overview"|"predictions"|"georisk"|"stocks">("overview");

  const loadDefault = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/default?periods=${periods}`);
      setData(res.data);
      setUploadedFile(null);
    } finally { setLoading(false); }
  }, [periods]);

  useEffect(()=>{ loadDefault(); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploadedFile(file); setLoading(true);
    const form = new FormData(); form.append("file", file);
    try { const res = await axios.post(`${API}/api/upload?periods=${periods}`, form); setData(res.data); }
    finally { setLoading(false); }
  };

  const heroStats = [
    { label:"Active Conflict Zones", value:"38",        suffix:"zones",  icon:"M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" },
    { label:"Risk Alerts Today",     value:"12",        suffix:"new",    icon:"M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" },
    { label:"Sanction Regimes",      value:"14",        suffix:"active", icon:"M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
    { label:"Forecast Horizon",      value:`${periods}`,suffix:"wks",    icon:"M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
  ];

  const tabs=[
    {id:"overview"    as const, label:"🌍 Overview"},
    {id:"predictions" as const, label:"📈 Prediction Flows"},
    {id:"georisk"     as const, label:"⚠️ Geo Risk Model"},
    {id:"stocks" as const, label:"📊 Stock Predictor" },
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:24 }}>
      <style>{`
        @keyframes spin       { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes heroFadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes statCountIn{ from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse      { 0%,100%{opacity:1} 50%{opacity:0.35} }
      `}</style>

      {/* ── HERO ── */}
      <div style={{ background:"linear-gradient(135deg,#0f0c29 0%,#1a0533 30%,#2d0f47 60%,#42145f 85%,#1e3a5f 100%)", borderRadius:20, position:"relative", overflow:"hidden", boxShadow:"0 8px 48px rgba(15,12,41,0.5)", animation:"heroFadeUp 0.5s ease forwards" }}>
        <div style={{ position:"absolute", top:-100, right:-80, width:320, height:320, background:"radial-gradient(circle,rgba(239,68,68,0.10) 0%,transparent 70%)", borderRadius:"50%", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:-80, left:"30%", width:260, height:260, background:"radial-gradient(circle,rgba(255,255,255,0.03) 0%,transparent 70%)", borderRadius:"50%", pointerEvents:"none" }} />
        <div style={{ position:"absolute", top:"30%", right:"20%", width:160, height:160, background:"radial-gradient(circle,rgba(14,165,233,0.08) 0%,transparent 70%)", borderRadius:"50%", pointerEvents:"none" }} />
        <svg style={{ position:"absolute", right:320, top:"50%", transform:"translateY(-50%)", opacity:0.04, pointerEvents:"none" }} width="220" height="220" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="1"/>
          <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" stroke="white" strokeWidth="1"/>
          <path d="M2 12h20M2 7h20M2 17h20" stroke="white" strokeWidth="0.5"/>
        </svg>

        <div style={{ padding:"32px 36px 24px", position:"relative" }}>
          <div style={{ display:"flex", flexWrap:"wrap", alignItems:"flex-start", justifyContent:"space-between", gap:24 }}>
            <div>
              <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"rgba(239,68,68,0.2)", border:"1px solid rgba(239,68,68,0.35)", borderRadius:20, padding:"3px 12px", marginBottom:14 }}>
                <div style={{ width:6, height:6, borderRadius:"50%", background:"#ef4444", animation:"pulse 1.5s infinite" }} />
                <span style={{ fontSize:11, color:"#fca5a5", fontWeight:600, letterSpacing:"0.06em" }}>LIVE · Geopolitical Intelligence</span>
              </div>
              <h1 style={{ fontSize:24, fontWeight:800, color:"white", letterSpacing:"-0.025em", lineHeight:1.25, margin:"0 0 10px", maxWidth:540 }}>
                Synapse — Geopolitical<br/>Economic Prediction Engine
              </h1>
              <p style={{ color:"rgba(186,230,253,0.7)", fontSize:13, lineHeight:1.65, margin:0, maxWidth:460 }}>
                Geopolitical risk as a first-class signal layer — forecasts that dynamically adjust for regional instability, conflict intensity, sanctions exposure, and macro-political shocks.
              </p>
            </div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:10, flexShrink:0 }}>
              <button onClick={loadDefault} disabled={loading} style={{ padding:"10px 22px", background:"white", color:"#0f0c29", border:"none", borderRadius:10, fontSize:13, fontWeight:700, cursor:loading?"not-allowed":"pointer", opacity:loading?0.6:1, boxShadow:"0 2px 12px rgba(0,0,0,0.3)" }}>
                {loading?"Loading…":"Load Market Data"}
              </button>
              <label style={{ padding:"10px 22px", background:"rgba(255,255,255,0.1)", color:"white", border:"1px solid rgba(255,255,255,0.18)", borderRadius:10, fontSize:13, fontWeight:600, cursor:"pointer", display:"inline-block" }}>
                Ingest Dataset (CSV)<input type="file" accept=".csv" onChange={handleUpload} style={{ display:"none" }} />
              </label>
              {uploadedFile && <button onClick={()=>{setUploadedFile(null);loadDefault();}} style={{ padding:"10px 16px", background:"rgba(255,255,255,0.06)", color:"rgba(255,255,255,0.55)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, fontSize:13, cursor:"pointer" }}>✕ Reset</button>}
            </div>
          </div>
          <div style={{ marginTop:20, paddingTop:18, borderTop:"1px solid rgba(255,255,255,0.07)", display:"flex", alignItems:"center", gap:12 }}>
            <span style={{ fontSize:11, color:"rgba(186,230,253,0.6)", fontWeight:600, letterSpacing:"0.06em", textTransform:"uppercase", flexShrink:0 }}>Forecast Horizon</span>
            <div style={{ display:"flex", gap:5 }}>
              {[4,8,12,16,20,26].map(w=>(
                <button key={w} onClick={()=>setPeriods(w)} style={{ padding:"4px 12px", borderRadius:7, fontSize:12, fontWeight:600, border:"none", cursor:"pointer", transition:"all 0.15s", background:periods===w?"rgba(255,255,255,0.95)":"rgba(255,255,255,0.07)", color:periods===w?"#0f0c29":"rgba(255,255,255,0.6)", boxShadow:periods===w?"0 2px 8px rgba(0,0,0,0.3)":"none" }}>{w}w</button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1.1fr 1fr", borderTop:"1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ padding:"22px 36px 28px", borderRight:"1px solid rgba(255,255,255,0.07)", display:"flex", flexDirection:"column", justifyContent:"center", gap:12, position:"relative", overflow:"hidden" }}>
            <svg style={{ position:"absolute", bottom:0, left:0, right:0, opacity:0.07, pointerEvents:"none" }} height="70" viewBox="0 0 600 70" preserveAspectRatio="none">
              <defs><linearGradient id="gL" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#ef4444"/><stop offset="50%" stopColor="#a855f7"/><stop offset="100%" stopColor="#0ea5e9"/></linearGradient></defs>
              <polyline points="0,55 80,50 160,38 220,45 280,22 350,32 420,16 500,24 600,8" fill="none" stroke="url(#gL)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p style={{ fontSize:10, fontWeight:700, letterSpacing:"0.1em", color:"rgba(239,68,68,0.8)", textTransform:"uppercase", margin:0 }}>Powered by · Geopolitical AI</p>
            <p style={{ fontSize:18, fontWeight:800, color:"white", lineHeight:1.3, margin:0, letterSpacing:"-0.02em" }}>
              From instability signals to{" "}
              <span style={{ background:"linear-gradient(90deg,#fca5a5,#c084fc,#7dd3fc)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>market foresight</span>
            </p>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {[
                {icon:"M12 2a10 10 0 100 20 10 10 0 000-20z",                                                    label:"Risk Heatmap"},
                {icon:"M13 10V3L4 14h7v7l9-11h-7z",                                                             label:"Event Simulator"},
                {icon:"M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",label:"Country Scoring"},
                {icon:"M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",label:"Price Forecast"},
              ].map(f=>(
                <div key={f.label} style={{ display:"flex", alignItems:"center", gap:6, background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"5px 10px" }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d={f.icon} stroke="rgba(255,255,255,0.75)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <span style={{ fontSize:11, color:"rgba(255,255,255,0.6)", fontWeight:500 }}>{f.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr" }}>
            {heroStats.map((s,i)=>(
              <div key={s.label} style={{ padding:"22px 24px", borderRight:i%2===0?"1px solid rgba(255,255,255,0.07)":"none", borderBottom:i<2?"1px solid rgba(255,255,255,0.07)":"none", display:"flex", flexDirection:"column", justifyContent:"space-between", gap:10, animation:`statCountIn 0.4s ease ${0.1+i*0.08}s both` }}>
                <div style={{ width:28, height:28, borderRadius:8, background:"rgba(255,255,255,0.09)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d={s.icon} stroke="rgba(255,255,255,0.75)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <div>
                  <div style={{ display:"flex", alignItems:"baseline", gap:4 }}>
                    <span style={{ fontSize:28, fontWeight:800, color:"white", letterSpacing:"-0.03em", lineHeight:1 }}>{s.value}</span>
                    {s.suffix&&<span style={{ fontSize:12, fontWeight:600, color:"rgba(255,255,255,0.4)" }}>{s.suffix}</span>}
                  </div>
                  <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:"5px 0 0", fontWeight:500 }}>{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── LOADING ── */}
      {loading && (
        <div className="fade-up card" style={{ textAlign:"center", padding:"64px 24px" }}>
          <div style={{ width:48, height:48, background:"linear-gradient(135deg,#0f0c29,#42145f)", borderRadius:14, margin:"0 auto 16px", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ animation:"spin 1s linear infinite" }}>
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <p style={{ fontWeight:600, color:"#0f0c29", marginBottom:4 }}>Ingesting geopolitical signals…</p>
          <p style={{ fontSize:13, color:"#9ca3af", margin:0 }}>Calibrating forecast against risk layers</p>
        </div>
      )}

      {/* ── TABS + CONTENT ── */}
      {data && !loading && (
        <>
          <div style={{ display:"inline-flex", background:"rgba(255,255,255,0.9)", border:"1px solid rgba(66,20,95,0.1)", borderRadius:14, padding:4, gap:2, boxShadow:"0 2px 8px rgba(15,12,41,0.08)" }}>
            {tabs.map(tab=>(
              <button key={tab.id} onClick={()=>setActiveTab(tab.id)} style={{ padding:"8px 20px", borderRadius:10, fontSize:13, fontWeight:600, border:"none", cursor:"pointer", transition:"all 0.2s ease", color:activeTab===tab.id?"white":"#6b7280", background:activeTab===tab.id?"linear-gradient(135deg,#0f0c29,#42145f)":"transparent", boxShadow:activeTab===tab.id?"0 2px 12px rgba(15,12,41,0.35)":"none" }}>{tab.label}</button>
            ))}
          </div>

          {activeTab==="overview" && (
            <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
              <GlobalHeatmap />
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
                <CommoditiesTicker />
                <GeopoliticsNewsFeed />
              </div>
            </div>
          )}

          {activeTab==="predictions" && (
            <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
              <GeoPriceForecast />
              <RiskEventSimulator />
              <CountryRiskScorecard />
            </div>
          )}

          {activeTab==="georisk" && (
            <GeoRiskPanel periods={periods} forecastRecords={data?.forecast?.forecast ?? []} />
          )}

          {activeTab==="stocks" && (
            <StockPredictor />
          )}
        </>
      )}

      {/* ── EMPTY STATE ── */}
      {!data && !loading && (
        <div className="card fade-up" style={{ textAlign:"center", padding:"80px 24px" }}>
          <div style={{ width:56, height:56, background:"linear-gradient(135deg,#0f0c29,#42145f)", borderRadius:16, margin:"0 auto 16px", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2"/>
              <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" stroke="white" strokeWidth="1.5"/>
              <path d="M2 12h20" stroke="white" strokeWidth="1.5"/>
            </svg>
          </div>
          <p style={{ fontWeight:700, color:"#0f0c29", fontSize:16, marginBottom:6 }}>Ready to analyse risk</p>
          <p style={{ fontSize:13, color:"#9ca3af", margin:0 }}>Load market data or upload a CSV to activate geopolitical signal layers</p>
        </div>
      )}
    </div>
  );
}
