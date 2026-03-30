import { useState } from "react";

function History() {
  const [selectedFilter, setSelectedFilter] = useState("all");

  const data = [
    { id: 1, date: "30 March 2025", productivity: 82, burnout: "Low", workHours: 8, sleepHours: 7 },
    { id: 2, date: "28 March 2025", productivity: 78, burnout: "Low", workHours: 7, sleepHours: 8 },
    { id: 3, date: "25 March 2025", productivity: 65, burnout: "Medium", workHours: 10, sleepHours: 5 },
    { id: 4, date: "22 March 2025", productivity: 55, burnout: "Medium", workHours: 11, sleepHours: 5 },
    { id: 5, date: "18 March 2025", productivity: 88, burnout: "Low", workHours: 6, sleepHours: 8 },
    { id: 6, date: "15 March 2025", productivity: 70, burnout: "Low", workHours: 8, sleepHours: 7 }
  ];

  const filteredData = selectedFilter === "all" 
    ? data 
    : data.filter(item => item.burnout === selectedFilter);

  const getBurnoutStyle = (burnout) => {
    switch (burnout) {
      case "Low":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "Medium":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      default:
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-cyan-400";
    if (score >= 40) return "text-amber-400";
    return "text-rose-400";
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#0a0f1a] text-white py-10 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Prediction History</h1>
            <p className="text-slate-400 text-sm">Review your past productivity analyses</p>
          </div>
          
          {/* Filter */}
          <div className="flex gap-2">
            {["all", "Low", "Medium", "High"].map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedFilter === filter
                    ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                    : "bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:text-white hover:border-slate-600"
                }`}
              >
                {filter === "all" ? "All" : filter}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-900/50 rounded-xl border border-slate-800/50 p-4">
            <div className="text-2xl font-bold text-white">{data.length}</div>
            <div className="text-xs text-slate-400">Total Predictions</div>
          </div>
          <div className="bg-slate-900/50 rounded-xl border border-slate-800/50 p-4">
            <div className="text-2xl font-bold text-cyan-400">
              {Math.round(data.reduce((acc, item) => acc + item.productivity, 0) / data.length)}%
            </div>
            <div className="text-xs text-slate-400">Average Score</div>
          </div>
          <div className="bg-slate-900/50 rounded-xl border border-slate-800/50 p-4">
            <div className="text-2xl font-bold text-emerald-400">
              {data.filter(d => d.burnout === "Low").length}
            </div>
            <div className="text-xs text-slate-400">Low Risk Days</div>
          </div>
          <div className="bg-slate-900/50 rounded-xl border border-slate-800/50 p-4">
            <div className="text-2xl font-bold text-amber-400">
              {data.filter(d => d.burnout === "Medium").length}
            </div>
            <div className="text-xs text-slate-400">Medium Risk Days</div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-slate-900/50 rounded-2xl border border-slate-800/50 overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800/50">
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Productivity</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Burnout Risk</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Work Hours</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Sleep</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-slate-800/50 flex items-center justify-center">
                          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <span className="text-sm font-medium text-white">{item.date}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                            style={{ width: `${item.productivity}%` }}
                          />
                        </div>
                        <span className={`text-sm font-semibold ${getScoreColor(item.productivity)}`}>
                          {item.productivity}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getBurnoutStyle(item.burnout)}`}>
                        {item.burnout}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">{item.workHours}h</td>
                    <td className="px-6 py-4 text-sm text-slate-300">{item.sleepHours}h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-slate-800/50">
            {filteredData.map((item) => (
              <div key={item.id} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-white">{item.date}</span>
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getBurnoutStyle(item.burnout)}`}>
                    {item.burnout}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                      <span>Productivity</span>
                      <span className={getScoreColor(item.productivity)}>{item.productivity}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                        style={{ width: `${item.productivity}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-xs text-slate-400">
                    <div>{item.workHours}h work</div>
                    <div>{item.sleepHours}h sleep</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {filteredData.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-slate-400">No records found for this filter</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default History;
