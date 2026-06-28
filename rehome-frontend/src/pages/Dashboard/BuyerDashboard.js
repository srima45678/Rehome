import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../utils/api';

function BuyerDashboard() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const [wishlist, setWishlist] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    wishlistCount: 0,
    totalOrders: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    totalSpent: 0
  });

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [wishlistRes, ordersRes] = await Promise.all([
        API.get('/wishlist'),
        API.get('/orders/my-orders')
      ]);

      const myWishlist = wishlistRes.data.wishlist;
      const myOrders = ordersRes.data.orders;

      setWishlist(myWishlist);
      setOrders(myOrders);

      const deliveredOrders = myOrders.filter(o => o.status === 'delivered');
      const totalSpent = deliveredOrders.reduce((sum, o) => sum + o.price, 0);

      setStats({
        wishlistCount: myWishlist.length,
        totalOrders: myOrders.length,
        pendingOrders: myOrders.filter(o =>
          ['pending', 'confirmed', 'shipped'].includes(o.status)
        ).length,
        deliveredOrders: deliveredOrders.length,
        totalSpent
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Cancel this order?')) return;
    try {
      await API.put(`/orders/${orderId}/cancel`);
      fetchDashboardData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to cancel order');
    }
  };

  const handleRemoveWishlist = async (productId) => {
    try {
      await API.post(`/wishlist/${productId}`);
      fetchDashboardData();
    } catch (error) {
      alert('Failed to update wishlist');
    }
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    shipped: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700'
  };

  const statusEmoji = {
    pending: '⏳',
    confirmed: '✅',
    shipped: '🚚',
    delivered: '📦',
    cancelled: '❌'
  };

  const categoryEmoji = {
    sofa: '🛋️', chair: '🪑', table: '🪵', bed: '🛏️',
    wardrobe: '🚪', shelf: '📚', desk: '🖥️', other: '📦'
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl mb-4">🔒 Please login first</p>
          <Link to="/login" className="bg-primary text-white px-6 py-3 rounded-xl">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary">

      {/* Header */}
      <div className="bg-primary text-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0">
                {user.fullName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold">
                  👋 Welcome, {user.fullName.split(' ')[0]}!
                </h1>
                <p className="text-orange-200 mt-0.5 text-sm">
                  🛒 Buyer Account • {user.city}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link to="/products"
                className="bg-yellow-400 hover:bg-yellow-300 text-gray-800 font-bold px-4 py-2.5 rounded-xl transition-colors text-sm">
                🔍 Browse Furniture
              </Link>
              <Link to="/chat"
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-bold px-4 py-2.5 rounded-xl transition-colors text-sm">
                💬 Chats
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {loading ? (
          <div className="text-center py-20">
            <p className="text-5xl animate-bounce">🛒</p>
            <p className="text-gray-500 mt-3">Loading dashboard...</p>
          </div>
        ) : (
          <>
            {/* ── STATS CARDS ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">

              <div className="bg-white rounded-2xl p-5 shadow-sm text-center">
                <p className="text-3xl font-bold text-red-500">
                  {stats.wishlistCount}
                </p>
                <p className="text-gray-500 mt-1 text-sm">Wishlist Items</p>
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-sm text-center">
                <p className="text-3xl font-bold text-primary">
                  {stats.totalOrders}
                </p>
                <p className="text-gray-500 mt-1 text-sm">Total Orders</p>
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-sm text-center">
                <p className="text-3xl font-bold text-orange-500">
                  {stats.pendingOrders}
                </p>
                <p className="text-gray-500 mt-1 text-sm">Active Orders</p>
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-sm text-center">
                <p className="text-3xl font-bold text-green-600">
                  Rs. {stats.totalSpent.toLocaleString()}
                </p>
                <p className="text-gray-500 mt-1 text-sm">Total Spent</p>
              </div>

            </div>

            {/* ── QUICK ACTIONS ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">

              <Link to="/products"
                className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all text-center group border-2 border-transparent hover:border-primary">
                <p className="text-4xl mb-2 group-hover:scale-110 transition-transform">🔍</p>
                <h3 className="font-bold text-gray-800 text-sm">Browse</h3>
                <p className="text-gray-400 text-xs mt-1">Find furniture</p>
              </Link>

              <Link to="/wishlist"
                className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all text-center group border-2 border-transparent hover:border-red-400 relative">
                <p className="text-4xl mb-2 group-hover:scale-110 transition-transform">❤️</p>
                <h3 className="font-bold text-gray-800 text-sm">Wishlist</h3>
                <p className="text-gray-400 text-xs mt-1">Saved items</p>
                {stats.wishlistCount > 0 && (
                  <span className="absolute top-3 right-3 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {stats.wishlistCount}
                  </span>
                )}
              </Link>

              <Link to="/orders"
                className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all text-center group border-2 border-transparent hover:border-primary relative">
                <p className="text-4xl mb-2 group-hover:scale-110 transition-transform">📦</p>
                <h3 className="font-bold text-gray-800 text-sm">Orders</h3>
                <p className="text-gray-400 text-xs mt-1">Track purchases</p>
                {stats.pendingOrders > 0 && (
                  <span className="absolute top-3 right-3 bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {stats.pendingOrders}
                  </span>
                )}
              </Link>

              <Link to="/chat"
                className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all text-center group border-2 border-transparent hover:border-blue-400">
                <p className="text-4xl mb-2 group-hover:scale-110 transition-transform">💬</p>
                <h3 className="font-bold text-gray-800 text-sm">Chats</h3>
                <p className="text-gray-400 text-xs mt-1">Talk to sellers</p>
              </Link>

            </div>

            {/* ── ACTIVE ORDERS ── */}
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-gray-800">
                  📦 My Orders
                </h2>
                <Link to="/orders"
                  className="text-primary font-semibold hover:underline text-sm">
                  View All →
                </Link>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-5xl mb-3">🛍️</p>
                  <p className="text-gray-500 text-sm mb-3">
                    No orders yet. Start shopping!
                  </p>
                  <Link to="/products"
                    className="bg-primary text-white px-5 py-2 rounded-xl hover:bg-accent transition-colors text-sm">
                    Browse Furniture
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.slice(0, 5).map(order => (
                    <div key={order._id}
                      className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl">

                      <div className="w-14 h-14 bg-orange-50 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                        {order.product?.images?.length > 0 ? (
                          <img src={order.product.images[0]}
                            alt={order.product.title}
                            className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-3xl">
                            {categoryEmoji[order.product?.category] || '📦'}
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-800 text-sm truncate">
                          {order.product?.title}
                        </p>
                        <p className="text-primary font-bold text-sm">
                          Rs. {Number(order.price).toLocaleString()}
                        </p>
                        <p className="text-gray-400 text-xs mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${statusColors[order.status]}`}>
                          {statusEmoji[order.status]} {order.status}
                        </span>
                        {order.status === 'pending' && (
                          <button
                            onClick={() => handleCancelOrder(order._id)}
                            className="text-xs text-red-600 border border-red-200 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors">
                            Cancel
                          </button>
                        )}
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── WISHLIST PREVIEW ── */}
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-gray-800">
                  ❤️ My Wishlist
                </h2>
                <Link to="/wishlist"
                  className="text-primary font-semibold hover:underline text-sm">
                  View All →
                </Link>
              </div>

              {wishlist.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-5xl mb-3">💔</p>
                  <p className="text-gray-500 text-sm mb-3">
                    Nothing saved yet. Browse and save items!
                  </p>
                  <Link to="/products"
                    className="bg-primary text-white px-5 py-2 rounded-xl hover:bg-accent transition-colors text-sm">
                    Browse Furniture
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {wishlist.slice(0, 6).map(product => (
                    <div key={product._id}
                      className="border border-gray-100 rounded-xl overflow-hidden hover:shadow-sm transition-all">

                      <Link to={`/products/${product._id}`}>
                        <div className="h-32 bg-orange-50 flex items-center justify-center overflow-hidden">
                          {product.images?.length > 0 ? (
                            <img src={product.images[0]} alt={product.title}
                              className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-5xl">
                              {categoryEmoji[product.category] || '📦'}
                            </span>
                          )}
                        </div>
                      </Link>

                      <div className="p-3">
                        <Link to={`/products/${product._id}`}>
                          <p className="font-bold text-gray-800 text-sm line-clamp-1 hover:text-primary">
                            {product.title}
                          </p>
                        </Link>
                        <p className="text-primary font-bold text-sm mt-0.5">
                          Rs. {Number(product.price).toLocaleString()}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold
                            ${product.status === 'available'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-orange-100 text-orange-700'}`}>
                            {product.status === 'available' ? '🟢' : '🔴'} {product.status}
                          </span>
                          <button
                            onClick={() => handleRemoveWishlist(product._id)}
                            className="text-red-400 hover:text-red-600 text-xs transition-colors">
                            💔 Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── PROFILE CARD ── */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  👤 My Profile
                </h2>
                <Link to="/profile/settings"
                  className="flex items-center gap-2 text-primary font-semibold text-sm border border-primary px-3 py-1.5 rounded-lg hover:bg-orange-50 transition-colors">
                  ⚙️ Edit Profile →
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-gray-500 text-sm">Full Name</p>
                  <p className="font-bold text-gray-800 mt-1">{user.fullName}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-gray-500 text-sm">Email</p>
                  <p className="font-bold text-gray-800 mt-1 text-sm">{user.email}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-gray-500 text-sm">City</p>
                  <p className="font-bold text-gray-800 mt-1">{user.city}</p>
                </div>
              </div>
            </div>

          </>
        )}
      </div>
    </div>
  );
}

export default BuyerDashboard;