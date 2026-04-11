"use client";
import { ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";
import { Anomaly } from "../types";

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

interface Props { chartData: any[]; anomalies: Anomaly[]; }

export default function ForecastChart({ chartData, anomalies }: Props) {
  return (
    <div className="card mt-4">
      <h2 className="font-semibold text-gray-800 mb-4">Forecast with Confidence Bands</h2>
      <ResponsiveContainer width="100%" height={420}>
        <ComposedChart data={chartData}>
          <defs>
            <linearGradient id="bandGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#42145f" stopOpacity={0.08}/>
              <stop offset="95%" stopColor="#42145f" stopOpacity={0.02}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3e8ff" />
          <XAxis dataKey="date" tick={{fontSize: 10}} tickLine={false} interval={8} />
          <YAxis tickFormatter={fmt} tick={{fontSize: 10}} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{fontSize: 12}} />
          <Area dataKey="Upper Bound" fill="url(#bandGrad)" stroke="transparent" legendType="none" />
          <Area dataKey="Lower Bound" fill="white" stroke="transparent" legendType="none" />
          <Line dataKey="Actual" stroke="#da1884" strokeWidth={2} dot={false} />
          <Line dataKey="Forecast" stroke="#42145f" strokeWidth={2} dot={false} strokeDasharray="6 3" />
          <Line dataKey="Baseline" stroke="#94a3b8" strokeWidth={1.5} dot={false} strokeDasharray="3 3" />
          {anomalies.map((a, i) => (
            <ReferenceLine key={`anomaly-${i}`} x={a.date} stroke={a.direction === "spike" ? "#dc2626" : "#2563eb"} strokeDasharray="3 3" strokeOpacity={0.5} />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
        <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-pink-500 inline-block"></span>Actual Sales</span>
        <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-purple-800 inline-block"></span>Prophet Forecast</span>
        <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-slate-400 inline-block"></span>Naive Baseline</span>
        <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-red-400 inline-block"></span>Anomaly Markers</span>
      </div>
    </div>
  );
}