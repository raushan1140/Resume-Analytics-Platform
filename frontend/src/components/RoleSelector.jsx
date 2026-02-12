export default function RoleSelector({ selectedRole, onRoleChange }) {
  const roles = [
    { id: 'data_analyst', name: 'Data Analyst', category: 'Data' },
    { id: 'bi_engineer', name: 'BI Engineer', category: 'Data' },
    { id: 'data_scientist', name: 'Data Scientist', category: 'Data' },
    { id: 'analytics_engineer', name: 'Analytics Engineer', category: 'Data' },
    { id: 'ml_engineer', name: 'ML Engineer', category: 'Data' },
    { id: 'data_engineer', name: 'Data Engineer', category: 'Data' },
    { id: 'database_admin', name: 'Database Admin', category: 'Data' },
    { id: 'business_analyst', name: 'Business Analyst', category: 'Business' },
    { id: 'backend_developer', name: 'Backend Developer', category: 'Software' },
    { id: 'frontend_developer', name: 'Frontend Developer', category: 'Software' },
    { id: 'fullstack_developer', name: 'Full Stack Developer', category: 'Software' },
    { id: 'software_developer', name: 'Software Developer', category: 'Software' },
    { id: 'software_tester', name: 'QA/Software Tester', category: 'Software' },
    { id: 'devops_engineer', name: 'DevOps Engineer', category: 'Software' },
    { id: 'cloud_architect', name: 'Cloud Architect', category: 'Software' },
    { id: 'security_engineer', name: 'Security Engineer', category: 'Software' }
  ]

  const getRoleLabel = () => {
    const role = roles.find(r => r.id === selectedRole)
    return role ? role.name : 'Select a role...'
  }

  const dataRoles = roles.filter(r => r.category === 'Data')
  const softwareRoles = roles.filter(r => r.category === 'Software')
  const businessRoles = roles.filter(r => r.category === 'Business')

  return (
    <select
      value={selectedRole}
      onChange={(e) => onRoleChange(e.target.value)}
      className="w-full px-4 py-3 border-2 border-indigo-300 rounded-lg focus:outline-none focus:border-indigo-600 bg-white font-medium text-gray-800"
    >
      <option value="" disabled>Select a job role...</option>
      
      {dataRoles.length > 0 && (
        <optgroup label="📊 Data & Analytics">
          {dataRoles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </optgroup>
      )}
      
      {businessRoles.length > 0 && (
        <optgroup label="💼 Business">
          {businessRoles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </optgroup>
      )}
      
      {softwareRoles.length > 0 && (
        <optgroup label="💻 Software Development">
          {softwareRoles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </optgroup>
      )}
    </select>
  )
}
