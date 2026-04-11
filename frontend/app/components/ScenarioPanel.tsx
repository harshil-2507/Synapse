"use client";
import { ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const fmt = (v: number) => v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M` : `$${(v / 1_000).toFixed(0)}K`;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-purple-100 rounded-xl p-3 shadow-lg text-xs">
      <p className="font-semibold text-gray-700 mb-2">{label}</p>
      {payload.map((p: any) => p.value != null && (
        <div key={p.name} className="flex justify-between gap-4">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="font-medium">{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

interface Props {
  growthRate: number;
  removeOutliers: boolean;
  scenarioLoading: boolean;
  scenarioChartData: any[];
  hasScenario: boolean;
  onGrowthChange: (v: number) => void;
  onOutliersChange: (v: boolean) => void;
  onRun: () => void;
}

export default function ScenarioPanel({ growthRate, removeOutliers, scenarioLoading, scenarioChartData, hasScenario, onGrowthChange, onOutliersChange, onRun }: Props) {
  return (
    <div className="mt-4 space-y-4">
      <div className="card">
        <h2 className="font-semibold text-gray-800 mb-4">Scenario Simulator</h2>
        <div className="flex flex-wrap gap-6 items-end">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Growth Rate Adjustment</label>
            <div className="flex items-center gap-3">
              <input type="range" min={-30} max={30} value={growthRate}
                onChange={e => onGrowthChange(Number(e.target.value))}
                className="w-40 accent-purple-700" />
              <span className="text-sm font-bold w-12" style={{color: 'var(--natwest-purple)'}}>
                {growthRate > 0 ? `+${growthRate}` : growthRate}%
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="outliers" checked={removeOutliers}
              onChange={e => onOutliersChange(e.target.checked)} className="accent-purple-700" />
            <label htmlFor="outliers" className="text-sm text-gray-600">Remove outliers</label>
          </div>
          <button onClick={onRun} disabled={scenarioLoading}
            className="px-6 py-2.5 text-white text-sm font-semibold rounded-lg transition disabled:opacity-50"
            style={{background: 'var(--natwest-purple)'}}>
            {scenarioLoading ? "Running..." : "Run Scenario"}
          </button>
        </div>
      </div>

      {hasScenario && scenarioChartData.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-1">
            Baseline vs Scenario ({growthRate > 0 ? `+${growthRate}` : growthRate}% growth)
          </h3>
          <p className="text-xs text-gray-400 mb-4">Showing forecast period only</p>
          <ResponsiveContainer width="100%" height={360}>
            <ComposedChart data={scenarioChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3e8ff" />
              <XAxis dataKey="date" tick={{fontSize: 10}} tickLine={false} />
              <YAxis tickFormatter={fmt} tick={{fontSize: 10}} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{fontSize: 12}} />
              <Area dataKey="Scenario Upper" fill="#f3e8ff" stroke="transparent" legendType="none" />
              <Area dataKey="Scenario Lower" fill="white" stroke="transparent" legendType="none" />
              <Line dataKey="Baseline" stroke="#94a3b8" strokeWidth={2} dot={false} strokeDasharray="5 3" />
              <Line dataKey="Scenario" stroke="#42145f" strokeWidth={2.5} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-4">
            {[
              { label: "Baseline avg (forecast period)", value: scenarioChartData.length ? fmt(scenarioChartData.reduce((s, p) => s + (p.Baseline || 0), 0) / scenarioChartData.length) : "—" },
              { label: `Scenario avg (${growthRate > 0 ? `+${growthRate}` : growthRate}% growth)`, value: scenarioChartData.length ? fmt(scenarioChartData.reduce((s, p) => s + (p.Scenario || 0), 0) / scenarioChartData.length) : "—" },
            ].map(s => (
              <div key={s.label} className="p-3 rounded-lg text-center" style={{background: 'var(--natwest-light)'}}>
                <p className="text-lg font-bold" style={{color: 'var(--natwest-purple)'}}>{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}