import { ForecastResponse } from "../types";

const fmt = (v: number) => v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M` : `$${(v / 1_000).toFixed(0)}K`;

interface Props { data: ForecastResponse; }

export default function StatsRow({ data }: Props) {
  const stats = [
    { label: "Data Points", value: `${data.forecast.forecast.filter(p => p.actual !== "").length} weeks` },
    { label: "Forecast Horizon", value: `${data.forecast.periods} weeks` },
    { label: "Anomalies Detected", value: String(data.anomalies.length) },
    { label: "Trend", value: data.forecast.trend > 0 ? `+${(data.forecast.trend/1000).toFixed(0)}K` : `${(data.forecast.trend/1000).toFixed(0)}K` },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map(s => (
        <div key={s.label} className="card text-center">
          <p className="text-2xl font-bold" style={{color: 'var(--natwest-purple)'}}>{s.value}</p>
          <p className="text-xs text-gray-500 mt-1">{s.label}</p>
        </div>
      ))}
    </div>
  );
}