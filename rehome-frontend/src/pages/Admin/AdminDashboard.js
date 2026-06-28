// AdminDashboard.js
// Main admin overview page
// Shows platform stats, recent users, recent products

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../utils/api';

function AdminDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Protect this page — only admin can access
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await API.get('/admin/stats');
      setStats(response.data.stats);
      setRecentUsers(response.data.recentUsers);
      setRecentProducts(response.data.recentProducts);
    } catch (error) {
      console.error('Error fetching stats:', error);
      alert(error.response?.data?.message || 'Failed to load admin stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <div className="text-center">
          <p className="text-5xl animate-bounce">⚙️</p>
          <p className="text-gray-500 mt-3">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary">

      {/* Header */}
      <div className="bg-gray-800 text-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold">
                ⚙️ Admin Dashboard
              </h1>
              <p className="text-gray-300 mt-1">
                Welcome back, {user?.fullName}
              </p>
            </div>

            {/* Navigation tabs */}
            <div className="flex gap-2">
              <Link to="/admin/dashboard"
                className="bg-yellow-400 text-gray-800 font-bold px-4 py-2 rounded-lg text-sm">
                📊 Overview
              </Link>
              <Link to="/admin/users"
                className="bg-gray-700 hover:bg-gray-600 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors">
                👥 Users
              </Link>
              <Link to="/admin/products"
                className="bg-gray-700 hover:bg-gray-600 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors">
                📦 Products
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">

          <div className="bg-white rounded-2xl p-5 shadow-sm text-center">
            <p className="text-3xl mb-1">👥</p>
            <p className="text-2xl font-bold text-gray-800">{stats.totalUsers}</p>
            <p className="text-gray-500 text-sm mt-1">Total Users</p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm text-center">
            <p className="text-3xl mb-1">🛒</p>
            <p className="text-2xl font-bold text-blue-600">{stats.totalBuyers}</p>
            <p className="text-gray-500 text-sm mt-1">Buyers</p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm text-center">
            <p className="text-3xl mb-1">🏷️</p>
            <p className="text-2xl font-bold text-purple-600">{stats.totalSellers}</p>
            <p className="text-gray-500 text-sm mt-1">Sellers</p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm text-center">
            <p className="text-3xl mb-1">📦</p>
            <p className="text-2xl font-bold text-gray-800">{stats.totalProducts}</p>
            <p className="text-gray-500 text-sm mt-1">Total Products</p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm text-center">
            <p className="text-3xl mb-1">🟢</p>
            <p className="text-2xl font-bold text-green-600">{stats.availableProducts}</p>
            <p className="text-gray-500 text-sm mt-1">Available</p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm text-center">
            <p className="text-3xl mb-1">🔴</p>
            <p className="text-2xl font-bold text-orange-600">{stats.soldProducts}</p>
            <p className="text-gray-500 text-sm mt-1">Sold</p>
          </div>

        </div>

        {/* Two columns: Recent Users + Recent Products */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Recent Users */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                👥 Recent Users
              </h2>
              <Link to="/admin/users"
                className="text-primary text-sm font-semibold hover:underline">
                View All →
              </Link>
            </div>

            {recentUsers.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No users yet</p>
            ) : (
              <div className="space-y-3">
                {recentUsers.map(u => (
                  <div key={u._id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                      {u.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800 truncate">{u.fullName}</p>
                      <p className="text-gray-500 text-sm truncate">{u.email}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold flex-shrink-0
                      ${u.role === 'seller' ? 'bg-purple-100 text-purple-700' :
                        u.role === 'admin' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'}`}>
                      {u.role}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Products */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                📦 Recent Listings
              </h2>
              <Link to="/admin/products"
                className="text-primary text-sm font-semibold hover:underline">
                View All →
              </Link>
            </div>

            {recentProducts.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No products yet</p>
            ) : (
              <div className="space-y-3">
                {recentProducts.map(p => (
                  <div key={p._id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                      📦
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800 truncate">{p.title}</p>
                      <p className="text-gray-500 text-sm">
                        Rs. {Number(p.price).toLocaleString()} • by {p.seller?.fullName}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold flex-shrink-0
                      ${p.status === 'available'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-orange-100 text-orange-700'}`}>
                      {p.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;