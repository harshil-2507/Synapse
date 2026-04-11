import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ForecastIQ — AI Predictive Forecasting",
  description: "Transform historical data into actionable forecasts",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen" style={{background: 'linear-gradient(160deg, #f8f5fc 0%, #f0e8f8 50%, #f5f0fc 100%)'}}>
        {/* Header */}
        <header style={{
          background: 'rgba(255,255,255,0.75)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(66,20,95,0.08)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}>
          <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Logo mark */}
              <div style={{
                width: 36, height: 36,
                background: 'linear-gradient(135deg, #42145f, #6b21a8)',
                borderRadius: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(66,20,95,0.3)'
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M3 17l5-5 4 4 9-9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span style={{fontWeight: 800, fontSize: 18, color: '#42145f', letterSpacing: '-0.02em'}}>SYNAPSE</span>
                  <span style={{fontSize: 11, color: '#9ca3af', fontWeight: 500}}></span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div style={{width: 7, height: 7, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e'}}></div>
              <span style={{fontSize: 12, color: '#6b7280', fontWeight: 500}}>Live</span>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
      </body>
    </html>
  );
}