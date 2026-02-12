import React, { useState, useRef } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';

const API_URL = API_BASE_URL;

export default function CompareResumes() {
  const [resume1, setResume1] = useState(null);
  const [resume2, setResume2] = useState(null);
  const [resume1Id, setResume1Id] = useState(null);
  const [resume2Id, setResume2Id] = useState(null);
  const [selectedRole, setSelectedRole] = useState('data_analyst');
  const [selectedLevel, setSelectedLevel] = useState('intermediate');
  const [isComparing, setIsComparing] = useState(false);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [error, setError] = useState(null);

  const roles = [
    { id: 'data_analyst', name: 'Data Analyst' },
    { id: 'bi_engineer', name: 'BI Engineer' },
    { id: 'data_scientist', name: 'Data Scientist' },
    { id: 'backend_developer', name: 'Backend Developer' },
    { id: 'frontend_developer', name: 'Frontend Developer' },
    { id: 'fullstack_developer', name: 'Full Stack Developer' },
  ];

  const uploadResume = async (file, setResumeName, setResumeId) => {
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

  const handleFileSelect1 = async (event) => {
    const file = event.target.files[0];
    await uploadResume(file, setResume1, setResume1Id);
  };

  const handleFileSelect2 = async (event) => {
    const file = event.target.files[0];
    await uploadResume(file, setResume2, setResume2Id);
  };

  const handleCompare = async () => {
    if (!resume1Id || !resume2Id) {
      setError('Please upload both resumes');
      return;
    }

    setIsComparing(true);
    try {
      const response = await axios.post(`${API_URL}/compare`, {
        resume_id_1: resume1Id,
        resume_id_2: resume2Id,
        role: selectedRole,
        level: selectedLevel,
      });
      setComparisonResult(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to compare resumes');
    } finally {
      setIsComparing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">Compare Resumes</h1>

        {/* Upload Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Resume 1 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-700">Resume 1</h2>
            <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center">
              <input
                type="file"
                accept=".pdf,.docx"
                onChange={handleFileSelect1}
                className="hidden"
                id="file1"
              />
              <label htmlFor="file1" className="cursor-pointer">
                <p className="text-gray-600 mb-2">Drag or click to upload</p>
                <p className="text-sm text-gray-500">{resume1 || 'PDF or DOCX'}</p>
              </label>
            </div>
          </div>

          {/* Resume 2 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-700">Resume 2</h2>
            <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center">
              <input
                type="file"
                accept=".pdf,.docx"
                onChange={handleFileSelect2}
                className="hidden"
                id="file2"
              />
              <label htmlFor="file2" className="cursor-pointer">
                <p className="text-gray-600 mb-2">Drag or click to upload</p>
                <p className="text-sm text-gray-500">{resume2 || 'PDF or DOCX'}</p>
              </label>
            </div>
          </div>
        </div>

        {/* Role and Level Selection */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-700">Comparison Criteria</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Job Role</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level</label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="fresher">Fresher (0-2 years)</option>
                <option value="intermediate">Intermediate (2-5 years)</option>
                <option value="experienced">Experienced (5+ years)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-8">
            {error}
          </div>
        )}

        {/* Compare Button */}
        <div className="text-center mb-8">
          <button
            onClick={handleCompare}
            disabled={!resume1Id || !resume2Id || isComparing}
            className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
          >
            {isComparing ? 'Comparing...' : 'Compare Resumes'}
          </button>
        </div>

        {/* Comparison Results */}
        {comparisonResult && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Comparison Results</h2>

            {/* Scores Comparison */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
                <h3 className="font-bold text-gray-700 mb-4">Overall Score</h3>
                <div className="flex justify-between items-center">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Resume 1</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {comparisonResult.resume1.overall_score.toFixed(1)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Resume 2</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {comparisonResult.resume2.overall_score.toFixed(1)}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-green-600 font-bold mt-4 text-center">
                  Winner: {comparisonResult.comparison.better_overall_score === 'resume1' ? 'Resume 1' : 'Resume 2'}
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
                <h3 className="font-bold text-gray-700 mb-4">Skill Match</h3>
                <div className="flex justify-between items-center">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Resume 1</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {comparisonResult.resume1.skill_match_score.toFixed(1)}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Resume 2</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {comparisonResult.resume2.skill_match_score.toFixed(1)}%
                    </p>
                  </div>
                </div>
                <p className="text-sm text-green-600 font-bold mt-4 text-center">
                  Winner: {comparisonResult.comparison.better_skill_match === 'resume1' ? 'Resume 1' : 'Resume 2'}
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
                <h3 className="font-bold text-gray-700 mb-4">ATS Score</h3>
                <div className="flex justify-between items-center">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Resume 1</p>
                    <p className="text-2xl font-bold text-green-600">
                      {comparisonResult.resume1.ats_score.toFixed(1)}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Resume 2</p>
                    <p className="text-2xl font-bold text-green-600">
                      {comparisonResult.resume2.ats_score.toFixed(1)}%
                    </p>
                  </div>
                </div>
                <p className="text-sm text-green-600 font-bold mt-4 text-center">
                  Winner: {comparisonResult.comparison.better_ats_score === 'resume1' ? 'Resume 1' : 'Resume 2'}
                </p>
              </div>
            </div>

            {/* Skill Comparison */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-bold mb-4 text-gray-800">Skill Analysis</h3>
              
              {comparisonResult.comparison.shared_technical_skills.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-bold text-green-600 mb-2">
                    Shared Skills ({comparisonResult.comparison.shared_skill_count})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {comparisonResult.comparison.shared_technical_skills.slice(0, 15).map((skill) => (
                      <span key={skill} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {comparisonResult.comparison.unique_to_resume1.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-bold text-blue-600 mb-2">
                    Unique to Resume 1 ({comparisonResult.comparison.unique_to_resume1.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {comparisonResult.comparison.unique_to_resume1.slice(0, 10).map((skill) => (
                      <span key={skill} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {comparisonResult.comparison.unique_to_resume2.length > 0 && (
                <div>
                  <h4 className="font-bold text-purple-600 mb-2">
                    Unique to Resume 2 ({comparisonResult.comparison.unique_to_resume2.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {comparisonResult.comparison.unique_to_resume2.slice(0, 10).map((skill) => (
                      <span key={skill} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
