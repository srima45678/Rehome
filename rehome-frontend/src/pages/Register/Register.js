import { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../utils/api';

function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'buyer',
    city: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters!");
      return;
    }
    try {
      setError('');
      const response = await API.post('/auth/register', {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role,
        city: formData.city
      });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      alert(`✅ Welcome to ReHome, ${response.data.user.fullName}!`);
      window.location.href = '/';
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed. Try again.');
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* Left side */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col justify-center items-center p-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-x-20 -translate-y-20"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full translate-x-20 translate-y-20"></div>

        <div className="text-center text-white z-10">
          <div className="text-8xl mb-6">🏡</div>
          <h2 className="text-4xl font-bold mb-4">Join ReHome Today</h2>
          <p className="text-orange-200 text-lg leading-relaxed max-w-sm">
            Nepal's trusted marketplace for buying and selling quality second-hand furniture
          </p>

          <div className="mt-10 space-y-6">
            <div className="bg-white bg-opacity-10 rounded-2xl p-5 text-left">
              <p className="font-bold text-lg mb-1">🛒 As a Buyer</p>
              <p className="text-orange-200 text-sm">
                Browse, wishlist and purchase quality furniture at great prices
              </p>
              <p className="text-orange-300 text-xs mt-1">
                ✗ Cannot list products for sale
              </p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-2xl p-5 text-left">
              <p className="font-bold text-lg mb-1">🏷️ As a Seller</p>
              <p className="text-orange-200 text-sm">
                List your furniture and earn money — list for free!
              </p>
              <p className="text-green-300 text-xs mt-1">
                ✓ Can also browse and buy
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side — form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-8 bg-secondary overflow-y-auto">
        <div className="w-full max-w-md">

          <div className="text-center mb-6">
            <div className="lg:hidden text-5xl mb-3">🛋️</div>
            <h1 className="text-3xl font-bold text-gray-800">Create Account</h1>
            <p className="text-gray-500 mt-2">
              Join thousands of happy ReHome users
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

            {/* Role Selection */}
            <div className="mb-6">
              <p className="text-gray-700 font-semibold mb-3 text-sm">
                I want to:
              </p>
              <div className="grid grid-cols-2 gap-3">

                <button
                  type="button"
                  onClick={() => setFormData({...formData, role: 'buyer'})}
                  className={`p-4 rounded-xl border-2 transition-all text-left
                    ${formData.role === 'buyer'
                      ? 'border-primary bg-orange-50 shadow-sm'
                      : 'border-gray-100 hover:border-gray-200 bg-gray-50'
                    }`}>
                  <p className="text-2xl mb-2">🛒</p>
                  <p className="font-bold text-gray-800 text-sm">Buy Furniture</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Browse & purchase items
                  </p>
                  <p className="text-xs text-orange-500 mt-1 font-medium">
                    ✗ Cannot list products
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({...formData, role: 'seller'})}
                  className={`p-4 rounded-xl border-2 transition-all text-left
                    ${formData.role === 'seller'
                      ? 'border-primary bg-orange-50 shadow-sm'
                      : 'border-gray-100 hover:border-gray-200 bg-gray-50'
                    }`}>
                  <p className="text-2xl mb-2">🏷️</p>
                  <p className="font-bold text-gray-800 text-sm">Sell Furniture</p>
                  <p className="text-xs text-gray-400 mt-1">
                    List & earn money
                  </p>
                  <p className="text-xs text-green-600 mt-1 font-medium">
                    ✓ Can also buy
                  </p>
                </button>

              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Full Name */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">👤</span>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Your full name"
                    required
                    className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-orange-100 transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">📧</span>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                    className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-orange-100 transition-all"
                  />
                </div>
              </div>

              {/* Phone + City */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-sm">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={(e) => {
                      const numbersOnly = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                      setFormData({ ...formData, phone: numbersOnly });
                    }}
                    placeholder="98XXXXXXXX"
                    required
                    inputMode="numeric"
                    className="w-full border border-gray-200 rounded-xl px-3 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-orange-100 transition-all text-sm"
                  />
                  {formData.phone && formData.phone.length !== 10 && (
                    <p className="text-red-500 text-xs mt-1">Must be 10 digits</p>
                  )}
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-sm">
                    City
                  </label>
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-200 rounded-xl px-3 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-orange-100 transition-all bg-white text-sm">
                    <option value="">Select city</option>
                    {["Kathmandu","Lalitpur","Bhaktapur","Pokhara",
                      "Chitwan","Biratnagar","Butwal","Dharan"].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔒</span>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Minimum 6 characters"
                    required
                    autoComplete="new-password"
                    className="w-full border border-gray-200 rounded-xl pl-11 pr-12 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-orange-100 transition-all"
                  />
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}>
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm">
                  Confirm Password
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔒</span>
                  <input
                    type={showConfirm ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter your password"
                    required
                    autoComplete="new-password"
                    className="w-full border border-gray-200 rounded-xl pl-11 pr-12 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-orange-100 transition-all"
                  />
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}>
                    {showConfirm ? "🙈" : "👁️"}
                  </button>
                </div>

                {/* Password match indicator */}
                {formData.confirmPassword && (
                  <p className={`text-xs font-medium mt-1 ${
                    formData.password === formData.confirmPassword
                      ? 'text-green-600' : 'text-red-500'
                  }`}>
                    {formData.password === formData.confirmPassword
                      ? '✅ Passwords match!'
                      : '❌ Passwords do not match'}
                  </p>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                  ⚠️ {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                className="w-full bg-primary hover:bg-accent text-white font-bold py-3.5 rounded-xl transition-all text-base shadow-sm hover:shadow-md mt-2">
                Create {formData.role === 'buyer' ? 'Buyer' : 'Seller'} Account →
              </button>

            </form>
          </div>

          <p className="text-center text-gray-600 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-bold hover:underline">
              Login here
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}

export default Register;