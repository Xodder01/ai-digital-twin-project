import React, { useState } from 'react';

export default function SimulationPanel({ onSimulate, loading, persona, onPersonaChange, className = '' }) {
  const [sleep, setSleep]   = useState(7.0);
  const [study, setStudy]   = useState(5.0);
  const [screen, setScreen] = useState(4.0);
  const [stress, setStress] = useState(5);

  const handleRun = () => {
    onSimulate({
      sleep_hours: sleep,
      study_hours: study,
      screen_time_hours: screen,
      stress_level: stress
    });
  };

  return (
    <aside className={`right-sidebar ${className}`}>
      <h3 className="sidebar-title">Simulation Settings</h3>

      <div className="persona-box">
        <label>Twin Persona Mode</label>
        <select className="persona-select" value={persona} onChange={e => onPersonaChange(e.target.value)}>
          <option value="student">🎓 University Student</option>
          <option value="normal">👤 Normal User</option>
        </select>
      </div>

      <div className="slider-group">
        <div className="slider-label"><span>Sleep</span><span className="slider-val">{sleep}</span></div>
        <input type="range" min={2} max={14} step={0.5} value={sleep} onChange={e => setSleep(parseFloat(e.target.value))} />
      </div>

      <div className="slider-group">
        <div className="slider-label">
          <span>{persona === 'normal' ? 'Work Hours' : 'Study Hours'}</span>
          <span className="slider-val">{study}</span>
        </div>
        <input type="range" min={0} max={14} step={0.5} value={study} onChange={e => setStudy(parseFloat(e.target.value))} />
      </div>

      <div className="slider-group">
        <div className="slider-label"><span>Screen Time</span><span className="slider-val">{screen}</span></div>
        <input type="range" min={0} max={14} step={0.5} value={screen} onChange={e => setScreen(parseFloat(e.target.value))} />
      </div>

      <div className="slider-group">
        <div className="slider-label"><span>Stress (1-10)</span><span className="slider-val">{stress}</span></div>
        <input type="range" min={1} max={10} step={1} value={stress} onChange={e => setStress(parseInt(e.target.value))} />
      </div>

      <button className="run-btn" onClick={handleRun} disabled={loading}>
        {loading ? 'Simulating...' : 'Run "What-If" Simulation'}
      </button>
    </aside>
  );
}
