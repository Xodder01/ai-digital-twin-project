import React from 'react';

function getValueClass(value, thresholds) {
  if (value === null || value === undefined || value === '--') return '';
  const num = parseFloat(value);
  if (isNaN(num)) return '';
  if (num >= thresholds.good) return 'good';
  if (num >= thresholds.warn) return 'warn';
  return 'danger';
}

export default function MetricsGrid({ data, persona }) {
  const cards = [
    {
      title: 'Productivity Score',
      value: data.productivity_score != null ? data.productivity_score : '--',
      thresholds: { good: 70, warn: 40 }
    },
    {
      title: 'Burnout Risk',
      value: data.burnout_risk != null
        ? (data.burnout_risk === 1 ? 'HIGH' : 'LOW')
        : '--',
      cls: data.burnout_risk === 1 ? 'danger' : data.burnout_risk === 0 ? 'good' : '',
      fontSize: '2rem'
    },
    ...(persona !== 'normal' ? [{
      title: 'Exam Prediction',
      value: data.exam_score != null ? data.exam_score + '%' : '--',
      thresholds: { good: 70, warn: 50 }
    }] : []),
    {
      title: 'Focus Index',
      value: data.focus_index != null ? data.focus_index + '/10' : '--/10',
      thresholds: { good: 7, warn: 4 }
    },
    {
      title: 'Goal Probability',
      value: data.goal_probability != null ? data.goal_probability + '%' : '--',
      thresholds: { good: 75, warn: 40 }
    }
  ];

  return (
    <div className="metrics-grid" style={{ gridTemplateColumns: `repeat(${cards.length}, 1fr)` }}>
      {cards.map((c, i) => {
        let valueClass = '';
        if (c.cls) {
          valueClass = c.cls;
        } else if (c.thresholds && c.value !== '--' && c.value !== '--/10') {
          const num = parseFloat(c.value);
          if (!isNaN(num)) valueClass = getValueClass(num, c.thresholds);
        }

        return (
          <div className="metric-card" key={i}>
            <div className="metric-title">{c.title}</div>
            <div
              className={`metric-value ${valueClass}`}
              style={c.fontSize ? { fontSize: c.fontSize } : undefined}
            >
              {c.value}
            </div>
          </div>
        );
      })}
    </div>
  );
}
