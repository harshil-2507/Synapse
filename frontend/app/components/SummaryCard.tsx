"use client";
import { useState } from "react";

interface Props { summary: string; }

export default function SummaryCard({ summary }: Props) {
  const [phase, setPhase] = useState<"idle" | "loading" | "done">("idle");

  const handleInterpret = () => {
    setPhase("loading");
    setTimeout(() => setPhase("done"), 2200);
  };

  return (
    <div className="fade-up">
      <style>{`
        @keyframes aiBarFlow {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes aiBarWidth {
          0%   { width: 0%; opacity: 1; }
          70%  { width: 85%; opacity: 1; }
          90%  { width: 100%; opacity: 1; }
          100% { width: 100%; opacity: 0; }
        }
        @keyframes contentReveal {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes labelSlideIn {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes wordAppear {
          from { opacity: 0; filter: blur(4px); transform: translateY(4px); }
          to   { opacity: 1; filter: blur(0); transform: translateY(0); }
        }
        @keyframes orbDrift1 {
          0%,100% { transform: translate(0,0) scale(1); opacity: 0.6; }
          50% { transform: translate(16px,-10px) scale(1.15); opacity: 0.9; }
        }
        @keyframes orbDrift2 {
          0%,100% { transform: translate(0,0) scale(1); opacity: 0.4; }
          50% { transform: translate(-12px,14px) scale(0.88); opacity: 0.7; }
        }
        @keyframes orbDrift3 {
          0%,100% { transform: translate(0,0) scale(1); opacity: 0.5; }
          33% { transform: translate(10px,8px) scale(1.1); opacity: 0.8; }
          66% { transform: translate(-8px,-6px) scale(0.92); opacity: 0.4; }
        }
        @keyframes dotBounce {
          0%,100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes borderGlow {
          0%,100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        @keyframes sparkSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes buttonShimmer {
          0%   { left: -100%; }
          100% { left: 200%; }
        }
      `}</style>

      {/* ── IDLE: just the button ── */}
      {phase === "idle" && (
        <div style={{ display: "flex", justifyContent: "flex-start" }}>
          <button
            onClick={handleInterpret}
            style={{
              position: "relative", overflow: "hidden",
              display: "flex", alignItems: "center", gap: 10,
              padding: "12px 24px",
              background: "linear-gradient(135deg, #42145f 0%, #6b21a8 50%, #42145f 100%)",
              backgroundSize: "200% 200%",
              animation: "aiBarFlow 3s ease infinite",
              border: "none", borderRadius: 12,
              color: "white", fontSize: 14, fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 4px 20px rgba(66,20,95,0.35), 0 2px 8px rgba(218,24,132,0.2)",
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-1px)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}
          >
            {/* shimmer on button */}
            <div style={{
              position: "absolute", top: 0, bottom: 0, width: "35%",
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)",
              animation: "buttonShimmer 2s ease-in-out infinite",
              pointerEvents: "none",
            }}/>
            {/* spark icon */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{flexShrink:0}}>
              <path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5L12 2z"
                fill="rgba(255,255,255,0.9)" stroke="white" strokeWidth="0.5"/>
            </svg>
            <span style={{position:"relative",zIndex:1}}>Interpret Forecast</span>
          </button>
        </div>
      )}

      {/* ── LOADING: Google AI Mode progress bar ── */}
      {phase === "loading" && (
        <div style={{
          background: "white",
          border: "1px solid rgba(66,20,95,0.1)",
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 2px 16px rgba(66,20,95,0.08)",
        }}>
          {/* The Google AI bar */}
          <div style={{ position: "relative", height: 3, background: "rgba(66,20,95,0.06)" }}>
            <div style={{
              position: "absolute", top: 0, left: 0, height: "100%",
              background: "linear-gradient(90deg, #da1884, #6b21a8, #2563eb, #06b6d4, #6b21a8, #da1884)",
              backgroundSize: "300% 100%",
              animation: "aiBarWidth 2.2s cubic-bezier(0.4,0,0.2,1) forwards, aiBarFlow 1.5s ease infinite",
              borderRadius: "0 2px 2px 0",
              boxShadow: "0 0 12px rgba(218,24,132,0.5), 0 0 6px rgba(107,33,168,0.4)",
            }}/>
          </div>

          {/* Loading content */}
          <div style={{ padding: "24px 28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: "linear-gradient(135deg, #fdf2f8, #ede9fe)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  style={{ animation: "sparkSpin 2s linear infinite" }}>
                  <path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5L12 2z"
                    fill="url(#lg1)" stroke="none"/>
                  <defs>
                    <linearGradient id="lg1" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#da1884"/>
                      <stop offset="100%" stopColor="#6b21a8"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div>
                <div style={{
                  fontSize: 10, fontWeight: 800, letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  background: "linear-gradient(90deg, #da1884, #6b21a8)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  marginBottom: 8,
                }}>
                  Forecast Interpretation
                </div>
                {/* Skeleton shimmer lines */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[100, 85, 70].map((w, i) => (
                    <div key={i} style={{
                      height: 10, width: `${w}%`, borderRadius: 5,
                      background: "linear-gradient(90deg, #f3e8ff 25%, #ede8f5 50%, #f3e8ff 75%)",
                      backgroundSize: "200% 100%",
                      animation: `aiBarFlow 1.4s ease ${i * 0.15}s infinite`,
                    }}/>
                  ))}
                </div>
              </div>
            </div>

            {/* Thinking dots */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 16, paddingLeft: 48 }}>
              <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 500 }}>Analysing patterns</span>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 5, height: 5, borderRadius: "50%",
                  background: i === 0 ? "#da1884" : i === 1 ? "#6b21a8" : "#2563eb",
                  animation: `dotBounce 1s ease-in-out ${i * 0.2}s infinite`,
                }}/>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── DONE: full animated reveal ── */}
      {phase === "done" && (
        <div style={{
          position: "relative",
          borderRadius: 16,
          padding: "1.5px",
          background: "linear-gradient(135deg, #da1884, #6b21a8, #2563eb, #06b6d4, #6b21a8, #da1884)",
          backgroundSize: "300% 300%",
          animation: "aiBarFlow 5s ease infinite, borderGlow 3s ease infinite",
          boxShadow: "0 4px 28px rgba(218,24,132,0.15), 0 2px 12px rgba(66,20,95,0.1)",
        }}>
          <div style={{
            borderRadius: 14, padding: "22px 26px",
            background: "rgba(255,255,255,0.98)",
            position: "relative", overflow: "hidden",
            animation: "contentReveal 0.5s ease forwards",
          }}>

            {/* Floating orbs */}
            {[
              { top: -24, right: -24, size: 110, color: "rgba(218,24,132,0.1)", anim: "orbDrift1 7s ease-in-out infinite" },
              { bottom: -18, right: "25%", size: 80, color: "rgba(66,20,95,0.08)", anim: "orbDrift2 9s ease-in-out infinite" },
              { top: "30%", left: "55%", size: 60, color: "rgba(37,99,235,0.07)", anim: "orbDrift3 6s ease-in-out infinite" },
            ].map((orb, i) => (
              <div key={i} style={{
                position: "absolute",
                top: orb.top as any, bottom: orb.bottom as any,
                right: orb.right as any, left: orb.left as any,
                width: orb.size, height: orb.size,
                background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
                borderRadius: "50%",
                animation: orb.anim,
                pointerEvents: "none",
              }}/>
            ))}

            {/* Content */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14, position: "relative", zIndex: 2 }}>

              {/* Icon */}
              <div style={{
                width: 38, height: 38, borderRadius: 10, flexShrink: 0, marginTop: 1,
                background: "linear-gradient(135deg, #fdf2f8, #ede9fe)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 0 0 0 rgba(218,24,132,0.3)",
                animation: "contentReveal 0.4s ease forwards",
              }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5L12 2z"
                    fill="url(#lg2)" />
                  <defs>
                    <linearGradient id="lg2" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#da1884"/>
                      <stop offset="100%" stopColor="#6b21a8"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              <div style={{ flex: 1 }}>
                {/* Label row */}
                <div style={{
                  display: "flex", alignItems: "center", gap: 8, marginBottom: 10,
                  animation: "labelSlideIn 0.5s ease forwards",
                }}>
                  <span style={{
                    fontSize: 10, fontWeight: 800, letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    background: "linear-gradient(90deg, #da1884, #6b21a8, #2563eb)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  }}>
                    Forecast Interpretation
                  </span>
                  {/* Live indicator */}
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <div style={{
                      width: 6, height: 6, borderRadius: "50%", background: "#da1884",
                      boxShadow: "0 0 6px #da1884",
                    }}/>
                    <span style={{ fontSize: 10, color: "#9ca3af", fontWeight: 500 }}>llama-3.3-70b-versatile</span>
                  </div>
                  {/* Re-run button */}
                  <button onClick={() => setPhase("idle")} style={{
                    marginLeft: "auto", fontSize: 10, color: "#9ca3af",
                    background: "none", border: "1px solid rgba(66,20,95,0.1)",
                    borderRadius: 6, padding: "2px 8px", cursor: "pointer",
                    fontWeight: 500,
                  }}>
                    Re-run
                  </button>
                </div>

                {/* Word-by-word animated text */}
                <p style={{ fontSize: 14, lineHeight: 1.8, margin: 0 }}>
                  {summary.split(" ").map((word, i) => (
                    <span key={i} style={{
                      display: "inline-block",
                      color: "#374151",
                      animation: `wordAppear 0.4s ease ${0.05 + i * 0.04}s both`,
                      marginRight: 4,
                    }}>
                      {word}
                    </span>
                  ))}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}