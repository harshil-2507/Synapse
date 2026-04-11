"use client";
import { ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";
import { Anomaly } from "../types";

const fmt = (v: number) => v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M` : `$${(v / 1_000).toFixed(0)}K`;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background:'white',border:'1px solid rgba(66,20,95,0.1)',
      borderRadius:12,padding:'12px 16px',
      boxShadow:'0 8px 24px rgba(66,20,95,0.12)',fontSize:12,
    }}>
      <p style={{fontWeight:700,color:'#374151',marginBottom:8,margin:'0 0 8px'}}>{label}</p>
      {payload.map((p: any) => p.value != null && (
        <div key={p.name} style={{display:'flex',justifyContent:'space-between',gap:16,marginBottom:3}}>
          <span style={{color:p.color,fontWeight:500}}>{p.name}</span>
          <span style={{fontWeight:700,color:'#111827'}}>{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

interface Props { chartData: any[]; anomalies: Anomaly[]; }

export default function ForecastChart({ chartData, anomalies }: Props) {
  return (
    <div className="card fade-up" style={{marginTop:16}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
        <div>
          <h2 style={{fontWeight:700,color:'#111827',fontSize:16,margin:0}}>Forecast with Confidence Bands</h2>
          <p style={{fontSize:12,color:'#9ca3af',margin:'4px 0 0'}}>Prophet model · 80% confidence interval · vs naive baseline</p>
        </div>
        <div style={{
          background:'rgba(66,20,95,0.06)',borderRadius:8,
          padding:'4px 10px',fontSize:11,fontWeight:600,color:'#42145f',
        }}>
          {chartData.length} data points
        </div>
      </div>

      <ResponsiveContainer width="100%" height={420}>
        <ComposedChart data={chartData} margin={{top:4,right:4,bottom:4,left:4}}>
          <defs>
            <linearGradient id="bandGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#42145f" stopOpacity={0.1}/>
              <stop offset="100%" stopColor="#42145f" stopOpacity={0.01}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3e8ff" vertical={false}/>
          <XAxis dataKey="date" tick={{fontSize:10,fill:'#9ca3af'}} tickLine={false} axisLine={false} interval={8}/>
          <YAxis tickFormatter={fmt} tick={{fontSize:10,fill:'#9ca3af'}} tickLine={false} axisLine={false}/>
          <Tooltip content={<CustomTooltip/>}/>
          <Legend wrapperStyle={{fontSize:12,paddingTop:16}}/>
          <Area dataKey="Upper Bound" fill="url(#bandGrad)" stroke="transparent" legendType="none"/>
          <Area dataKey="Lower Bound" fill="white" stroke="transparent" legendType="none"/>
          <Line dataKey="Actual" stroke="#da1884" strokeWidth={2.5} dot={false} activeDot={{r:4,strokeWidth:0}}/>
          <Line dataKey="Forecast" stroke="#42145f" strokeWidth={2} dot={false} strokeDasharray="6 3"/>
          <Line dataKey="Baseline" stroke="#94a3b8" strokeWidth={1.5} dot={false} strokeDasharray="3 3"/>
          {anomalies.map((a, i) => (
            <ReferenceLine key={`a-${i}`} x={a.date}
              stroke={a.direction==="spike"?"#dc2626":"#2563eb"}
              strokeDasharray="3 3" strokeOpacity={0.45} strokeWidth={1.5}/>
          ))}
        </ComposedChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div style={{display:'flex',flexWrap:'wrap',gap:16,marginTop:12,paddingTop:12,borderTop:'1px solid #f3e8ff'}}>
        {[
          {color:'#da1884',label:'Actual Sales',dash:false},
          {color:'#42145f',label:'Prophet Forecast',dash:true},
          {color:'#94a3b8',label:'Naive Baseline',dash:true},
          {color:'#dc2626',label:'Anomaly Markers',dash:true},
        ].map(l=>(
          <span key={l.label} style={{display:'flex',alignItems:'center',gap:6,fontSize:11,color:'#6b7280'}}>
            <span style={{
              display:'inline-block',width:16,height:2,background:l.color,
              borderRadius:1,opacity: l.dash ? 0.7 : 1,
            }}/>
            {l.label}
          </span>
        ))}
      </div>
    </div>
  );
}