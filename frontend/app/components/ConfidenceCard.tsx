import { Confidence } from "../types";

interface Props { confidence: Confidence; }

export default function ConfidenceCard({ confidence }: Props) {
  return (
    <div className="card border" style={{borderColor: confidence.color + "40", background: confidence.bg}}>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          {/* Gauge */}
          <div className="relative w-14 h-14 flex-shrink-0">
            <svg viewBox="0 0 36 36" className="w-14 h-14 -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3"/>
              <circle cx="18" cy="18" r="15.9" fill="none"
                stroke={confidence.color} strokeWidth="3"
                strokeDasharray={`${confidence.score} 100`}
                strokeLinecap="round"/>
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold" style={{color: confidence.color}}>
              {confidence.score}
            </span>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-0.5">Model Confidence</p>
            <p className="text-xl font-bold" style={{color: confidence.color}}>{confidence.label}</p>
          </div>
        </div>

        {/* Reason */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-600 leading-relaxed">{confidence.reason}</p>
        </div>

        {/* Bar */}
        <div className="w-32 flex-shrink-0">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Low</span><span>High</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700"
              style={{width: `${confidence.score}%`, background: confidence.color}} />
          </div>
        </div>
      </div>
    </div>
  );
}