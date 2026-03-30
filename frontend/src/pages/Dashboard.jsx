import { Link } from "react-router-dom";

function Dashboard() {
  const stats = [
    {
      label: "Productivity Score",
      value: "82%",
      change: "+5%",
      changeType: "positive",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      color: "cyan"
    },
    {
      label: "Burnout Risk",
      value: "Low",
      change: "Healthy",
      changeType: "positive",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      color: "emerald"
    },
    {
      label: "Total Predictions",
      value: "6",
      change: "This month",
      changeType: "neutral",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: "violet"
    }
  ];

  const recentActivity = [
    { date: "Today", score: 82, status: "Low Risk" },
    { date: "Yesterday", score: 78, status: "Low Risk" },
    { date: "Mar 28", score: 65, status: "Medium Risk" }
  ];

  const getColorClasses = (color) => {
    const colors = {
      cyan: { bg: "bg-cyan-500/10", text: "text-cyan-400", border: "border-cyan-500/20" },
      emerald: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
      violet: { bg: "bg-violet-500/10", text: "text-violet-400", border: "border-violet-500/20" }
    };
    return colors[color];
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#0a0f1a] text-white py-10 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
            <p className="text-slate-400 text-sm">Overview of your productivity metrics</p>
          </div>
          <Link to="/predict">
            <button className="px-5 py-2.5 rounded-lg text-sm font-medium bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/20">
              New Prediction
            </button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-5 mb-8">
          {stats.map((stat, index) => {
            const colors = getColorClasses(stat.color);
            return (
              <div
                key={index}
                className="bg-slate-900/50 rounded-2xl border border-slate-800/50 p-6 hover:border-slate-700/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-2.5 rounded-xl ${colors.bg} ${colors.text}`}>
                    {stat.icon}
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    stat.changeType === "positive" 
                      ? "bg-emerald-500/10 text-emerald-400" 
                      : "bg-slate-700/50 text-slate-400"
                  }`}>
                    {stat.change}
                  </span>
                </div>
                <div className={`text-3xl font-bold ${colors.text} mb-1`}>
                  {stat.value}
                </div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="grid lg:grid-cols-3 gap-5">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-slate-900/50 rounded-2xl border border-slate-800/50 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
              <Link to="/history" className="text-sm text-cyan-400 hover:text-cyan-300 transition">
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {recentActivity.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border border-slate-700/30"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-cyan-400">{item.score}</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{item.date}</div>
                      <div className="text-xs text-slate-500">Productivity Score</div>
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${
                    item.status === "Low Risk"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-amber-500/10 text-amber-400"
                  }`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-slate-900/50 rounded-2xl border border-slate-800/50 p-6">
            <h2 className="text-lg font-semibold text-white mb-6">Quick Actions</h2>
            <div className="space-y-3">
              <Link to="/predict" className="block">
                <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/30 hover:border-cyan-500/30 hover:bg-slate-800/50 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500/20 transition">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-slate-300 group-hover:text-white transition">
                      New Prediction
                    </span>
                  </div>
                </div>
              </Link>
              <Link to="/history" className="block">
                <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/30 hover:border-cyan-500/30 hover:bg-slate-800/50 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400 group-hover:bg-violet-500/20 transition">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-slate-300 group-hover:text-white transition">
                      View History
                    </span>
                  </div>
                </div>
              </Link>
              <Link to="/about" className="block">
                <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/30 hover:border-cyan-500/30 hover:bg-slate-800/50 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 transition">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-slate-300 group-hover:text-white transition">
                      Learn More
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
