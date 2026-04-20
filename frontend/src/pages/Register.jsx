import React, { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { register, error, setError } = useAuth();

  // Password strength validation
  const validatePasswordStrength = useCallback((pwd) => {
    const checks = {
      hasMinLength: pwd.length >= 8,
      hasUppercase: /[A-Z]/.test(pwd),
      hasLowercase: /[a-z]/.test(pwd),
      hasDigit: /\d/.test(pwd),
    };
    return checks;
  }, []);

  const passwordChecks = validatePasswordStrength(password);
  const isPasswordStrong =
    passwordChecks.hasMinLength &&
    passwordChecks.hasUppercase &&
    passwordChecks.hasLowercase &&
    passwordChecks.hasDigit;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Client-side validation
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!isPasswordStrong) {
      setError('Password does not meet strength requirements');
      return;
    }

    setSubmitting(true);

    try {
      await register(email, password);
      // Redirect to login after successful registration
      navigate('/login', {
        state: { message: 'Registration successful! Please log in.' },
      });
    } catch (err) {
      // Error is already set by register function
    } finally {
      setSubmitting(false);
    }
  };

  const getStrengthColor = () => {
    const strength = Object.values(passwordChecks).filter(Boolean).length;
    if (strength <= 2) return 'from-red-500 to-red-600';
    if (strength === 3) return 'from-amber-500 to-amber-600';
    return 'from-green-500 to-green-600';
  };

  const getStrengthLabel = () => {
    const strength = Object.values(passwordChecks).filter(Boolean).length;
    if (strength <= 2) return 'Weak';
    if (strength === 3) return 'Good';
    return 'Strong';
  };

  const strengthValue = Object.values(passwordChecks).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 py-8">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo/Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
            <span className="text-white font-semibold text-xl">Resume Analytics</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-2xl p-10 hover:border-blue-500/30 transition duration-300">
          <h2 className="text-2xl font-bold text-white mb-2">Create your account</h2>
          <p className="text-slate-400 mb-8">Get started with Resume Analytics today.</p>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg animate-shake">
              <p className="text-red-300 text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white placeholder-slate-500 rounded-lg focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition duration-200"
                placeholder="your.email@example.com"
                disabled={submitting}
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white placeholder-slate-500 rounded-lg focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition duration-200"
                placeholder="••••••••"
                disabled={submitting}
              />

              {password && (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Password strength:</span>
                    <span className={`text-xs font-semibold ${
                      strengthValue <= 2 ? 'text-red-400' : 
                      strengthValue === 3 ? 'text-amber-400' : 
                      'text-green-400'
                    }`}>
                      {getStrengthLabel()}
                    </span>
                  </div>

                  <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${getStrengthColor()} transition-all duration-300`}
                      style={{ width: `${(strengthValue / 4) * 100}%` }}
                    ></div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className={`flex items-center gap-2 ${passwordChecks.hasMinLength ? 'text-green-400' : 'text-slate-500'}`}>
                      <span>{passwordChecks.hasMinLength ? '✓' : '○'}</span>
                      <span>8+ characters</span>
                    </div>
                    <div className={`flex items-center gap-2 ${passwordChecks.hasUppercase ? 'text-green-400' : 'text-slate-500'}`}>
                      <span>{passwordChecks.hasUppercase ? '✓' : '○'}</span>
                      <span>Uppercase</span>
                    </div>
                    <div className={`flex items-center gap-2 ${passwordChecks.hasLowercase ? 'text-green-400' : 'text-slate-500'}`}>
                      <span>{passwordChecks.hasLowercase ? '✓' : '○'}</span>
                      <span>Lowercase</span>
                    </div>
                    <div className={`flex items-center gap-2 ${passwordChecks.hasDigit ? 'text-green-400' : 'text-slate-500'}`}>
                      <span>{passwordChecks.hasDigit ? '✓' : '○'}</span>
                      <span>Number</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white placeholder-slate-500 rounded-lg focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition duration-200"
                placeholder="••••••••"
                disabled={submitting}
              />
              {confirmPassword && password && password !== confirmPassword && (
                <p className="mt-2 text-xs text-red-400 flex items-center gap-1">
                  <span>●</span> Passwords do not match
                </p>
              )}
              {confirmPassword && password && password === confirmPassword && (
                <p className="mt-2 text-xs text-green-400 flex items-center gap-1">
                  <span>✓</span> Passwords match
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || !isPasswordStrong || password !== confirmPassword}
              className="w-full mt-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-600 disabled:to-slate-700 text-white font-semibold py-3 rounded-lg transition duration-200 shadow-lg hover:shadow-xl hover:shadow-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-700/50"></div>
            <span className="text-slate-500 text-xs uppercase">or</span>
            <div className="flex-1 h-px bg-slate-700/50"></div>
          </div>

          {/* Sign in link */}
          <p className="text-center text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition duration-200">
              Sign in here
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-xs mt-8">
          🔒 Secure registration with password strength validation
        </p>
      </div>
    </div>
  );
}
