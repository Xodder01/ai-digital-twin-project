import React, { useRef, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function TrendChart({ trendData }) {
  if (!trendData || trendData.length === 0) {
    return <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Run simulation to see trend.</div>;
  }

  const data = {
    labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
    datasets: [{
      label: 'Predicted Productivity Trend',
      data: trendData,
      borderColor: '#00e5ff',
      backgroundColor: 'rgba(0, 229, 255, 0.15)',
      borderWidth: 2,
      pointBackgroundColor: '#a855f7',
      pointBorderColor: '#fff',
      pointRadius: 4,
      fill: true,
      tension: 0.4,
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        min: 0, max: 100,
        ticks: { color: '#94a3b8', font: { size: 11 } },
        grid: { color: 'rgba(255,255,255,0.06)' }
      },
      x: {
        ticks: { color: '#94a3b8', font: { size: 11 } },
        grid: { color: 'rgba(255,255,255,0.06)' }
      }
    },
    plugins: {
      legend: { labels: { color: '#ffffff', font: { size: 12 } } }
    }
  };

  return (
    <div className="chart-container">
      <Line data={data} options={options} />
    </div>
  );
}
