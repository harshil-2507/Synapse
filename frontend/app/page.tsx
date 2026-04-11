"use client";
import { useState, useCallback, useEffect } from "react";
import axios from "axios";
import { ForecastResponse, Anomaly } from "./types";
import ForecastChart from "./components/ForecastChart";
import AnomalyList from "./components/AnomalyList";
import ScenarioPanel from "./components/ScenarioPanel";
import SummaryCard from "./components/SummaryCard";
import StatsRow from "./components/StatsRow";
import ConfidenceCard from "./components/ConfidenceCard";
import ValidationPanel from "./components/ValidationPanel";

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
  const [activeTab, setActiveTab] = useState<"forecast"|"anomalies"|"scenario"|"validate">("forecast");

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
        const res = await axios.post(`${API}/api/scenario?growth_rate=${growthRate}&remove_outliers=${removeOutliers}&periods=${periods}`, form);
        setScenarioData(res.data);
      } else {
        const res = await axios.get(`${API}/api/scenario?growth_rate=${growthRate}&remove_outliers=${removeOutliers}&periods=${periods}`);
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
          date: anomaly.date, value: anomaly.value, expected: anomaly.expected,
          direction: anomaly.direction, deviation_pct: anomaly.deviation_pct
        }
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
        return { date: pDate, Baseline: match ? Number(match.yhat) : null, Scenario: Number(p.yhat), "Scenario Upper": Number(p.yhat_upper), "Scenario Lower": Number(p.yhat_lower) };
      }).filter((p: any) => p.Baseline !== null && p.Baseline > 0)
    : [];

  const tabs = ["forecast","anomalies","scenario","validate"] as const;

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 24}}>

      {/* ── HERO ── */}
      <div className="fade-up" style={{
        background: 'linear-gradient(135deg, #42145f 0%, #5a1f7a 50%, #6b21a8 100%)',
        borderRadius: 20, padding: '32px 36px',
        position: 'relative', overflow: 'hidden',
        boxShadow: '0 8px 40px rgba(66,20,95,0.3)',
      }}>
        {/* decorative circles */}
        <div style={{position:'absolute',top:-60,right:-60,width:220,height:220,background:'rgba(218,24,132,0.12)',borderRadius:'50%',pointerEvents:'none'}}/>
        <div style={{position:'absolute',bottom:-40,left:'40%',width:160,height:160,background:'rgba(255,255,255,0.04)',borderRadius:'50%',pointerEvents:'none'}}/>

        <div style={{display:'flex',flexWrap:'wrap',alignItems:'center',justifyContent:'space-between',gap:24,position:'relative'}}>
          <div>
            <div style={{display:'inline-flex',alignItems:'center',gap:6,background:'rgba(218,24,132,0.2)',border:'1px solid rgba(218,24,132,0.3)',borderRadius:20,padding:'3px 12px',marginBottom:12}}>
              <div style={{width:6,height:6,borderRadius:'50%',background:'#da1884'}}/>
              <span style={{fontSize:11,color:'#f9a8d4',fontWeight:600,letterSpacing:'0.05em'}}>Curated</span>
            </div>
            <h1 style={{fontSize:26,fontWeight:800,color:'white',letterSpacing:'-0.02em',lineHeight:1.2,marginBottom:8}}>
              Synapse - Probabilistic Forecasting with Built-in Validation
            </h1>
            <p style={{color:'rgba(216,180,254,0.85)',fontSize:14,lineHeight:1.6,margin:0}}>
              Generate statistically grounded forecasts with confidence intervals, anomaly detection, and baseline benchmarking.
            </p>
          </div>

          <div style={{display:'flex',flexWrap:'wrap',gap:10,flexShrink:0}}>
            <button onClick={loadDefault} disabled={loading} style={{
              padding:'10px 22px',background:'white',color:'#42145f',border:'none',
              borderRadius:10,fontSize:13,fontWeight:700,
              cursor:loading?'not-allowed':'pointer',opacity:loading?0.6:1,
              boxShadow:'0 2px 8px rgba(0,0,0,0.15)',transition:'transform 0.15s ease',
            }}
              onMouseEnter={e=>(e.currentTarget.style.transform='translateY(-1px)')}
              onMouseLeave={e=>(e.currentTarget.style.transform='translateY(0)')}>
              {loading ? "Loading..." : "Load Sample Time-Series Dataset"}
            </button>

            <label style={{
              padding:'10px 22px',background:'rgba(255,255,255,0.12)',color:'white',
              border:'1px solid rgba(255,255,255,0.25)',borderRadius:10,fontSize:13,
              fontWeight:600,cursor:'pointer',transition:'background 0.15s ease',
            }}
              onMouseEnter={e=>(e.currentTarget.style.background='rgba(255,255,255,0.2)')}
              onMouseLeave={e=>(e.currentTarget.style.background='rgba(255,255,255,0.12)')}>
              Ingest Dataset (CSV)
              <input type="file" accept=".csv" onChange={handleUpload} style={{display:'none'}} />
            </label>

            {uploadedFile && (
              <button onClick={()=>{setUploadedFile(null);loadDefault();}} style={{
                padding:'10px 16px',background:'rgba(255,255,255,0.08)',color:'rgba(255,255,255,0.7)',
                border:'1px solid rgba(255,255,255,0.15)',borderRadius:10,fontSize:13,cursor:'pointer',
              }}>✕ Reset Pipeline</button>
            )}
          </div>
        </div>

        {/* Forecast horizon pills */}
        <div style={{marginTop:20,paddingTop:20,borderTop:'1px solid rgba(255,255,255,0.1)',display:'flex',alignItems:'center',gap:12,position:'relative'}}>
          <span style={{fontSize:12,color:'rgba(216,180,254,0.8)',fontWeight:500}}>Forecast horizon</span>
          <div style={{display:'flex',gap:6}}>
            {[4,8,12,16,20,26].map(w=>(
              <button key={w} onClick={()=>setPeriods(w)} style={{
                padding:'4px 12px',borderRadius:8,fontSize:12,fontWeight:600,
                border:'none',cursor:'pointer',transition:'all 0.15s ease',
                background:periods===w?'rgba(255,255,255,0.95)':'rgba(255,255,255,0.1)',
                color:periods===w?'#42145f':'rgba(255,255,255,0.7)',
                boxShadow:periods===w?'0 2px 8px rgba(0,0,0,0.15)':'none',
              }}>{w}w</button>
            ))}
          </div>
        </div>
      </div>

      {/* ── LOADING ── */}
      {loading && (
        <div className="fade-up card" style={{textAlign:'center',padding:'64px 24px'}}>
          <div style={{
            width:48,height:48,background:'linear-gradient(135deg,#42145f,#6b21a8)',
            borderRadius:14,margin:'0 auto 16px',display:'flex',alignItems:'center',justifyContent:'center',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{animation:'spin 1s linear infinite'}}>
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
                stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <p style={{fontWeight:600,color:'#42145f',marginBottom:4}}>Running forecast model</p>
          <p style={{fontSize:13,color:'#9ca3af',margin:0}}>Prophet is analysing patterns and generating predictions...</p>
          <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      {data && !loading && (
        <>
        {data.confidence && <ConfidenceCard confidence={data.confidence} />}
          {data.summary && <SummaryCard summary={data.summary} />}
          <StatsRow data={data} />

          {/* Tab bar */}
          <div style={{
            display:'inline-flex',background:'rgba(255,255,255,0.9)',
            border:'1px solid rgba(66,20,95,0.1)',borderRadius:14,padding:4,gap:2,
            boxShadow:'0 2px 8px rgba(66,20,95,0.06)',
          }}>
            {tabs.map(tab=>(
              <button key={tab} onClick={()=>setActiveTab(tab)} style={{
                padding:'8px 18px',borderRadius:10,fontSize:13,fontWeight:600,
                border:'none',cursor:'pointer',textTransform:'capitalize',transition:'all 0.2s ease',
                color: activeTab===tab ? 'white' : '#6b7280',
                background: activeTab===tab
                  ? 'linear-gradient(135deg,#42145f,#5a1f7a)'
                  : 'transparent',
                boxShadow: activeTab===tab ? '0 2px 12px rgba(66,20,95,0.35)' : 'none',
              }}>
                {tab}{tab==="anomalies"&&` (${data.anomalies.length})`}
              </button>
            ))}
          </div>

          {activeTab==="forecast" && <ForecastChart chartData={chartData} anomalies={data.anomalies}/>}
          {activeTab==="anomalies" && (
            <AnomalyList anomalies={data.anomalies} activeAnomaly={activeAnomaly}
              anomalyExplanation={anomalyExplanation} explainLoading={explainLoading}
              onSelect={explainAnomaly}/>
          )}
          {activeTab==="scenario" && (
            <ScenarioPanel growthRate={growthRate} removeOutliers={removeOutliers}
              scenarioLoading={scenarioLoading} scenarioChartData={scenarioChartData}
              hasScenario={!!scenarioData} onGrowthChange={setGrowthRate}
              onOutliersChange={setRemoveOutliers} onRun={runScenario}/>
          )}
          {activeTab==="validate" && <ValidationPanel periods={periods} uploadedFile={uploadedFile}/>}
        </>
      )}

      {/* ── EMPTY STATE ── */}
      {!data && !loading && (
        <div className="card fade-up" style={{textAlign:'center',padding:'80px 24px'}}>
          <div style={{
            width:56,height:56,background:'linear-gradient(135deg,#42145f,#6b21a8)',
            borderRadius:16,margin:'0 auto 16px',display:'flex',alignItems:'center',justifyContent:'center',
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path d="M3 17l5-5 4 4 9-9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p style={{fontWeight:700,color:'#42145f',fontSize:16,marginBottom:6}}>Ready to forecast</p>
          <p style={{fontSize:13,color:'#9ca3af',margin:0}}>Load the Walmart demo or upload your own CSV to get started</p>
        </div>
      )}
    </div>
  );
}