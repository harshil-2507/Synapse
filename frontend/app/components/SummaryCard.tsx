interface Props { summary: string; }

export default function SummaryCard({ summary }: Props) {
  return (
    <div className="card border-l-4" style={{borderLeftColor: 'var(--natwest-pink)'}}>
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{background: 'var(--natwest-light)'}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" fill="#42145f"/>
          </svg>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{color: 'var(--natwest-purple)'}}>AI Summary</p>
          <p className="text-gray-700 text-sm leading-relaxed">{summary}</p>
        </div>
      </div>
    </div>
  );
}