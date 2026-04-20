import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-slate-700/50 px-8 py-5 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-white font-semibold text-lg">Resume Analytics</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/login')}
              className="px-5 py-2 border border-slate-500 text-slate-300 hover:bg-slate-800 rounded-lg transition duration-200"
            >
              Sign in
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition duration-200"
            >
              Get started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-8 py-20 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-full px-4 py-2 mb-8">
          <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
          <span className="text-blue-300 text-sm">NLP-powered resume evaluation</span>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
          Know exactly how strong your <span className="text-blue-400">resume</span> really is
        </h1>

        <p className="text-xl text-slate-300 mb-10 leading-relaxed">
          ATS scoring, skill extraction, role-fit analysis, and job description matching — all in one platform.
        </p>

        <div className="flex gap-4 justify-center flex-wrap">
          <button
            onClick={() => navigate('/register')}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition duration-200 shadow-lg hover:shadow-xl hover:scale-105 transform"
          >
            Analyze my resume ↗
          </button>
          <button
            className="px-8 py-3 border border-slate-500 text-slate-300 hover:bg-slate-800 rounded-lg font-semibold transition duration-200"
          >
            See how it works
          </button>
        </div>
      </section>

      {/* Stats */}
      <section className="px-8 py-12 border-y border-slate-700/50">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="hover:scale-105 transition duration-300">
            <p className="text-3xl font-bold text-white mb-2">94%</p>
            <p className="text-slate-400 text-sm">ATS accuracy</p>
          </div>
          <div className="hover:scale-105 transition duration-300">
            <p className="text-3xl font-bold text-white mb-2">50+</p>
            <p className="text-slate-400 text-sm">Skills detected</p>
          </div>
          <div className="hover:scale-105 transition duration-300">
            <p className="text-3xl font-bold text-white mb-2">12</p>
            <p className="text-slate-400 text-sm">Job roles</p>
          </div>
          <div className="hover:scale-105 transition duration-300">
            <p className="text-3xl font-bold text-white mb-2">100%</p>
            <p className="text-slate-400 text-sm">Secure (JWT)</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-8 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-blue-400 text-sm font-semibold mb-3 uppercase tracking-wide">What you get</p>
          <h2 className="text-4xl font-bold text-white">Everything to level up your resume</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: '📊', title: 'ATS score', desc: 'Get a real-world applicant tracking score before you submit.' },
            { icon: '✓', title: 'Skill extraction', desc: 'NLP detects and categorizes your technical and soft skills.' },
            { icon: '⭐', title: 'Role-fit analysis', desc: 'Evaluate how well your resume matches a specific job role.' },
            { icon: '🔄', title: 'Resume comparison', desc: 'Compare two resumes side-by-side to find the stronger one.' },
            { icon: '📄', title: 'JD matching', desc: 'Paste a job description and instantly see your alignment score.' },
            { icon: '🎯', title: 'Recommendations', desc: 'Get actionable insights to improve your resume.' },
          ].map((feature, i) => (
            <div 
              key={i} 
              className="p-6 bg-slate-800/40 border border-slate-700/50 rounded-lg hover:border-blue-500/50 hover:bg-slate-800/70 transition duration-300 hover:shadow-lg hover:shadow-blue-500/10 cursor-default"
            >
              <p className="text-3xl mb-3">{feature.icon}</p>
              <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
              <p className="text-slate-400 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sample Score */}
      <section className="px-8 py-16 max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl p-8 hover:border-blue-500/30 transition duration-300">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-white font-semibold">Sample resume score — Software Engineer</h3>
            <span className="px-3 py-1 bg-green-500/20 text-green-300 text-sm rounded-full border border-green-500/30">78 / 100</span>
          </div>

          <div className="space-y-4">
            {[
              { label: 'Keyword match', value: 84, color: 'from-blue-500 to-blue-400' },
              { label: 'Skills coverage', value: 72, color: 'from-purple-500 to-purple-400' },
              { label: 'ATS readability', value: 91, color: 'from-green-500 to-green-400' },
              { label: 'Role alignment', value: 65, color: 'from-amber-500 to-amber-400' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="text-slate-400 text-sm w-32">{item.label}</span>
                <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${item.color} transition-all duration-500`}
                    style={{ width: `${item.value}%` }}
                  ></div>
                </div>
                <span className="text-white font-medium w-12 text-right">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-8 py-20 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Ready to evaluate your resume?
        </h2>
        <p className="text-slate-300 mb-8 text-lg">Create a free account and get your full analysis in seconds.</p>
        <button
          onClick={() => navigate('/register')}
          className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition duration-200 shadow-lg hover:shadow-xl hover:scale-105 transform text-lg"
        >
          Start for free ↗
        </button>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 px-8 py-8 text-center text-slate-400 text-sm">
        <p>© 2026 Resume Analytics. Built with React, FastAPI & Supabase.</p>
      </footer>
    </div>
  );
}
