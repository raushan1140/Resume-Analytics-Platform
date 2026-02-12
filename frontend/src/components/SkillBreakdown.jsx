export default function SkillBreakdown({ foundRequired, foundPreferred, missing }) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Skill Breakdown</h2>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-green-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-800 mb-4">Required Skills Found</h3>
          <div className="space-y-2">
            {foundRequired && foundRequired.length > 0 ? (
              foundRequired.map((skill, idx) => (
                <div key={idx} className="bg-white rounded px-3 py-2 text-sm font-medium text-green-700 border border-green-200">
                  ✓ {skill}
                </div>
              ))
            ) : (
              <p className="text-gray-600">No required skills found</p>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-green-200">
            <p className="text-2xl font-bold text-green-600">{foundRequired?.length || 0}</p>
            <p className="text-xs text-gray-600">skills matched</p>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">Preferred Skills Found</h3>
          <div className="space-y-2">
            {foundPreferred && foundPreferred.length > 0 ? (
              foundPreferred.map((skill, idx) => (
                <div key={idx} className="bg-white rounded px-3 py-2 text-sm font-medium text-blue-700 border border-blue-200">
                  ⭐ {skill}
                </div>
              ))
            ) : (
              <p className="text-gray-600">No preferred skills found</p>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-blue-200">
            <p className="text-2xl font-bold text-blue-600">{foundPreferred?.length || 0}</p>
            <p className="text-xs text-gray-600">bonus skills</p>
          </div>
        </div>

        <div className="bg-red-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-4">Skills to Develop</h3>
          <div className="space-y-2">
            {missing && missing.length > 0 ? (
              missing.slice(0, 5).map((skill, idx) => (
                <div key={idx} className="bg-white rounded px-3 py-2 text-sm font-medium text-red-700 border border-red-200">
                  ✗ {skill}
                </div>
              ))
            ) : (
              <p className="text-gray-600">All skills covered!</p>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-red-200">
            <p className="text-2xl font-bold text-red-600">{missing?.length || 0}</p>
            <p className="text-xs text-gray-600">gaps identified</p>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
        <p className="text-sm text-blue-900">
          <strong>Recommendation:</strong> Focus on developing the missing skills to improve your match score. Consider online courses and practical projects.
        </p>
      </div>
    </div>
  )
}
