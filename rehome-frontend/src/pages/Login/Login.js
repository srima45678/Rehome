// Login.js
// Login form page
// Theory: useState manages what user types in the form
// When user submits, we will later send data to backend API

import { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../utils/api';

function Login() {

  // formData stores what user types in input fields
  // It's an object with email and password
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // showPassword = toggle to show/hide password
  const [showPassword, setShowPassword] = useState(false);

  // This function runs every time user types in any input
  // e.target.name = which input field (email or password)
  // e.target.value = what user typed
  const handleChange = (e) => {
    setFormData({
      ...formData,           // keep existing data
      [e.target.name]: e.target.value  // update only changed field
    });
  };

  // This runs when user clicks Login button
  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    // Send login data to backend
    const response = await API.post('/auth/login', {
      email: formData.email,
      password: formData.password
    });

    // Save token and user info
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));

    // Redirect based on role
    const role = response.data.user.role;
    if (role === 'admin') {
      window.location.href = '/admin/dashboard';
    } else if (role === 'seller') {
      window.location.href = '/seller/dashboard';
    } else {
      window.location.href = '/';
    }

  } catch (error) {
    alert(error.response?.data?.message || 'Login failed. Try again.');
  }
};

  return (
    // Full screen centered layout
    <div className="min-h-screen bg-secondary flex items-center justify-center px-4 py-10">
      
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-4xl">🛋️</span>
          <h1 className="text-2xl font-bold text-primary mt-2">Welcome Back!</h1>
          <p className="text-gray-500 mt-1">Login to your ReHome account</p>
        </div>

        {/* Login Form */}
        {/* onSubmit runs handleSubmit when form is submitted */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Email field */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-orange-100 transition-all"
            />
          </div>

          {/* Password field */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Password
            </label>
            <div className="relative">
              {/* relative = lets us position the eye button inside input */}
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-orange-100 transition-all pr-12"
              />
              {/* Show/hide password toggle button */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* Forgot password link */}
          <div className="text-right">
            <Link to="/forgot-password"
              className="text-primary text-sm hover:underline">
              Forgot Password?
            </Link>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="w-full bg-primary hover:bg-accent text-white font-bold py-3 rounded-xl transition-colors text-lg">
            Login to ReHome
          </button>

        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 border-t border-gray-200"></div>
          <span className="text-gray-400 text-sm">or</span>
          <div className="flex-1 border-t border-gray-200"></div>
        </div>

        {/* Register link */}
        <p className="text-center text-gray-600">
          Don't have an account?{" "}
          <Link to="/register"
            className="text-primary font-bold hover:underline">
            Register here
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Login;