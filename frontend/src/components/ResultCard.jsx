function ResultCard({ productivity, burnout }) {
  const getBurnoutConfig = () => {
    switch (burnout) {
      case "Low":
        return {
          color: "text-emerald-400",
          bgColor: "bg-emerald-500/10",
          borderColor: "border-emerald-500/20",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        };
      case "Medium":
        return {
          color: "text-amber-400",
          bgColor: "bg-amber-500/10",
          borderColor: "border-amber-500/20",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )
        };
      default:
        return {
          color: "text-rose-400",
          bgColor: "bg-rose-500/10",
          borderColor: "border-rose-500/20",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        };
    }
  };

  const config = getBurnoutConfig();

  const getProductivityGrade = () => {
    if (productivity >= 80) return { grade: "Excellent", color: "text-emerald-400" };
    if (productivity >= 60) return { grade: "Good", color: "text-cyan-400" };
    if (productivity >= 40) return { grade: "Average", color: "text-amber-400" };
    return { grade: "Needs Improvement", color: "text-rose-400" };
  };

  const gradeInfo = getProductivityGrade();

  return (
    <div className="mt-8 rounded-xl bg-slate-800/30 border border-slate-700/50 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-800/20">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h2 className="text-sm font-medium text-slate-300">Prediction Result</h2>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Productivity Score */}
        <div className="text-center mb-6">
          <div className="text-6xl font-bold text-white mb-2">
            {productivity}
            <span className="text-3xl text-slate-500">%</span>
          </div>
          <div className={`text-sm font-medium ${gradeInfo.color}`}>
            {gradeInfo.grade}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-slate-500 mb-2">
            <span>0%</span>
            <span>Productivity Score</span>
            <span>100%</span>
          </div>
          <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${productivity}%` }}
            />
          </div>
        </div>

        {/* Burnout Risk */}
        <div className={`flex items-center justify-between p-4 rounded-lg ${config.bgColor} border ${config.borderColor}`}>
          <div className="flex items-center gap-3">
            <div className={config.color}>{config.icon}</div>
            <span className="text-sm text-slate-300">Burnout Risk Level</span>
          </div>
          <span className={`text-sm font-semibold ${config.color}`}>{burnout}</span>
        </div>
      </div>
    </div>
  );
}

export default ResultCard;
