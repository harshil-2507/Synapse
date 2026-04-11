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
  const [activeTab, setActiveTab] = useState<"forecast"|"anomalies"|"scenario">("forecast");

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
      const res = await axios.get(`${API}/api/anomaly/explain`, { params: {
        date: anomaly.date, value: anomaly.value, expected: anomaly.expected,
        direction: anomaly.direction, deviation_pct: anomaly.deviation_pct
      }});
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

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="card" style={{background: 'linear-gradient(135deg, var(--natwest-purple) 0%, #6b21a8 100%)'}}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">AI Predictive Forecasting</h1>
            <p className="text-purple-200 text-sm mt-1">Transform historical data into honest, explainable forecasts</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={loadDefault} disabled={loading}
              className="px-5 py-2.5 bg-white text-sm font-semibold rounded-lg hover:bg-purple-50 transition disabled:opacity-50"
              style={{color: 'var(--natwest-purple)'}}>
              {loading ? "Loading..." : "Load Walmart Demo"}
            </button>
            <label className="px-5 py-2.5 bg-white/10 text-white text-sm font-semibold rounded-lg hover:bg-white/20 transition cursor-pointer border border-white/30">
              Upload CSV
              <input type="file" accept=".csv" onChange={handleUpload} className="hidden" />
            </label>
            {uploadedFile && (
              <button onClick={() => { setUploadedFile(null); loadDefault(); }}
                className="px-4 py-2.5 bg-white/10 text-white text-sm rounded-lg border border-white/30 hover:bg-white/20">
                ✕ Clear
              </button>
            )}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <label className="text-purple-200 text-xs">Forecast weeks</label>
            <select value={periods} onChange={e => setPeriods(Number(e.target.value))}
              className="bg-white/10 text-white text-sm rounded-lg px-3 py-1.5 border border-white/20">
              {[4,8,12,16,20,26].map(w => <option key={w} value={w} className="text-gray-800">{w} weeks</option>)}
            </select>
          </div>
        </div>
      </div>

      {loading && (
        <div className="card text-center py-12">
          <div className="flex justify-center gap-1 mb-3">{[...Array(3)].map((_,i) => <div key={i} className="w-3 h-3 rounded-full bg-purple-400 animate-bounce" style={{animationDelay: `${i*0.15}s`}}></div>)}</div>
          <p className="text-sm text-gray-500">Running forecast model...</p>
        </div>
      )}

      {data && !loading && (
        <>
          {data.summary && <SummaryCard summary={data.summary} />}
          {data.confidence && <ConfidenceCard confidence={data.confidence} />}
          <StatsRow data={data} />
          <div>
            <div className="flex gap-1 bg-white border border-purple-100 rounded-xl p-1 w-fit">
              {(["forecast","anomalies","scenario"] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2 rounded-lg text-sm font-medium transition capitalize ${activeTab === tab ? "text-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                  style={activeTab === tab ? {background: 'var(--natwest-purple)'} : {}}>
                  {tab} {tab === "anomalies" && `(${data.anomalies.length})`}
                </button>
              ))}
            </div>

            {activeTab === "forecast" && <ForecastChart chartData={chartData} anomalies={data.anomalies} />}
            {activeTab === "anomalies" && (
              <AnomalyList anomalies={data.anomalies} activeAnomaly={activeAnomaly}
                anomalyExplanation={anomalyExplanation} explainLoading={explainLoading}
                onSelect={explainAnomaly} />
            )}
            {activeTab === "scenario" && (
              <ScenarioPanel growthRate={growthRate} removeOutliers={removeOutliers}
                scenarioLoading={scenarioLoading} scenarioChartData={scenarioChartData}
                hasScenario={!!scenarioData} onGrowthChange={setGrowthRate}
                onOutliersChange={setRemoveOutliers} onRun={runScenario} />
            )}
          </div>
        </>
      )}

      {!data && !loading && (
        <div className="card text-center py-20">
          <p className="text-sm text-gray-400">Load the Walmart demo or upload your own CSV to get started</p>
        </div>
      )}
    </div>
  );
}