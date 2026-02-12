import React, { useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';

const API_URL = API_BASE_URL;

export default function JobDescriptionMatcher() {
  const [resumeId, setResumeId] = useState(null);
  const [resumeName, setResumeName] = useState(null);
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isMatching, setIsMatching] = useState(false);
  const [matchResult, setMatchResult] = useState(null);
  const [error, setError] = useState(null);

  const handleResumeUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API_URL}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResumeName(file.name);
      setResumeId(response.data.resume_id);
      setError(null);
    } catch (err) {
      setError('Failed to upload resume');
    }
  };

  const handleMatch = async () => {
    if (!resumeId) {
      setError('Please upload a resume');
      return;
    }

    if (!jobDescription.trim()) {
      setError('Please enter a job description');
      return;
    }

    setIsMatching(true);
    try {
      const response = await axios.post(`${API_URL}/match-job-description`, {
        resume_id: resumeId,
        job_description: jobDescription,
        job_title: jobTitle || 'Not specified',
      });
      setMatchResult(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to match job description');
    } finally {
      setIsMatching(false);
    }
  };

  const getMatchColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-blue-600';
    if (percentage >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMatchBg = (percentage) => {
    if (percentage >= 80) return 'bg-green-100 border-green-300';
    if (percentage >= 60) return 'bg-blue-100 border-blue-300';
    if (percentage >= 40) return 'bg-yellow-100 border-yellow-300';
    return 'bg-red-100 border-red-300';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2 text-gray-800">Job Description Matcher</h1>
        <p className="text-center text-gray-600 mb-8">Match your resume against a job description</p>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Resume Upload */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-700">Your Resume</h2>
            <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center">
              <input
                type="file"
                accept=".pdf,.docx"
                onChange={handleResumeUpload}
                className="hidden"
                id="resume-file"
              />
              <label htmlFor="resume-file" className="cursor-pointer">
                <p className="text-gray-600 mb-2">Drag or click to upload</p>
                <p className="text-sm text-gray-500">{resumeName || 'PDF or DOCX'}</p>
              </label>
            </div>
          </div>

          {/* Job Title */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-700">Job Information</h2>
            <input
              type="text"
              placeholder="Job Title (optional)"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Job Description Input */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-700">Job Description</h2>
          <textarea
            placeholder="Paste the job description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows="8"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-8">
            {error}
          </div>
        )}

        {/* Match Button */}
        <div className="text-center mb-8">
          <button
            onClick={handleMatch}
            disabled={!resumeId || !jobDescription.trim() || isMatching}
            className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
          >
            {isMatching ? 'Matching...' : 'Analyze Match'}
          </button>
        </div>

        {/* Match Results */}
        {matchResult && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Match Results</h2>

            {/* Overall Match Score */}
            <div className={`border-2 rounded-lg p-6 mb-8 ${getMatchBg(matchResult.match_percentage)}`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Overall Match</h3>
                  <p className="text-gray-600">{matchResult.job_title || 'Job Position'}</p>
                </div>
                <div className="text-right">
                  <p className={`text-4xl font-bold ${getMatchColor(matchResult.match_percentage)}`}>
                    {matchResult.match_percentage.toFixed(0)}%
                  </p>
                  <p className={`font-bold ${getMatchColor(matchResult.match_percentage)}`}>
                    {matchResult.fit_level}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-300 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-300 ${
                    matchResult.match_percentage >= 80
                      ? 'bg-green-600'
                      : matchResult.match_percentage >= 60
                      ? 'bg-blue-600'
                      : matchResult.match_percentage >= 40
                      ? 'bg-yellow-600'
                      : 'bg-red-600'
                  }`}
                  style={{ width: `${matchResult.match_percentage}%` }}
                />
              </div>
            </div>

            {/* Technical Skills */}
            <div className="mb-8">
              <h3 className="text-lg font-bold mb-4 text-gray-800">Technical Skills</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-green-50 border border-green-300 p-4 rounded-lg">
                  <h4 className="font-bold text-green-700 mb-2">
                    Matched ({matchResult.technical_skills.match_count}/{matchResult.technical_skills.required_count})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {matchResult.technical_skills.matched.slice(0, 10).map((skill) => (
                      <span key={skill} className="bg-green-200 text-green-800 px-2 py-1 rounded text-sm">
                        ✓ {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-red-50 border border-red-300 p-4 rounded-lg">
                  <h4 className="font-bold text-red-700 mb-2">
                    Missing ({matchResult.technical_skills.missing.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {matchResult.technical_skills.missing.slice(0, 10).map((skill) => (
                      <span key={skill} className="bg-red-200 text-red-800 px-2 py-1 rounded text-sm">
                        ✗ {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Business Skills */}
            {matchResult.business_skills.required_count > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-bold mb-4 text-gray-800">Business Skills</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-green-50 border border-green-300 p-4 rounded-lg">
                    <h4 className="font-bold text-green-700 mb-2">
                      Matched ({matchResult.business_skills.match_count}/{matchResult.business_skills.required_count})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {matchResult.business_skills.matched.slice(0, 8).map((skill) => (
                        <span key={skill} className="bg-green-200 text-green-800 px-2 py-1 rounded text-sm">
                          ✓ {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-red-50 border border-red-300 p-4 rounded-lg">
                    <h4 className="font-bold text-red-700 mb-2">
                      Missing ({matchResult.business_skills.missing.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {matchResult.business_skills.missing.slice(0, 8).map((skill) => (
                        <span key={skill} className="bg-red-200 text-red-800 px-2 py-1 rounded text-sm">
                          ✗ {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Recommendation */}
            <div className="bg-blue-50 border border-blue-300 p-6 rounded-lg">
              <h3 className="text-lg font-bold mb-2 text-blue-800">Recommendation</h3>
              <p className="text-gray-700">{matchResult.recommendation}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
