import { useState, useEffect } from 'react'
import axios from 'axios'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import API_BASE_URL from '../config/api'

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
    'fresher': 'Fresher (0-2y)',
    'intermediate': 'Intermediate (2-5y)',
    'experienced': 'Experienced (5+y)'
  }
  return levels[level] || level
}

export default function HistoryView() {
  const [history, setHistory] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedAnalysis, setSelectedAnalysis] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [sortBy, setSortBy] = useState('date')

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true)
        const response = await axios.get(`${API_BASE_URL}/history`)
        setHistory(response.data.analyses || [])
      } catch (err) {
        setError(err.response?.data?.detail || err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchHistory()
  }, [])

  const fetchAnalysisDetail = async (analysisId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/analysis/${analysisId}`)
      setSelectedAnalysis(response.data)
    } catch (err) {
      alert(`Error: ${err.response?.data?.detail || err.message}`)
    }
  }

  const downloadPDF = async (analysisId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/report/${analysisId}`, {
        responseType: 'blob'
      })

      // Create blob and download
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `Resume_Analysis_${analysisId}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(link.href)
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Unknown error'
      alert(`Error downloading report: ${errorMsg}`)
    }
  }

  // Filter and search logic
  let filteredHistory = history.filter((analysis) => {
    const matchesSearch = 
      analysis.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getRoleDisplayName(analysis.role).toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = filterRole === 'all' || analysis.role === filterRole
    return matchesSearch && matchesRole
  })

  // Sort logic
  if (sortBy === 'score-high') {
    filteredHistory = [...filteredHistory].sort((a, b) => b.overall_score - a.overall_score)
  } else if (sortBy === 'score-low') {
    filteredHistory = [...filteredHistory].sort((a, b) => a.overall_score - b.overall_score)
  } 

  const uniqueRoles = ['all', ...new Set(history.map(h => h.role))]

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="loading"></div>
        <p className="mt-4">Loading history...</p>
      </div>
    )
  }

  if (selectedAnalysis) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedAnalysis(null)}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          ← Back to History
        </button>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedAnalysis.filename}</h2>
              <div>
                <p className="text-gray-600">Role: <span className="font-semibold text-indigo-600">{getRoleDisplayName(selectedAnalysis.role)}</span></p>
                <p className="text-gray-600">Level: <span className="font-semibold text-indigo-600">{getLevelDisplayName(selectedAnalysis.level)}</span></p>
              </div>
            </div>
            <button
              onClick={() => downloadPDF(selectedAnalysis.analysis_id)}
              className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition"
            >
              📥 Download PDF
            </button>
            <div className="bg-purple-50 rounded-lg p-6 text-center">
              <p className="text-3xl font-bold text-purple-600">{selectedAnalysis.ats_score}</p>
              <p className="text-gray-700">ATS Score</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Found Skills</h3>
              <div className="space-y-2">
                {selectedAnalysis.found_skills?.length > 0 ? (
                  selectedAnalysis.found_skills.map((skill, idx) => (
                    <div
                      key={idx}
                      className={`px-3 py-2 rounded text-sm font-medium ${
                        skill.category === 'required'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {skill.name} ({skill.category})
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600">No skills found</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Missing Skills</h3>
              <div className="space-y-2">
                {selectedAnalysis.missing_skills?.length > 0 ? (
                  selectedAnalysis.missing_skills.slice(0, 10).map((skill, idx) => (
                    <div key={idx} className="px-3 py-2 rounded text-sm font-medium bg-red-100 text-red-800">
                      {skill}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600">No gaps identified</p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 text-sm text-gray-600">
            <p>Analyzed: {new Date(selectedAnalysis.timestamp).toLocaleString()}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Analysis History</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-800">
            <p>Error: {error}</p>
          </div>
        )}

        {history.length === 0 ? (
          <p className="text-gray-600">No analyses yet. Upload a resume to get started!</p>
        ) : (
          <>
            {/* Search and Filter Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg mb-8 border border-blue-200">
              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                  <input
                    type="text"
                    placeholder="Search by file name or role..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Role</label>
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {uniqueRoles.map((role) => (
                      <option key={role} value={role}>
                        {role === 'all' ? 'All Roles' : getRoleDisplayName(role)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="date">Recent First</option>
                    <option value="score-high">Highest Score</option>
                    <option value="score-low">Lowest Score</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Results</label>
                  <div className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg font-semibold text-center">
                    {filteredHistory.length} found
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={filteredHistory.slice(-10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="filename" angle={-45} textAnchor="end" height={80} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="overall_score" fill="#3b82f6" name="Overall Score" />
                  <Bar dataKey="skill_match_score" fill="#10b981" name="Skill Match" />
                  <Bar dataKey="ats_score" fill="#8b5cf6" name="ATS Score" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">File</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Role</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Level</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Overall</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Skills</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">ATS</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map((analysis) => (
                    <tr key={analysis.analysis_id} className="border-t border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-800">{analysis.filename}</td>
                      <td className="px-6 py-4 text-sm font-medium text-indigo-600">{getRoleDisplayName(analysis.role)}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-600">{getLevelDisplayName(analysis.level)}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-blue-600">{analysis.overall_score.toFixed(1)}</td>
                      <td className="px-6 py-4 text-sm text-green-600">{analysis.skill_match_score.toFixed(1)}</td>
                      <td className="px-6 py-4 text-sm text-purple-600">{analysis.ats_score.toFixed(1)}</td>
                      <td className="px-6 py-4 text-sm space-x-2">
                        <button
                          onClick={() => fetchAnalysisDetail(analysis.analysis_id)}
                          className="text-indigo-600 hover:underline font-medium"
                        >
                          View
                        </button>
                        <button
                          onClick={() => downloadPDF(analysis.analysis_id)}
                          className="text-green-600 hover:underline font-medium"
                        >
                          PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
