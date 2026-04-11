"use client";
import { Anomaly } from "../types";

const fmt = (v: number) => v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M` : `$${(v / 1_000).toFixed(0)}K`;

interface Props {
  anomalies: Anomaly[];
  activeAnomaly: Anomaly | null;
  anomalyExplanation: string;
  explainLoading: boolean;
  onSelect: (a: Anomaly) => void;
}

export default function AnomalyList({ anomalies, activeAnomaly, anomalyExplanation, explainLoading, onSelect }: Props) {
  return (
    <div className="card mt-4 space-y-3">
      <h2 className="font-semibold text-gray-800">Detected Anomalies</h2>
      {anomalies.length === 0 && <p className="text-gray-400 text-sm">No anomalies detected.</p>}
      {anomalies.map(a => (
        <div
          key={a.date}
          onClick={() => onSelect(a)}
          className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer hover:shadow-md transition ${
            activeAnomaly?.date === a.date ? "border-purple-300 bg-purple-50" : "border-gray-100 hover:border-purple-200"
          }`}
        >
          <div className="flex items-center gap-3">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full badge-${a.direction}`}>
              {a.direction.toUpperCase()} {a.deviation_pct}%
            </span>
            <div>
              <p className="text-sm font-medium text-gray-800">{a.date}</p>
              <p className="text-xs text-gray-400">Actual {fmt(a.value)} · Expected {fmt(a.expected)}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Z-score</p>
            <p className="font-bold text-sm" style={{color: 'var(--natwest-purple)'}}>{a.z_score.toFixed(2)}</p>
          </div>
        </div>
      ))}
      {activeAnomaly && (
        <div className="mt-4 p-4 rounded-xl border border-purple-200 bg-purple-50">
          <p className="text-xs font-semibold text-purple-700 mb-2">AI Explanation — {activeAnomaly.date}</p>
          {explainLoading
            ? <div className="flex gap-1">{[...Array(3)].map((_,i) => <div key={i} className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{animationDelay: `${i*0.15}s`}}></div>)}</div>
            : <p className="text-sm text-gray-700 leading-relaxed">{anomalyExplanation || "Click an anomaly to get an AI explanation."}</p>
          }
        </div>
      )}
    </div>
  );
}