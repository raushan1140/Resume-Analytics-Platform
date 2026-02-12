import { useState } from 'react'
import axios from 'axios'
import UploadResume from '../components/UploadResume'
import RoleSelector from '../components/RoleSelector'

const ROLE_DESCRIPTIONS = {
  'data_analyst': 'SQL, Excel, Analytics, BI tools',
  'bi_engineer': 'ETL, Data Pipeline, Cloud platforms',
  'data_scientist': 'ML, Python, Statistical Analysis, AI',
  'analytics_engineer': 'dbt, Data Warehousing, SQL, Modeling',
  'ml_engineer': 'Python, TensorFlow, Model Deployment, MLOps',
  'data_engineer': 'Spark, Hadoop, Cloud, Database Design',
  'database_admin': 'SQL Server, MySQL, PostgreSQL, Optimization',
  'business_analyst': 'Requirements, Process, SQL, Excel',
  'backend_developer': 'Node.js, Python, Java, APIs, Databases',
  'frontend_developer': 'React, Angular, Vue, JavaScript, CSS',
  'fullstack_developer': 'Full Stack, React, Node, Databases',
  'software_developer': 'Software Development, OOP, Design Patterns',
  'software_tester': 'QA, Testing, Automation, Bug Tracking',
  'devops_engineer': 'Docker, Kubernetes, CI/CD, AWS, Azure',
  'cloud_architect': 'Cloud Design, AWS, Azure, GCP, Security',
  'security_engineer': 'Security, Encryption, Penetration Testing'
}

export default function Home({ onAnalysisComplete }) {
  const [resumeId, setResumeId] = useState(null)
  const [selectedRole, setSelectedRole] = useState('data_analyst')
  const [selectedLevel, setSelectedLevel] = useState('fresher')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const handleUploadSuccess = (data) => {
    setResumeId(data.resume_id)
    setUploadedFile(data.filename)
  }

  const handleSearchAnalyze = async () => {
    const query = searchQuery.trim()
    if (!query) {
      alert('Please enter a job title to search')
      return
    }

    // Map search query to role ID
    const allRoles = Object.keys(ROLE_DESCRIPTIONS)
    const matchedRole = allRoles.find(role => 
      role.replace(/_/g, ' ').toLowerCase().includes(query.toLowerCase()) ||
      ROLE_DESCRIPTIONS[role].toLowerCase().includes(query.toLowerCase())
    )

    if (matchedRole) {
      setSelectedRole(matchedRole)
      alert(`Matched role: ${matchedRole.replace(/_/g, ' ').toUpperCase()}`)
    } else {
      alert('No matching role found. Please select from the dropdown.')
    }
  }

  const handleAnalyze = async () => {
    if (!resumeId) {
      alert('Please upload a resume first')
      return
    }

    setIsAnalyzing(true)
    try {
      const response = await axios.post('http://localhost:8001/analyze', {
        resume_id: resumeId,
        role: selectedRole,
        level: selectedLevel
      })

      onAnalysisComplete(response.data)
    } catch (error) {
      alert(`Error: ${error.response?.data?.detail || error.message}`)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Resume Analytics Platform</h2>
        <p className="text-gray-600 mb-8">
          Upload your resume and get instant analysis including skill matching, ATS compatibility, and role-based recommendations.
        </p>

        <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">🔍 Quick Search by Job Title</h3>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g., Backend, Data Scientist, QA, Frontend..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearchAnalyze()}
              className="flex-1 px-4 py-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:border-blue-600"
            />
            <button
              onClick={handleSearchAnalyze}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
            >
              Search
            </button>
          </div>
          <p className="text-xs text-gray-600 mt-2">💡 Tip: Type a job title keyword and we'll find the best match</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Step 1: Upload Resume</h3>
            <UploadResume onUploadSuccess={handleUploadSuccess} />
            {uploadedFile && (
              <p className="mt-2 text-green-600 font-semibold">✓ {uploadedFile}</p>
            )}
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Step 2: Select Role & Level</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Job Role:</label>
                <RoleSelector selectedRole={selectedRole} onRoleChange={setSelectedRole} />
                <p className="text-xs text-gray-600 mt-2">👉 {ROLE_DESCRIPTIONS[selectedRole]}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level:</label>
                <div className="space-y-2">
                  {[
                    { value: 'fresher', label: 'Fresher (0-2 years)' },
                    { value: 'intermediate', label: 'Intermediate (2-5 years)' },
                    { value: 'experienced', label: 'Experienced (5+ years)' }
                  ].map((level) => (
                    <div key={level.value} className={`p-3 border-2 rounded-lg cursor-pointer transition ${
                      selectedLevel === level.value
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-300 bg-white hover:border-indigo-400'
                    }`}>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="level"
                          value={level.value}
                          checked={selectedLevel === level.value}
                          onChange={(e) => setSelectedLevel(e.target.value)}
                          className="w-4 h-4 text-indigo-600"
                        />
                        <span className="ml-3 font-medium text-gray-900">{level.label}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <button
            onClick={handleAnalyze}
            disabled={!resumeId || isAnalyzing}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition"
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze Resume'}
          </button>
        </div>
      </div>
    </div>
  )
}
