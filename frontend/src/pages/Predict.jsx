import { useState } from "react";
import ResultCard from "../components/ResultCard";

function Predict() {
  const [formData, setFormData] = useState({
    working_hours: "",
    sleep_hours: "",
    stress_level: "",
    tasks_completed: "",
    break_time: ""
  });

  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setResult({
        productivity: 82,
        burnout: "Low"
      });
      setIsLoading(false);
    }, 800);
  };

  const inputFields = [
    { name: "working_hours", label: "Working Hours", placeholder: "e.g., 8", icon: "clock" },
    { name: "sleep_hours", label: "Sleep Hours", placeholder: "e.g., 7", icon: "moon" },
    { name: "stress_level", label: "Stress Level", placeholder: "1-10", icon: "activity" },
    { name: "tasks_completed", label: "Tasks Completed", placeholder: "e.g., 5", icon: "check" },
    { name: "break_time", label: "Break Time (min)", placeholder: "e.g., 60", icon: "coffee" }
  ];

  const getIcon = (type) => {
    const icons = {
      clock: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
      moon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />,
      activity: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />,
      check: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />,
      coffee: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 14v6m-3-3h6M6 10h2a4 4 0 014 4v1a3 3 0 01-3 3H6v-4m0-4V6a2 2 0 012-2h4a2 2 0 012 2v4M6 10h8" />
    };
    return icons[type];
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#0a0f1a] text-white py-12 px-6">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 mb-4">
            <svg className="w-7 h-7 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Productivity Prediction</h1>
          <p className="text-slate-400 text-sm">Enter your daily metrics for accurate analysis</p>
        </div>

        {/* Form Card */}
        <div className="bg-slate-900/50 rounded-2xl border border-slate-800/50 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {inputFields.map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  {field.label}
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {getIcon(field.icon)}
                    </svg>
                  </div>
                  <input
                    type="number"
                    name={field.name}
                    placeholder={field.placeholder}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 focus:border-cyan-500/50 focus:bg-slate-800/80 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 transition-all"
                  />
                </div>
              </div>
            ))}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 py-4 rounded-xl text-base font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </>
              ) : (
                "Generate Prediction"
              )}
            </button>
          </form>

          {result && <ResultCard productivity={result.productivity} burnout={result.burnout} />}
        </div>
      </div>
    </div>
  );
}

export default Predict;
