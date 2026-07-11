import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../utils/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';

const COLORS = ['#8B4513', '#D2691E', '#CD853F', '#DEB887', '#F4A460', '#FFDEAD'];

function AdminDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/'); return; }
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [statsRes, analyticsRes] = await Promise.all([
        API.get('/admin/stats'),
        API.get('/admin/analytics')
      ]);
      setStats(statsRes.data.stats);
      setRecentUsers(statsRes.data.recentUsers);
      setRecentProducts(statsRes.data.recentProducts);
      setAnalytics(analyticsRes.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-5xl animate-bounce">⚙️</p>
          <p className="text-gray-500 mt-3">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  const sellerPercent = stats.totalUsers > 0
    ? Math.round((stats.totalSellers / stats.totalUsers) * 100) : 0;
  const soldPercent = stats.totalProducts > 0
    ? Math.round((stats.soldProducts / stats.totalProducts) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-gray-800 text-white py-8 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold">⚙️ Admin Dashboard</h1>
            <p className="text-gray-300 mt-1">Welcome back, {user?.fullName}</p>
          </div>
          <div className="flex gap-2">
            <Link to="/admin/dashboard" className="bg-yellow-400 text-gray-800 font-bold px-4 py-2 rounded-lg text-sm">
              📊 Overview
            </Link>
            <Link to="/admin/users" className="bg-gray-700 hover:bg-gray-600 text-white font-bold px-4 py-2 rounded-lg text-sm">
              👥 Users
            </Link>
            <Link to="/admin/products" className="bg-gray-700 hover:bg-gray-600 text-white font-bold px-4 py-2 rounded-lg text-sm">
              📦 Products
            </Link>
            <Link to="/admin/flagged" className="bg-gray-700 hover:bg-gray-600 text-white font-bold px-4 py-2 rounded-lg text-sm relative">
  🚩 Flagged
  {stats.flaggedProducts > 0 && (
    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
      {stats.flaggedProducts}
    </span>
  )}
</Link>
            <Link to="/admin/offers" className="bg-gray-700 hover:bg-gray-600 text-white font-bold px-4 py-2 rounded-lg text-sm">
            💰 Offers
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[
            { icon: '👥', value: stats.totalUsers, label: 'Total Users', color: 'text-gray-800', link: '/admin/users' },
            { icon: '🛒', value: stats.totalBuyers, label: 'Buyers', color: 'text-blue-600', link:'/admin/users?role=buyer' },
            { icon: '🏷️', value: stats.totalSellers, label: 'Sellers', color: 'text-purple-600', sub: `${sellerPercent}% of users`, link:'/admin/users?role=seller' },
            { icon: '📦', value: stats.totalProducts, label: 'Total Products', color: 'text-gray-800', link:'/admin/products' },
            { icon: '🟢', value: stats.availableProducts, label: 'Available', color: 'text-green-600', link:'/admin/products?status=available' },
            { icon: '🔴', value: stats.soldProducts, label: 'Sold', color: 'text-orange-600', sub: `${soldPercent}% sold`, link: '/admin/products?status=sold' },
          ].map((card, i) => (
            <Link
      key={i}
      to={card.link}
      className="bg-white rounded-2xl p-5 shadow-sm text-center hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer">
      <p className="text-3xl mb-1">{card.icon}</p>
      <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
      <p className="text-gray-500 text-sm mt-1">{card.label}</p>
      {card.sub && <p className="text-xs text-gray-400 mt-1">{card.sub}</p>}
    </Link>
          ))}
        </div>

        {/* Charts Row 1 */}
        {analytics && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

              {/* User Growth Line Chart */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">📈 User Growth (Last 6 Months)</h2>
                {analytics.userGrowth.length === 0 ? (
                  <p className="text-gray-400 text-center py-12">Not enough data yet</p>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={analytics.userGrowth}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                      <Tooltip />
                      <Line type="monotone" dataKey="users" stroke="#8B4513"
                        strokeWidth={3} dot={{ fill: '#8B4513', r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Category Pie Chart */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">🪑 Listings by Category</h2>
                {analytics.categoryData.length === 0 ? (
                  <p className="text-gray-400 text-center py-12">No listings yet</p>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={analytics.categoryData} cx="50%" cy="50%"
                        outerRadius={90} dataKey="value" label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`}>
                        {analytics.categoryData.map((_, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Price Range Bar Chart */}
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">💰 Listings by Price Range (Rs.)</h2>
              {analytics.priceRanges.length === 0 ? (
                <p className="text-gray-400 text-center py-12">No listings yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={analytics.priceRanges}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="range" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#D2691E" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </>
        )}

        {/* Recent Users + Recent Products */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Recent Users */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">👥 Recent Users</h2>
              <Link to="/admin/users" className="text-yellow-600 text-sm font-semibold hover:underline">
                View All →
              </Link>
            </div>
            {recentUsers.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No users yet</p>
            ) : (
              <div className="space-y-3">
                {recentUsers.map(u => (
                  <div key={u._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-yellow-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
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
              <h2 className="text-xl font-bold text-gray-800">📦 Recent Listings</h2>
              <Link to="/admin/products" className="text-yellow-600 text-sm font-semibold hover:underline">
                View All →
              </Link>
            </div>
            {recentProducts.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No products yet</p>
            ) : (
              <div className="space-y-3">
                {recentProducts.map(p => (
                  <div key={p._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
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
                      ${p.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
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