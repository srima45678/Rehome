// ForgotPassword.js
// 3-step flow:
// Step 1: Enter email → get OTP
// Step 2: Enter OTP → verify
// Step 3: Enter new password → reset

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../utils/api';

function ForgotPassword() {
  const navigate = useNavigate();

  // Which step we're on: 1, 2, or 3
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ── STEP 1: Send OTP ──
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await API.post('/auth/forgot-password', { email });
      setSuccess(response.data.message);
      setStep(2);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // ── STEP 2: Verify OTP ──
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await API.post('/auth/verify-otp', { email, otp });
      setSuccess('OTP verified! Now set your new password.');
      setStep(3);
    } catch (error) {
      setError(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  // ── STEP 3: Reset Password ──
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match!');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      await API.post('/auth/reset-password', {
        email,
        otp,
        newPassword
      });

      setSuccess('Password reset successfully!');

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (error) {
      setError(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  // Step labels for progress indicator
  const steps = [
    { num: 1, label: 'Email' },
    { num: 2, label: 'OTP' },
    { num: 3, label: 'New Password' }
  ];

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center px-4 py-10">
      <div className="bg-white rounded-2xl shadow-sm p-8 w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-6">
          <span className="text-4xl">🛋️</span>
          <h1 className="text-2xl font-bold text-primary mt-2">
            Forgot Password?
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            We'll send an OTP to your email
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {steps.map((s, index) => (
            <div key={s.num} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all
                  ${step > s.num
                    ? 'bg-green-500 text-white'
                    : step === s.num
                    ? 'bg-primary text-white ring-4 ring-orange-100'
                    : 'bg-gray-100 text-gray-400'}`}>
                  {step > s.num ? '✓' : s.num}
                </div>
                <p className={`text-xs mt-1 font-medium
                  ${step >= s.num ? 'text-primary' : 'text-gray-400'}`}>
                  {s.label}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-16 h-1 mx-2 mb-4 rounded transition-all
                  ${step > s.num ? 'bg-green-500' : 'bg-gray-100'}`}
                />
              )}
            </div>
          ))}
        </div>

        {/* ── STEP 1 — Enter Email ── */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  📧
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  placeholder="Enter your registered email"
                  required
                  className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-orange-100 transition-all"
                />
              </div>
              <p className="text-gray-400 text-xs mt-1.5">
                We'll send a 6-digit OTP to this email
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-accent text-white font-bold py-3.5 rounded-xl transition-all disabled:opacity-50">
              {loading ? '⏳ Sending OTP...' : '📧 Send OTP to Email'}
            </button>
          </form>
        )}

        {/* ── STEP 2 — Enter OTP ── */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
                ✅ {success}
              </div>
            )}

            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm">
                Enter OTP
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => {
                  const numbersOnly = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
                  setOtp(numbersOnly);
                  setError('');
                }}
                placeholder="Enter 6-digit OTP"
                required
                maxLength={6}
                inputMode="numeric"
                className="w-full border border-gray-200 rounded-xl px-4 py-4 outline-none focus:border-primary focus:ring-2 focus:ring-orange-100 transition-all text-center text-2xl font-bold tracking-widest"
              />
              <p className="text-gray-400 text-xs mt-1.5 text-center">
                OTP sent to <strong>{email}</strong> • Valid for 10 minutes
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-primary hover:bg-accent text-white font-bold py-3.5 rounded-xl transition-all disabled:opacity-50">
              {loading ? '⏳ Verifying...' : '✅ Verify OTP'}
            </button>

            {/* Resend OTP */}
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setOtp('');
                setError('');
                setSuccess('');
              }}
              className="w-full text-primary font-semibold text-sm hover:underline">
              🔄 Resend OTP
            </button>
          </form>
        )}

        {/* ── STEP 3 — New Password ── */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-4">

            {success && step === 3 && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
                ✅ {success}
              </div>
            )}

            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm">
                New Password
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔒</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="Minimum 6 characters"
                  required
                  autoComplete="new-password"
                  className="w-full border border-gray-200 rounded-xl pl-11 pr-12 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-orange-100 transition-all"
                />
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                  tabIndex={-1}>
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm">
                Confirm New Password
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔒</span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="Re-enter new password"
                  required
                  autoComplete="new-password"
                  className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-orange-100 transition-all"
                />
              </div>
              {confirmPassword && (
                <p className={`text-xs mt-1 font-medium
                  ${newPassword === confirmPassword
                    ? 'text-green-600' : 'text-red-500'}`}>
                  {newPassword === confirmPassword
                    ? '✅ Passwords match!'
                    : '❌ Passwords do not match'}
                </p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-accent text-white font-bold py-3.5 rounded-xl transition-all disabled:opacity-50">
              {loading ? '⏳ Resetting...' : '🔒 Reset Password'}
            </button>
          </form>
        )}

        {/* Success redirect message */}
        {step === 3 && success && success.includes('successfully') && (
          <div className="text-center mt-4">
            <p className="text-gray-500 text-sm">
              Redirecting to login in 2 seconds...
            </p>
          </div>
        )}

        {/* Back to login */}
        <div className="text-center mt-6">
          <Link to="/login"
            className="text-gray-500 text-sm hover:text-primary transition-colors">
            ← Back to Login
          </Link>
        </div>

      </div>
    </div>
  );
}

export default ForgotPassword;