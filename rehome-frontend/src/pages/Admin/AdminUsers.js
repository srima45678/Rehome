// AdminUsers.js
// Admin can view all users and ban/unban or delete them

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../utils/api';

function AdminUsers() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, buyer, seller, admin

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await API.get('/admin/users');
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Ban/Unban user
  const handleToggleStatus = async (userId) => {
    try {
      await API.put(`/admin/users/${userId}/toggle-status`);
      fetchUsers(); // refresh list
    } catch (error) {
      alert('Failed to update user status');
    }
  };

  // Delete user permanently
  const handleDelete = async (userId, userName) => {
    if (!window.confirm(`Delete ${userName}'s account permanently?`)) return;
    try {
      await API.delete(`/admin/users/${userId}`);
      alert('✅ User deleted');
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete user');
    }
  };

  // Filter users based on selected tab
  const filteredUsers = filter === 'all'
    ? users
    : users.filter(u => u.role === filter);

  return (
    <div className="min-h-screen bg-secondary">

      {/* Header */}
      <div className="bg-gray-800 text-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold">👥 Manage Users</h1>
              <p className="text-gray-300 mt-1">
                Total: {users.length} registered users
              </p>
            </div>
            <div className="flex gap-2">
              <Link to="/admin/dashboard"
                className="bg-gray-700 hover:bg-gray-600 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors">
                📊 Overview
              </Link>
              <Link to="/admin/users"
                className="bg-yellow-400 text-gray-800 font-bold px-4 py-2 rounded-lg text-sm">
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

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { key: 'all', label: '👥 All Users' },
            { key: 'buyer', label: '🛒 Buyers' },
            { key: 'seller', label: '🏷️ Sellers' },
            { key: 'admin', label: '⚙️ Admins' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all
                ${filter === tab.key
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
              {tab.label} ({tab.key === 'all' ? users.length : users.filter(u => u.role === tab.key).length})
            </button>
          ))}
        </div>

        {/* Users table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">

          {loading ? (
            <div className="text-center py-12">
              <p className="text-4xl animate-bounce">👥</p>
              <p className="text-gray-500 mt-2">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-5xl mb-4">📭</p>
              <p className="text-gray-500">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-6 py-4 text-gray-500 font-semibold text-sm">User</th>
                    <th className="text-left px-6 py-4 text-gray-500 font-semibold text-sm">Email</th>
                    <th className="text-left px-6 py-4 text-gray-500 font-semibold text-sm">Role</th>
                    <th className="text-left px-6 py-4 text-gray-500 font-semibold text-sm">City</th>
                    <th className="text-left px-6 py-4 text-gray-500 font-semibold text-sm">Status</th>
                    <th className="text-left px-6 py-4 text-gray-500 font-semibold text-sm">Joined</th>
                    <th className="text-left px-6 py-4 text-gray-500 font-semibold text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">

                      {/* Name with avatar */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {u.fullName.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold text-gray-800">{u.fullName}</span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4 text-gray-600 text-sm">{u.email}</td>

                      {/* Role badge */}
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-semibold
                          ${u.role === 'seller' ? 'bg-purple-100 text-purple-700' :
                            u.role === 'admin' ? 'bg-red-100 text-red-700' :
                            'bg-blue-100 text-blue-700'}`}>
                          {u.role}
                        </span>
                      </td>

                      {/* City */}
                      <td className="px-6 py-4 text-gray-600 text-sm">{u.city}</td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-semibold
                          ${u.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'}`}>
                          {u.isActive ? '🟢 Active' : '🔴 Banned'}
                        </span>
                      </td>

                      {/* Joined date */}
                      <td className="px-6 py-4 text-gray-400 text-sm">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        {u.role !== 'admin' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleToggleStatus(u._id)}
                              className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors
                                ${u.isActive
                                  ? 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                                  : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                              {u.isActive ? '🚫 Ban' : '✅ Unban'}
                            </button>
                            <button
                              onClick={() => handleDelete(u._id, u.fullName)}
                              className="text-xs px-3 py-1.5 rounded-lg font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                              🗑️ Delete
                            </button>
                          </div>
                        )}
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminUsers;