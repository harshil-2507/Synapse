import { ForecastResponse } from "../types";

interface Props { data: ForecastResponse; }

export default function StatsRow({ data }: Props) {
  const trend = data.forecast.trend;
  const stats = [
    {
      label: "Training Window (Observations)",
      value: `${data.forecast.forecast.filter(p => p.actual !== "").length}`,
      suffix: " wks",
      icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
      color: '#42145f',
    },
    {
      label: "Prediction Horizon",
      value: `${data.forecast.periods}`,
      suffix: " wks",
      icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
      color: '#6b21a8',
    },
    {
      label: "Detected Outliers (Z-score)",
      value: `${data.anomalies.length}`,
      suffix: " found",
      icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
      color: data.anomalies.length > 10 ? '#dc2626' : '#b45309',
    },
    {
      label: "Net Demand Shift (Trend)",
      value: trend > 0 ? `+${(trend/1000).toFixed(0)}K` : `${(trend/1000).toFixed(0)}K`,
      suffix: "",
      icon: trend > 0
        ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
        : "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6",
      color: trend > 0 ? '#15803d' : '#dc2626',
    },
  ];

  return (
    <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16}}>
      {stats.map((s, i) => (
        <div key={s.label} className="stat-card fade-up" style={{animationDelay:`${i*0.07}s`}}>
          <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:14}}>
            <div style={{
              width:36,height:36,background:s.color+'15',borderRadius:10,
              display:'flex',alignItems:'center',justifyContent:'center',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d={s.icon} stroke={s.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <p style={{fontSize:28,fontWeight:800,color:s.color,letterSpacing:'-0.03em',lineHeight:1,margin:0}}>
            {s.value}<span style={{fontSize:14,fontWeight:600,opacity:0.7}}>{s.suffix}</span>
          </p>
          <p style={{fontSize:12,color:'#9ca3af',marginTop:6,fontWeight:500,margin:'6px 0 0'}}>{s.label}</p>
        </div>
      ))}
    </div>
  );
}