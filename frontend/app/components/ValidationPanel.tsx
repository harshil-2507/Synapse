"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ValidationResult } from "../types";

const API = "http://localhost:8000";
const fmt = (v: number) => v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M` : `$${(v / 1_000).toFixed(0)}K`;

interface Props {
    periods: number;
    uploadedFile: File | null;
}

export default function ValidationPanel({ periods, uploadedFile }: Props) {
    const [result, setResult] = useState<ValidationResult | null>(null);
    const [loading, setLoading] = useState(false);

    const runValidation = async () => {
        setLoading(true);
        try {
            if (uploadedFile) {
                const form = new FormData();
                form.append("file", uploadedFile);
                const res = await axios.post(`${API}/api/validate?periods=${periods}`, form);
                setResult(res.data);
            } else {
                const res = await axios.get(`${API}/api/validate?periods=${periods}`);
                setResult(res.data);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-4 space-y-4">
            {/* Header card */}
            <div className="card">
                <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                        <h2 className="font-semibold text-gray-800">Hold-out Validation</h2>
                        <p className="text-xs text-gray-400 mt-1">
                            Trains on all data except the last {periods} weeks, then measures how accurately
                            Prophet predicted those known weeks vs the naive baseline. Proves the model generalises.
                        </p>
                    </div>
                    <button onClick={runValidation} disabled={loading}
                        className="px-5 py-2 text-white text-sm font-semibold rounded-lg transition disabled:opacity-50 flex-shrink-0"
                        style={{ background: 'var(--natwest-purple)' }}>
                        {loading ? "Validating..." : "Run Validation"}
                    </button>
                </div>
            </div>

            {/* Results */}
            {result && result.available && (
                <>
                    {/* Winner banner */}
                    <div className={`card border-l-4 ${result.prophet_wins ? 'border-l-green-500 bg-green-50' : 'border-l-amber-500 bg-amber-50'}`}>
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${result.prophet_wins ? 'bg-green-100' : 'bg-amber-100'}`}>
                                {result.prophet_wins ? (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                        <path d="M20 6L9 17l-5-5" stroke="#15803d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                        <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#b45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                )}
                            </div>
                            <div>
                                <p className="font-bold text-gray-800 text-sm">
                                    {result.prophet_wins
                                        ? `Prophet outperforms naive baseline by ${result.improvement_pct}%`
                                        : `Baseline competitive — model improvement: ${result.improvement_pct}%`}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Validated on {result.holdout_weeks} held-out weeks · Prophet MAE vs Baseline MAE comparison
                                </p>
                            </div>
                            <div className="ml-auto flex-shrink-0">
                                <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${result.prophet_wins ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                    {result.prophet_wins ? 'Prophet Wins' : 'Baseline Competitive'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Metrics grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: "Prophet MAE", value: fmt(result.prophet_mae!), sub: "Mean Absolute Error", good: result.prophet_mae! < result.baseline_mae! },
                            { label: "Baseline MAE", value: fmt(result.baseline_mae!), sub: "Naive rolling mean", good: false },
                            { label: "Prophet MAPE", value: `${result.prophet_mape!.toFixed(1)}%`, sub: "Mean Abs % Error", good: result.prophet_mape! < result.baseline_mape! },
                            { label: "Baseline MAPE", value: `${result.baseline_mape!.toFixed(1)}%`, sub: "Naive % error", good: false },
                        ].map(m => (
                            <div key={m.label} className={`card text-center border ${m.good ? 'border-green-200 bg-green-50' : 'border-gray-100'}`}>
                                <p className="text-xl font-bold" style={{ color: m.good ? '#15803d' : 'var(--natwest-purple)' }}>
                                    {m.value}
                                </p>
                                <p className="text-xs font-semibold text-gray-700 mt-1">{m.label}</p>
                                <p className="text-xs text-gray-400">{m.sub}</p>
                            </div>
                        ))}
                    </div>

                    {/* Comparison chart */}
                    <div className="card">
                        <h3 className="font-semibold text-gray-800 mb-1">Predicted vs Actual (Hold-out Period)</h3>
                        <p className="text-xs text-gray-400 mb-4">
                            Prophet and baseline predictions shown against real values for the {result.holdout_weeks} held-out weeks
                        </p>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={result.comparison}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f3e8ff" />
                                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} />
                                <YAxis tickFormatter={fmt} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                                <Tooltip formatter={(v: any) => fmt(Number(v))} />
                                <Legend wrapperStyle={{ fontSize: 12 }} />
                                <Line dataKey="Actual" stroke="#da1884" strokeWidth={2.5} dot={{ r: 4 }} />
                                <Line dataKey="Prophet" stroke="#42145f" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="5 3" />
                                <Line dataKey="Baseline" stroke="#94a3b8" strokeWidth={1.5} dot={false} strokeDasharray="3 3" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </>
            )}

            {result && !result.available && (
                <div className="card text-center py-8">
                    <p className="text-gray-400 text-sm">{result.reason}</p>
                </div>
            )}
        </div>
    );
}