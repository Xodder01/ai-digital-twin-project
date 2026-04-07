import React from 'react';

export default function HabitImpact({ impactData }) {
  if (!impactData || Object.keys(impactData).length === 0) {
    return <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Run simulation to analyze impacts.</div>;
  }

  return (
    <div>
      {Object.entries(impactData).map(([habit, val]) => {
        const isPositive = val >= 0;
        return (
          <div className="impact-row" key={habit} style={{ borderLeft: `4px solid ${isPositive ? 'var(--success)' : 'var(--danger)'}` }}>
            <span className="impact-label">{habit}</span>
            <span className={isPositive ? 'impact-pos' : 'impact-neg'}>
              {isPositive ? '+' : ''}{val}% Impact
            </span>
          </div>
        );
      })}
    </div>
  );
}
