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
    <div className="card fade-up" style={{marginTop:16}}>
      <div style={{marginBottom:20}}>
        <h2 style={{fontWeight:700,color:'#111827',fontSize:16,margin:0}}>Detected Anomalies</h2>
        <p style={{fontSize:12,color:'#9ca3af',margin:'4px 0 0'}}>
          Click any anomaly to get an AI-generated plain-English explanation
        </p>
      </div>

      {anomalies.length === 0 && (
        <div style={{textAlign:'center',padding:'32px 0',color:'#9ca3af',fontSize:13}}>
          No anomalies detected in this dataset.
        </div>
      )}

      <div style={{display:'flex',flexDirection:'column',gap:8}}>
        {anomalies.map((a,i) => {
          const isActive = activeAnomaly?.date === a.date;
          const isSpike = a.direction === "spike";
          return (
            <div key={`${a.date}-${i}`} onClick={()=>onSelect(a)} className="fade-up" style={{
              animationDelay:`${i*0.03}s`,
              display:'flex',alignItems:'center',justifyContent:'space-between',
              padding:'14px 16px',borderRadius:12,cursor:'pointer',
              border: isActive
                ? '1.5px solid rgba(66,20,95,0.3)'
                : '1px solid rgba(66,20,95,0.08)',
              background: isActive ? 'rgba(66,20,95,0.04)' : 'white',
              transition:'all 0.15s ease',
              boxShadow: isActive ? '0 2px 12px rgba(66,20,95,0.1)' : 'none',
            }}
              onMouseEnter={e=>{if(!isActive)(e.currentTarget as HTMLElement).style.background='rgba(66,20,95,0.02)'}}
              onMouseLeave={e=>{if(!isActive)(e.currentTarget as HTMLElement).style.background='white'}}
            >
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                {/* Direction icon */}
                <div style={{
                  width:32,height:32,borderRadius:8,flexShrink:0,
                  background:isSpike?'rgba(220,38,38,0.08)':'rgba(37,99,235,0.08)',
                  display:'flex',alignItems:'center',justifyContent:'center',
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d={isSpike?"M12 19V5M5 12l7-7 7 7":"M12 5v14M5 12l7 7 7-7"}
                      stroke={isSpike?"#dc2626":"#2563eb"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>

                <span style={{
                  fontSize:11,fontWeight:700,padding:'3px 10px',borderRadius:20,
                  background:isSpike?'rgba(220,38,38,0.08)':'rgba(37,99,235,0.08)',
                  color:isSpike?'#dc2626':'#2563eb',
                }}>
                  {a.direction.toUpperCase()} {a.deviation_pct}%
                </span>

                <div>
                  <p style={{fontSize:13,fontWeight:600,color:'#111827',margin:0}}>{a.date}</p>
                  <p style={{fontSize:11,color:'#9ca3af',margin:'2px 0 0'}}>
                    Actual {fmt(a.value)} · Expected {fmt(a.expected)}
                  </p>
                </div>
              </div>

              <div style={{textAlign:'right',flexShrink:0}}>
                <p style={{fontSize:10,color:'#9ca3af',margin:'0 0 2px'}}>Z-score</p>
                <p style={{fontSize:15,fontWeight:800,color:'#42145f',margin:0}}>{a.z_score.toFixed(2)}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Explanation panel */}
      {activeAnomaly && (
        <div className="fade-up" style={{
          marginTop:16,padding:'16px 20px',borderRadius:12,
          background:'linear-gradient(135deg,rgba(66,20,95,0.04),rgba(107,33,168,0.04))',
          border:'1px solid rgba(66,20,95,0.12)',
        }}>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
            <div style={{width:6,height:6,borderRadius:'50%',background:'#da1884'}}/>
            <p style={{fontSize:11,fontWeight:700,color:'#42145f',textTransform:'uppercase',letterSpacing:'0.06em',margin:0}}>
              AI Explanation — {activeAnomaly.date}
            </p>
          </div>
          {explainLoading
            ? <div style={{display:'flex',gap:6,padding:'4px 0'}}>
                {[0,1,2].map(i=>(
                  <div key={i} className="shimmer" style={{width:8,height:8,borderRadius:'50%',animationDelay:`${i*0.15}s`}}/>
                ))}
              </div>
            : <p style={{fontSize:13,color:'#374151',lineHeight:1.7,margin:0}}>
                {anomalyExplanation || "Click an anomaly above to get an AI explanation."}
              </p>
          }
        </div>
      )}
    </div>
  );
}