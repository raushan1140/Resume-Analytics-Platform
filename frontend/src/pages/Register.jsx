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
    if (strength <= 2) return 'bg-red-500';
    if (strength === 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthLabel = () => {
    const strength = Object.values(passwordChecks).filter(Boolean).length;
    if (strength <= 2) return 'Weak';
    if (strength === 3) return 'Good';
    return 'Strong';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Resume Analytics</h1>
          <p className="text-slate-600 mb-8">Create your account</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="your.email@example.com"
                disabled={submitting}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
                disabled={submitting}
              />

              {password && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">Password Strength:</span>
                    <span className={`font-medium ${getStrengthColor() === 'bg-red-500' ? 'text-red-600' : getStrengthColor() === 'bg-yellow-500' ? 'text-yellow-600' : 'text-green-600'}`}>
                      {getStrengthLabel()}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getStrengthColor()} transition-all duration-300`}
                      style={{
                        width: `${(Object.values(passwordChecks).filter(Boolean).length / 4) * 100}%`,
                      }}
                    ></div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className={passwordChecks.hasMinLength ? 'text-green-600' : 'text-slate-500'}>
                      ✓ At least 8 characters
                    </div>
                    <div className={passwordChecks.hasUppercase ? 'text-green-600' : 'text-slate-500'}>
                      ✓ At least one uppercase letter
                    </div>
                    <div className={passwordChecks.hasLowercase ? 'text-green-600' : 'text-slate-500'}>
                      ✓ At least one lowercase letter
                    </div>
                    <div className={passwordChecks.hasDigit ? 'text-green-600' : 'text-slate-500'}>
                      ✓ At least one digit
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
                disabled={submitting}
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting || !isPasswordStrong || password !== confirmPassword}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-medium py-2 rounded-lg transition duration-200"
            >
              {submitting ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign in here
            </Link>
          </p>
        </div>

        <p className="text-center text-slate-400 text-sm mt-6">
          Secure registration with password strength validation
        </p>
      </div>
    </div>
  );
}
