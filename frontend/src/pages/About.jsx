import { Link } from "react-router-dom";

function About() {
  const steps = [
    {
      number: "01",
      title: "Input Your Data",
      description: "Enter your daily metrics including work hours, sleep patterns, stress levels, and task completion rates."
    },
    {
      number: "02",
      title: "AI Processing",
      description: "Our machine learning model analyzes your data using advanced algorithms trained on behavioral patterns."
    },
    {
      number: "03",
      title: "Get Predictions",
      description: "Receive accurate productivity scores and burnout risk assessments based on your unique patterns."
    },
    {
      number: "04",
      title: "Track Progress",
      description: "Monitor your trends over time and receive personalized recommendations for improvement."
    }
  ];

  const features = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: "Privacy First",
      description: "Your data is encrypted and never shared with third parties."
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: "Real-time Analysis",
      description: "Get instant predictions with our optimized ML pipeline."
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: "95% Accuracy",
      description: "Validated predictions based on extensive research data."
    }
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#0a0f1a] text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute top-20 right-1/4 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-blue-600/5 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-4xl mx-auto px-6 py-16 lg:py-24">
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              About AI Digital Twin
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
              An intelligent system that predicts productivity levels and burnout risk 
              using machine learning algorithms to help you work smarter, not harder.
            </p>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-4xl mx-auto px-6 pb-16">
        <div className="grid md:grid-cols-3 gap-5">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/50 hover:border-slate-700/50 transition-colors"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center text-cyan-400 mb-4">
                {feature.icon}
              </div>
              <h3 className="text-base font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="max-w-4xl mx-auto px-6 pb-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-white mb-3">How It Works</h2>
          <p className="text-slate-400">Simple steps to understand your productivity patterns</p>
        </div>

        <div className="space-y-4">
          {steps.map((step, index) => (
            <div
              key={index}
              className="flex gap-6 p-6 rounded-2xl bg-slate-900/30 border border-slate-800/50 hover:border-slate-700/50 transition-colors group"
            >
              <div className="flex-shrink-0">
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-600/10 text-cyan-400 font-bold text-lg border border-cyan-500/20 group-hover:border-cyan-500/40 transition-colors">
                  {step.number}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-6 pb-20">
        <div className="rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-900/50 border border-slate-800/50 p-8 md:p-12 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Ready to Get Started?</h2>
          <p className="text-slate-400 mb-8 max-w-lg mx-auto">
            Take the first step towards understanding your work patterns and preventing burnout.
          </p>
          <Link to="/predict">
            <button className="px-8 py-4 rounded-xl text-base font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 transition-all shadow-xl shadow-cyan-500/20 hover:shadow-cyan-500/30">
              Start Your First Prediction
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default About;
