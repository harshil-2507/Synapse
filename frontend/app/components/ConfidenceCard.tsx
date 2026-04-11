"use client";
import { useEffect, useState } from "react";
import { Confidence } from "../types";

interface Props { confidence: Confidence; }

export default function ConfidenceCard({ confidence }: Props) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(t);
  }, [confidence.score]);

  const isHigh   = confidence.label === "High";
  const isMedium = confidence.label === "Medium";

  // Theme per confidence level
  const theme = isHigh ? {
    gradientBorder: "linear-gradient(135deg, #15803d, #22c55e, #86efac, #15803d)",
    orbA: "rgba(21,128,61,0.12)", orbB: "rgba(134,239,172,0.1)", orbC: "rgba(21,128,61,0.07)",
    badgeBg: "rgba(21,128,61,0.08)", badgeText: "#15803d",
    glowColor: "rgba(21,128,61,0.25)",
    barColors: "#15803d, #22c55e, #86efac",
  } : isMedium ? {
    gradientBorder: "linear-gradient(135deg, #b45309, #f59e0b, #fcd34d, #b45309)",
    orbA: "rgba(180,83,9,0.12)", orbB: "rgba(245,158,11,0.1)", orbC: "rgba(180,83,9,0.07)",
    badgeBg: "rgba(180,83,9,0.08)", badgeText: "#b45309",
    glowColor: "rgba(180,83,9,0.25)",
    barColors: "#b45309, #f59e0b, #fcd34d",
  } : {
    gradientBorder: "linear-gradient(135deg, #dc2626, #f87171, #fca5a5, #dc2626)",
    orbA: "rgba(220,38,38,0.12)", orbB: "rgba(248,113,113,0.1)", orbC: "rgba(220,38,38,0.07)",
    badgeBg: "rgba(220,38,38,0.08)", badgeText: "#dc2626",
    glowColor: "rgba(220,38,38,0.25)",
    barColors: "#dc2626, #f87171, #fca5a5",
  };

  // SVG arc circumference
  const R = 28;
  const circ = 2 * Math.PI * R;
  const dash = animated ? (confidence.score / 100) * circ : 0;

  return (
    <div className="fade-up">
      <style>{`
        @keyframes confBorderFlow {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes confOrbA {
          0%,100% { transform: translate(0,0) scale(1); opacity:0.7; }
          50% { transform: translate(14px,-10px) scale(1.15); opacity:1; }
        }
        @keyframes confOrbB {
          0%,100% { transform: translate(0,0) scale(1); opacity:0.5; }
          50% { transform: translate(-10px,12px) scale(0.88); opacity:0.8; }
        }
        @keyframes confOrbC {
          0%,100% { transform: translate(0,0); opacity:0.4; }
          33% { transform: translate(8px,6px); opacity:0.7; }
          66% { transform: translate(-6px,-8px); opacity:0.3; }
        }
        @keyframes confBarShimmer {
          0%   { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes confScoreCount {
          from { opacity: 0; transform: scale(0.6); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes confLabelIn {
          from { opacity: 0; transform: translateX(-10px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes confReasonIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes confPulseRing {
          0%   { transform: scale(1); opacity: 0.6; }
          50%  { transform: scale(1.08); opacity: 0.3; }
          100% { transform: scale(1); opacity: 0.6; }
        }
        @keyframes confBarFill {
          from { width: 0%; }
          to   { width: ${confidence.score}%; }
        }
        @keyframes confGaugeDash {
          from { stroke-dashoffset: ${circ}; }
          to   { stroke-dashoffset: ${circ - dash}; }
        }
        @keyframes confTickIn {
          from { opacity:0; transform: scale(0) rotate(-45deg); }
          to   { opacity:1; transform: scale(1) rotate(0deg); }
        }
      `}</style>

      {/* Animated gradient border wrapper */}
      <div style={{
        position: "relative",
        borderRadius: 18,
        padding: "1.5px",
        background: theme.gradientBorder,
        backgroundSize: "300% 300%",
        animation: "confBorderFlow 4s ease infinite",
        boxShadow: `0 4px 24px ${theme.glowColor}, 0 2px 8px rgba(0,0,0,0.06)`,
      }}>
        {/* Inner card */}
        <div style={{
          borderRadius: 16,
          padding: "20px 24px",
          background: "rgba(255,255,255,0.97)",
          position: "relative",
          overflow: "hidden",
        }}>

          {/* Floating orbs */}
          <div style={{position:"absolute",top:-20,right:-20,width:100,height:100,
            background:`radial-gradient(circle, ${theme.orbA} 0%, transparent 70%)`,
            borderRadius:"50%", animation:"confOrbA 7s ease-in-out infinite", pointerEvents:"none"}}/>
          <div style={{position:"absolute",bottom:-15,left:"35%",width:80,height:80,
            background:`radial-gradient(circle, ${theme.orbB} 0%, transparent 70%)`,
            borderRadius:"50%", animation:"confOrbB 9s ease-in-out infinite", pointerEvents:"none"}}/>
          <div style={{position:"absolute",top:"40%",left:"60%",width:60,height:60,
            background:`radial-gradient(circle, ${theme.orbC} 0%, transparent 70%)`,
            borderRadius:"50%", animation:"confOrbC 6s ease-in-out infinite", pointerEvents:"none"}}/>

          {/* Content row */}
          <div style={{display:"flex",alignItems:"center",flexWrap:"wrap",gap:20,position:"relative",zIndex:2}}>

            {/* ── SVG Gauge ── */}
            <div style={{position:"relative",width:72,height:72,flexShrink:0}}>
              {/* Pulse ring behind gauge */}
              <div style={{
                position:"absolute",inset:-6,borderRadius:"50%",
                border:`2px solid ${confidence.color}`,opacity:0.25,
                animation:"confPulseRing 2.5s ease-in-out infinite",
              }}/>
              <svg width="72" height="72" viewBox="0 0 72 72">
                {/* Track */}
                <circle cx="36" cy="36" r={R} fill="none"
                  stroke="#f3f4f6" strokeWidth="5"/>
                {/* Gradient def */}
                <defs>
                  <linearGradient id={`confGrad-${confidence.label}`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={confidence.color}/>
                    <stop offset="100%" stopColor={
                      isHigh ? "#86efac" : isMedium ? "#fcd34d" : "#fca5a5"
                    }/>
                  </linearGradient>
                </defs>
                {/* Progress arc */}
                <circle cx="36" cy="36" r={R} fill="none"
                  stroke={`url(#confGrad-${confidence.label})`}
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={circ}
                  strokeDashoffset={animated ? circ - dash : circ}
                  style={{
                    transform:"rotate(-90deg)",
                    transformOrigin:"center",
                    transition:"stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)",
                    filter:`drop-shadow(0 0 4px ${confidence.color}80)`,
                  }}
                />
              </svg>
              {/* Score number */}
              <div style={{
                position:"absolute",inset:0,display:"flex",flexDirection:"column",
                alignItems:"center",justifyContent:"center",
                animation:"confScoreCount 0.5s ease 0.3s both",
              }}>
                <span style={{
                  fontSize:16,fontWeight:900,color:confidence.color,
                  lineHeight:1,letterSpacing:"-0.03em",
                }}>{confidence.score}</span>
                <span style={{fontSize:8,color:"#9ca3af",fontWeight:600,letterSpacing:"0.05em"}}>/100</span>
              </div>
            </div>

            {/* ── Label + badge ── */}
            <div style={{flexShrink:0, animation:"confLabelIn 0.5s ease 0.2s both"}}>
              <p style={{fontSize:10,fontWeight:700,letterSpacing:"0.1em",
                color:"#9ca3af",textTransform:"uppercase",margin:"0 0 6px"}}>
                Model Confidence
              </p>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <p style={{fontSize:22,fontWeight:900,color:confidence.color,
                  margin:0,letterSpacing:"-0.03em",lineHeight:1}}>
                  {confidence.label}
                </p>
                {/* Animated badge */}
                <span style={{
                  fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:20,
                  background:theme.badgeBg,color:theme.badgeText,
                  border:`1px solid ${confidence.color}30`,
                  animation:"confTickIn 0.4s ease 0.6s both",
                }}>
                  {isHigh ? "✓ Reliable" : isMedium ? "~ Moderate" : "! Limited"}
                </span>
              </div>
            </div>

            {/* ── Reason text ── */}
            <div style={{flex:1,minWidth:180, animation:"confReasonIn 0.5s ease 0.4s both"}}>
              <p style={{fontSize:13,color:"#4b5563",lineHeight:1.65,margin:0}}>
                {confidence.reason}
              </p>
            </div>

            {/* ── Progress bar ── */}
            <div style={{width:130,flexShrink:0, animation:"confReasonIn 0.5s ease 0.5s both"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                <span style={{fontSize:9,fontWeight:600,color:"#9ca3af",letterSpacing:"0.05em"}}>LOW</span>
                <span style={{fontSize:9,fontWeight:600,color:"#9ca3af",letterSpacing:"0.05em"}}>HIGH</span>
              </div>
              <div style={{height:7,background:"#f3f4f6",borderRadius:4,overflow:"hidden",position:"relative"}}>
                {/* Animated fill */}
                <div style={{
                  position:"absolute",top:0,left:0,height:"100%",borderRadius:4,
                  background:`linear-gradient(90deg, ${theme.barColors})`,
                  backgroundSize:"200% 100%",
                  width: animated ? `${confidence.score}%` : "0%",
                  transition:"width 1.2s cubic-bezier(0.4,0,0.2,1)",
                  animation:`confBarShimmer 2s linear infinite`,
                  boxShadow:`0 0 8px ${confidence.color}60`,
                }}/>
              </div>
              {/* Tick marks */}
              <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
                {[0,25,50,75,100].map(v => (
                  <div key={v} style={{
                    width:1,height:4,
                    background: confidence.score >= v ? confidence.color : "#e5e7eb",
                    borderRadius:1,
                    transition:`background 0.3s ease ${v*0.008}s`,
                  }}/>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}