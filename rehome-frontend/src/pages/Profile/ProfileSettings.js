// ProfileSettings.js
// Full profile editing page
// Change name, phone, city, password and profile picture

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../utils/api';

function ProfileSettings() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const fileInputRef = useRef(null);

  // Profile info state
  const [profileData, setProfileData] = useState({
    fullName: '',
    phone: '',
    city: ''
  });

  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  // UI states
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [pictureLoading, setPictureLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchProfile();
  // eslint-disable-next-line
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await API.get('/users/profile');
      const userData = response.data.user;
      setCurrentUser(userData);
      setProfileData({
        fullName: userData.fullName || '',
        phone: userData.phone || '',
        city: userData.city || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  // Handle profile info change
  const handleProfileChange = (e) => {
    const value = e.target.name === 'phone'
      ? e.target.value.replace(/[^0-9]/g, '').slice(0, 10)
      : e.target.value;
    setProfileData({ ...profileData, [e.target.name]: value });
    setProfileError('');
    setProfileSuccess('');
  };

  // Handle password change
  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    setPasswordError('');
    setPasswordSuccess('');
  };

  // Submit profile info
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileError('');

    try {
      const response = await API.put('/users/profile', profileData);

      // Update localStorage with new info
      const updatedUser = { ...user, ...profileData };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setProfileSuccess('✅ Profile updated successfully!');
      setCurrentUser(response.data.user);

    } catch (error) {
      setProfileError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  // Submit password change
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordError('');

    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      setPasswordError('New passwords do not match!');
      setPasswordLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      setPasswordLoading(false);
      return;
    }

    try {
      await API.put('/users/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      setPasswordSuccess('✅ Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      });

    } catch (error) {
      setPasswordError(error.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Handle profile picture selection
  const handlePictureChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be less than 2MB');
      return;
    }

    setImagePreview(URL.createObjectURL(file));
    uploadPicture(file);
  };

  // Upload profile picture
  const uploadPicture = async (file) => {
    setPictureLoading(true);
    try {
      const formData = new FormData();
      formData.append('profileImage', file);

      const response = await API.put('/users/profile-picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Update localStorage
      const updatedUser = { ...user, profileImage: response.data.user.profileImage };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setCurrentUser(response.data.user);

      alert('✅ Profile picture updated!');
    } catch (error) {
      alert('Failed to upload picture');
      setImagePreview(null);
    } finally {
      setPictureLoading(false);
    }
  };

  const dashboardPath = user ? `/${user.role}/dashboard` : '/';

  return (
    <div className="min-h-screen bg-secondary py-8 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              ⚙️ Profile Settings
            </h1>
            <p className="text-gray-500 mt-1">
              Manage your account information
            </p>
          </div>
          <button
            onClick={() => navigate(dashboardPath)}
            className="border-2 border-gray-200 text-gray-600 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors text-sm">
            ← Back to Dashboard
          </button>
        </div>

        {/* ── PROFILE PICTURE SECTION ── */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            📸 Profile Picture
          </h2>

          <div className="flex items-center gap-6">
            {/* Current picture or placeholder */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-primary flex items-center justify-center flex-shrink-0">
                {imagePreview || currentUser?.profileImage ? (
                  <img
                    src={imagePreview || currentUser?.profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white font-bold text-3xl">
                    {currentUser?.fullName?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                )}
              </div>
              {pictureLoading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">Uploading...</span>
                </div>
              )}
            </div>

            <div>
              <p className="text-gray-600 font-medium mb-3">
                {currentUser?.fullName}
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handlePictureChange}
                ref={fileInputRef}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={pictureLoading}
                className="bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-accent transition-colors disabled:opacity-50">
                {pictureLoading ? '⏳ Uploading...' : '📷 Change Picture'}
              </button>
              <p className="text-gray-400 text-xs mt-2">
                Max 2MB. JPG, PNG, WEBP
              </p>
            </div>
          </div>
        </div>

        {/* ── PROFILE INFO SECTION ── */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            👤 Personal Information
          </h2>

          <form onSubmit={handleProfileSubmit} className="space-y-4">

            {/* Full Name */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm">
                Full Name *
              </label>
              <input
                type="text"
                name="fullName"
                value={profileData.fullName}
                onChange={handleProfileChange}
                required
                placeholder="Your full name"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-orange-100 transition-all"
              />
            </div>

            {/* Phone + City row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleProfileChange}
                  required
                  placeholder="98XXXXXXXX"
                  inputMode="numeric"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-orange-100 transition-all"
                />
                {profileData.phone && profileData.phone.length !== 10 && (
                  <p className="text-red-500 text-xs mt-1">Must be 10 digits</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm">
                  City *
                </label>
                <select
                  name="city"
                  value={profileData.city}
                  onChange={handleProfileChange}
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-orange-100 transition-all bg-white">
                  <option value="">Select city</option>
                  {["Kathmandu", "Lalitpur", "Bhaktapur", "Pokhara",
                    "Chitwan", "Biratnagar", "Butwal", "Dharan"].map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Email (read only) */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm">
                Email Address
                <span className="text-gray-400 font-normal ml-2">(cannot be changed)</span>
              </label>
              <input
                type="email"
                value={currentUser?.email || ''}
                disabled
                className="w-full border border-gray-100 rounded-xl px-4 py-3 bg-gray-50 text-gray-400 cursor-not-allowed"
              />
            </div>

            {/* Role (read only) */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm">
                Account Role
              </label>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold
                  ${currentUser?.role === 'seller' ? 'bg-blue-100 text-blue-700' :
                    currentUser?.role === 'admin' ? 'bg-red-100 text-red-700' :
                    'bg-green-100 text-green-700'}`}>
                  {currentUser?.role === 'buyer' ? '🛒 Buyer' :
                   currentUser?.role === 'seller' ? '🏷️ Seller' :
                   '⚙️ Admin'}
                </span>
              </div>
            </div>

            {/* Success/Error messages */}
            {profileSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
                {profileSuccess}
              </div>
            )}
            {profileError && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                ⚠️ {profileError}
              </div>
            )}

            <button
              type="submit"
              disabled={profileLoading}
              className="w-full bg-primary hover:bg-accent text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50">
              {profileLoading ? '⏳ Saving...' : '💾 Save Changes'}
            </button>
          </form>
        </div>

        {/* ── CHANGE PASSWORD SECTION ── */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            🔒 Change Password
          </h2>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">

            {/* Current Password */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm">
                Current Password *
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                  placeholder="Enter current password"
                  autoComplete="current-password"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-12 outline-none focus:border-primary focus:ring-2 focus:ring-orange-100 transition-all"
                />
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}>
                  {showCurrentPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm">
                New Password *
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                  placeholder="Minimum 6 characters"
                  autoComplete="new-password"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-12 outline-none focus:border-primary focus:ring-2 focus:ring-orange-100 transition-all"
                />
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}>
                  {showNewPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm">
                Confirm New Password *
              </label>
              <input
                type="password"
                name="confirmNewPassword"
                value={passwordData.confirmNewPassword}
                onChange={handlePasswordChange}
                required
                placeholder="Re-enter new password"
                autoComplete="new-password"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-orange-100 transition-all"
              />
              {/* Password match indicator */}
              {passwordData.confirmNewPassword && (
                <p className={`text-xs mt-1 font-medium
                  ${passwordData.newPassword === passwordData.confirmNewPassword
                    ? 'text-green-600' : 'text-red-500'}`}>
                  {passwordData.newPassword === passwordData.confirmNewPassword
                    ? '✅ Passwords match!'
                    : '❌ Passwords do not match'}
                </p>
              )}
            </div>

            {/* Password strength indicator */}
            {passwordData.newPassword && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Password strength:</p>
                <div className="flex gap-1">
                  {[1,2,3,4].map(level => (
                    <div key={level}
                      className={`flex-1 h-1.5 rounded-full ${
                        passwordData.newPassword.length >= level * 3
                          ? level <= 1 ? 'bg-red-400'
                          : level <= 2 ? 'bg-yellow-400'
                          : level <= 3 ? 'bg-blue-400'
                          : 'bg-green-500'
                          : 'bg-gray-100'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {passwordData.newPassword.length < 6 ? 'Too short' :
                   passwordData.newPassword.length < 8 ? 'Weak' :
                   passwordData.newPassword.length < 10 ? 'Good' :
                   'Strong 💪'}
                </p>
              </div>
            )}

            {/* Success/Error */}
            {passwordSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
                {passwordSuccess}
              </div>
            )}
            {passwordError && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                ⚠️ {passwordError}
              </div>
            )}

            <button
              type="submit"
              disabled={passwordLoading}
              className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50">
              {passwordLoading ? '⏳ Changing...' : '🔒 Change Password'}
            </button>

          </form>
        </div>

      </div>
    </div>
  );
}

export default ProfileSettings;