import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import axios from 'axios'
import SkillBreakdown from './SkillBreakdown'

const getRoleDisplayName = (roleId) => {
  const roles = {
    'data_analyst': 'Data Analyst',
    'bi_engineer': 'BI Engineer',
    'data_scientist': 'Data Scientist',
    'analytics_engineer': 'Analytics Engineer',
    'ml_engineer': 'ML Engineer',
    'data_engineer': 'Data Engineer',
    'database_admin': 'Database Admin',
    'business_analyst': 'Business Analyst'
  }
  return roles[roleId] || roleId
}

const getLevelDisplayName = (level) => {
  const levels = {
    'fresher': 'Fresher (0-2 years)',
    'intermediate': 'Intermediate (2-5 years)',
    'experienced': 'Experienced (5+ years)'
  }
  return levels[level] || level
}

export default function AnalyticsResults({ data }) {
  const scoreData = [
    { name: 'Overall', value: data.overall_score },
    { name: 'Skill Match', value: data.skill_match_score },
    { name: 'ATS', value: data.ats_score }
  ]

  const skillsData = [
    { name: 'Required Found', value: data.found_required_skills?.length || 0 },
    { name: 'Preferred Found', value: data.found_preferred_skills?.length || 0 },
    { name: 'Missing', value: data.missing_skills?.length || 0 }
  ]

  const COLORS = ['#4F46E5', '#7C3AED', '#EC4899']

  const scoreDetails = [
    { label: 'Overall Score', value: data.overall_score, color: 'bg-blue-500' },
    { label: 'Skill Match', value: data.skill_match_score, color: 'bg-green-500' },
    { label: 'ATS Score', value: data.ats_score, color: 'bg-purple-500' }
  ]

  const handleDownloadPDF = async () => {
    try {
      const response = await axios.get(`http://localhost:8001/report/${data.analysis_id}`, {
        responseType: 'blob'
      })
      
      // Create blob and download
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `Resume_Analysis_${data.analysis_id}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(link.href)
    } catch (error) {
      const errorMsg = error.response?.data?.detail || error.message || 'Unknown error'
      alert(`Error downloading report: ${errorMsg}`)
    }
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Analysis Results</h2>
            <div>
              <p className="text-gray-600">Job Role: <span className="font-semibold text-indigo-600">{getRoleDisplayName(data.role)}</span></p>
              <p className="text-gray-600">Experience Level: <span className="font-semibold text-indigo-600">{getLevelDisplayName(data.level)}</span></p>
            </div>
          </div>
          <button
            onClick={handleDownloadPDF}
            className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition"
          >
            📥 Download PDF Report
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {scoreDetails.map((score) => (
            <div key={score.label} className="bg-gray-50 rounded-lg p-6 text-center">
              <div className="relative w-32 h-32 mx-auto mb-4">
                <svg className="transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#E5E7EB" strokeWidth="8" />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeDasharray={`${(score.value / 100) * 282.6} 282.6`}
                    className={score.color}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-gray-800">{Math.round(score.value)}</span>
                </div>
              </div>
              <p className="font-semibold text-gray-800">{score.label}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Score Breakdown</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={scoreData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="value" fill="#4F46E5" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Skills Overview</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={skillsData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {skillsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <SkillBreakdown
        foundRequired={data.found_required_skills}
        foundPreferred={data.found_preferred_skills}
        missing={data.missing_skills}
      />
    </div>
  )
}
