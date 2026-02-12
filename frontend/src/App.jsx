import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import AnalyticsResults from './components/AnalyticsResults'
import HistoryView from './components/HistoryView'
import CompareResumes from './pages/CompareResumes'
import JobDescriptionMatcher from './pages/JobDescriptionMatcher'

function MainLayout() {
  const [currentPage, setCurrentPage] = useState('home')
  const [analysisData, setAnalysisData] = useState(null)
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleAnalysisComplete = (data) => {
    setAnalysisData(data)
    setCurrentPage('results')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-indigo-600">Resume Analytics</h1>
            <div className="flex flex-wrap gap-2 items-center">
              {isAuthenticated && (
                <>
                  <button
                    onClick={() => setCurrentPage('home')}
                    className={`px-4 py-2 rounded font-semibold transition ${currentPage === 'home' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                  >
                    📄 Analyze
                  </button>
                  <button
                    onClick={() => setCurrentPage('compare')}
                    className={`px-4 py-2 rounded font-semibold transition ${currentPage === 'compare' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                  >
                    🔄 Compare
                  </button>
                  <button
                    onClick={() => setCurrentPage('matcher')}
                    className={`px-4 py-2 rounded font-semibold transition ${currentPage === 'matcher' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                  >
                    🎯 Job Match
                  </button>
                  <button
                    onClick={() => setCurrentPage('history')}
                    className={`px-4 py-2 rounded font-semibold transition ${currentPage === 'history' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                  >
                    📊 History
                  </button>
                  <div className="border-l border-gray-300 pl-4 ml-4">
                    <span className="text-sm text-gray-600 mr-3">{user?.email}</span>
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 font-semibold transition"
                    >
                      🚪 Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {currentPage === 'home' && (
          <Home onAnalysisComplete={handleAnalysisComplete} />
        )}
        {currentPage === 'results' && analysisData && (
          <AnalyticsResults data={analysisData} />
        )}
        {currentPage === 'compare' && (
          <CompareResumes />
        )}
        {currentPage === 'matcher' && (
          <JobDescriptionMatcher />
        )}
        {currentPage === 'history' && (
          <HistoryView />
        )}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="*"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  )
}
