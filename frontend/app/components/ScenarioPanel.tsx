"use client";
import { ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const fmt = (v: number) => v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M` : `$${(v / 1_000).toFixed(0)}K`;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{background:'white',border:'1px solid rgba(66,20,95,0.1)',borderRadius:12,padding:'12px 16px',boxShadow:'0 8px 24px rgba(66,20,95,0.12)',fontSize:12}}>
      <p style={{fontWeight:700,color:'#374151',margin:'0 0 8px'}}>{label}</p>
      {payload.map((p: any) => p.value != null && (
        <div key={p.name} style={{display:'flex',justifyContent:'space-between',gap:16,marginBottom:3}}>
          <span style={{color:p.color,fontWeight:500}}>{p.name}</span>
          <span style={{fontWeight:700,color:'#111827'}}>{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

interface Props {
  growthRate: number; removeOutliers: boolean; scenarioLoading: boolean;
  scenarioChartData: any[]; hasScenario: boolean;
  onGrowthChange: (v: number) => void; onOutliersChange: (v: boolean) => void; onRun: () => void;
}

export default function ScenarioPanel({ growthRate, removeOutliers, scenarioLoading, scenarioChartData, hasScenario, onGrowthChange, onOutliersChange, onRun }: Props) {
  const baselineAvg = scenarioChartData.length
    ? scenarioChartData.reduce((s,p)=>s+(p.Baseline||0),0)/scenarioChartData.length : 0;
  const scenarioAvg = scenarioChartData.length
    ? scenarioChartData.reduce((s,p)=>s+(p.Scenario||0),0)/scenarioChartData.length : 0;
  const diff = baselineAvg > 0 ? ((scenarioAvg - baselineAvg)/baselineAvg*100).toFixed(1) : "0";

  return (
    <div style={{marginTop:16,display:'flex',flexDirection:'column',gap:16}}>

      {/* Controls */}
      <div className="card fade-up">
        <div style={{marginBottom:20}}>
          <h2 style={{fontWeight:700,color:'#111827',fontSize:16,margin:0}}>Scenario Simulator</h2>
          <p style={{fontSize:12,color:'#9ca3af',margin:'4px 0 0'}}>
            Adjust growth assumptions and compare against the baseline forecast
          </p>
        </div>

        <div style={{display:'flex',flexWrap:'wrap',alignItems:'flex-end',gap:24}}>
          {/* Slider */}
          <div style={{flex:1,minWidth:200}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
              <label style={{fontSize:12,fontWeight:600,color:'#6b7280'}}>Growth Rate Adjustment</label>
              <span style={{
                fontSize:14,fontWeight:800,color:'#42145f',
                background:'rgba(66,20,95,0.08)',padding:'2px 10px',borderRadius:6,
              }}>
                {growthRate > 0 ? `+${growthRate}` : growthRate}%
              </span>
            </div>
            <input type="range" min={-30} max={30} value={growthRate}
              onChange={e=>onGrowthChange(Number(e.target.value))}
              style={{width:'100%',accentColor:'#42145f',height:4}}/>
            <div style={{display:'flex',justifyContent:'space-between',marginTop:4}}>
              <span style={{fontSize:10,color:'#9ca3af'}}>-30%</span>
              <span style={{fontSize:10,color:'#9ca3af'}}>+30%</span>
            </div>
          </div>

          {/* Outliers toggle */}
          <div style={{display:'flex',alignItems:'center',gap:8,paddingBottom:4}}>
            <div onClick={()=>onOutliersChange(!removeOutliers)} style={{
              width:40,height:22,borderRadius:11,cursor:'pointer',position:'relative',
              background:removeOutliers?'#42145f':'#e5e7eb',transition:'background 0.2s',
            }}>
              <div style={{
                position:'absolute',top:3,width:16,height:16,borderRadius:'50%',background:'white',
                left:removeOutliers?20:3,transition:'left 0.2s',boxShadow:'0 1px 4px rgba(0,0,0,0.2)',
              }}/>
            </div>
            <label style={{fontSize:13,color:'#374151',fontWeight:500,cursor:'pointer'}}
              onClick={()=>onOutliersChange(!removeOutliers)}>
              Remove outliers
            </label>
          </div>

          <button onClick={onRun} disabled={scenarioLoading} style={{
            padding:'10px 24px',background:'linear-gradient(135deg,#42145f,#6b21a8)',
            color:'white',border:'none',borderRadius:10,fontSize:13,fontWeight:700,
            cursor:scenarioLoading?'not-allowed':'pointer',opacity:scenarioLoading?0.7:1,
            boxShadow:'0 4px 12px rgba(66,20,95,0.3)',transition:'transform 0.15s,box-shadow 0.15s',
          }}
            onMouseEnter={e=>{if(!scenarioLoading)(e.currentTarget.style.transform='translateY(-1px)')}}
            onMouseLeave={e=>(e.currentTarget.style.transform='translateY(0)')}>
            {scenarioLoading ? "Running..." : "Run Scenario"}
          </button>
        </div>
      </div>

      {/* Results */}
      {hasScenario && scenarioChartData.length > 0 && (
        <div className="card fade-up">
          <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:20,flexWrap:'wrap',gap:12}}>
            <div>
              <h3 style={{fontWeight:700,color:'#111827',fontSize:15,margin:0}}>
                Baseline vs Scenario ({growthRate>0?`+${growthRate}`:growthRate}% growth)
              </h3>
              <p style={{fontSize:12,color:'#9ca3af',margin:'4px 0 0'}}>Forecast period only · shaded area shows uncertainty range</p>
            </div>
            <div style={{
              background: Number(diff) >= 0 ? 'rgba(21,128,61,0.08)' : 'rgba(220,38,38,0.08)',
              border: `1px solid ${Number(diff)>=0?'rgba(21,128,61,0.2)':'rgba(220,38,38,0.2)'}`,
              borderRadius:8,padding:'4px 12px',fontSize:13,fontWeight:700,
              color: Number(diff)>=0?'#15803d':'#dc2626',
            }}>
              {Number(diff)>=0?'+':''}{diff}% vs baseline
            </div>
          </div>

          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart data={scenarioChartData} margin={{top:4,right:4,bottom:4,left:4}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3e8ff" vertical={false}/>
              <XAxis dataKey="date" tick={{fontSize:10,fill:'#9ca3af'}} tickLine={false} axisLine={false}/>
              <YAxis tickFormatter={fmt} tick={{fontSize:10,fill:'#9ca3af'}} tickLine={false} axisLine={false}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Legend wrapperStyle={{fontSize:12,paddingTop:12}}/>
              <Area dataKey="Scenario Upper" fill="rgba(66,20,95,0.05)" stroke="transparent" legendType="none"/>
              <Area dataKey="Scenario Lower" fill="white" stroke="transparent" legendType="none"/>
              <Line dataKey="Baseline" stroke="#94a3b8" strokeWidth={2} dot={false} strokeDasharray="5 3"/>
              <Line dataKey="Scenario" stroke="#42145f" strokeWidth={2.5} dot={false}/>
            </ComposedChart>
          </ResponsiveContainer>

          {/* Summary cards */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginTop:16}}>
            {[
              {label:'Baseline avg (forecast period)',value:fmt(baselineAvg),accent:'#94a3b8'},
              {label:`Scenario avg (${growthRate>0?`+${growthRate}`:growthRate}% growth)`,value:fmt(scenarioAvg),accent:'#42145f'},
            ].map(s=>(
              <div key={s.label} style={{
                padding:'16px 20px',borderRadius:12,textAlign:'center',
                background:'rgba(66,20,95,0.03)',border:'1px solid rgba(66,20,95,0.08)',
              }}>
                <p style={{fontSize:22,fontWeight:800,color:s.accent,margin:'0 0 4px',letterSpacing:'-0.02em'}}>{s.value}</p>
                <p style={{fontSize:11,color:'#9ca3af',margin:0}}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}