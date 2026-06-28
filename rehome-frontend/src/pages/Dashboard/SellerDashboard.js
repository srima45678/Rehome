import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../utils/api';

function SellerDashboard() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalViews: 0,
    available: 0,
    sold: 0,
    reserved: 0,
    totalEarnings: 0,
    pendingOrders: 0,
    totalOrders: 0
  });

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch products and orders simultaneously
      const [productsRes, ordersRes] = await Promise.all([
        API.get('/products/seller/my-products'),
        API.get('/orders/seller-orders')
      ]);

      const myProducts = productsRes.data.products;
      const myOrders = ordersRes.data.orders;

      setProducts(myProducts);
      setOrders(myOrders);

      // Calculate all stats dynamically
      const deliveredOrders = myOrders.filter(o => o.status === 'delivered');
      const totalEarnings = deliveredOrders.reduce((sum, o) => sum + o.price, 0);

      setStats({
        totalProducts: myProducts.length,
        totalViews: myProducts.reduce((sum, p) => sum + p.views, 0),
        available: myProducts.filter(p => p.status === 'available').length,
        sold: myProducts.filter(p => p.status === 'sold').length,
        reserved: myProducts.filter(p => p.status === 'reserved').length,
        totalEarnings,
        pendingOrders: myOrders.filter(o => o.status === 'pending').length,
        totalOrders: myOrders.length
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Delete this listing?')) return;
    try {
      await API.delete(`/products/${productId}`);
      alert('✅ Product deleted!');
      fetchDashboardData();
    } catch (error) {
      alert('Failed to delete product');
    }
  };

  const handleOrderStatus = async (orderId, newStatus) => {
    try {
      await API.put(`/orders/${orderId}/status`, { status: newStatus });
      fetchDashboardData();
    } catch (error) {
      alert('Failed to update order');
    }
  };

  const nextStatus = {
    pending: 'confirmed',
    confirmed: 'shipped',
    shipped: 'delivered'
  };

  const nextStatusLabel = {
    pending: '✅ Confirm',
    confirmed: '🚚 Ship',
    shipped: '📦 Deliver'
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    shipped: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700'
  };

  const conditionLabels = {
    like_new: '✨ Like New',
    good: '👍 Good',
    fair: '👌 Fair',
    poor: '⚠️ Poor'
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
              {/* Profile picture */}
              <div className="w-14 h-14 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0">
                {user.fullName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold">
                  👋 Welcome, {user.fullName.split(' ')[0]}!
                </h1>
                <p className="text-orange-200 mt-0.5 text-sm">
                  🏷️ Seller Account • {user.city}
                </p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Link to="/seller/orders"
                className="relative bg-blue-500 hover:bg-blue-600 text-white font-bold px-4 py-2.5 rounded-xl transition-colors text-sm">
                📬 Orders
                {stats.pendingOrders > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {stats.pendingOrders}
                  </span>
                )}
              </Link>
              <Link to="/chat"
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-bold px-4 py-2.5 rounded-xl transition-colors text-sm">
                💬 Chats
              </Link>
              <Link to="/sell"
                className="bg-yellow-400 hover:bg-yellow-300 text-gray-800 font-bold px-4 py-2.5 rounded-xl transition-colors text-sm">
                + Add Listing
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {loading ? (
          <div className="text-center py-20">
            <p className="text-5xl animate-bounce">🛋️</p>
            <p className="text-gray-500 mt-3">Loading dashboard...</p>
          </div>
        ) : (
          <>
            {/* ── STATS CARDS ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">

              <div className="bg-white rounded-2xl p-5 shadow-sm text-center">
                <p className="text-3xl font-bold text-primary">
                  {stats.totalProducts}
                </p>
                <p className="text-gray-500 mt-1 text-sm">Total Listings</p>
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-sm text-center">
                <p className="text-3xl font-bold text-blue-600">
                  {stats.totalViews}
                </p>
                <p className="text-gray-500 mt-1 text-sm">Total Views</p>
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-sm text-center">
                <p className="text-3xl font-bold text-orange-600">
                  {stats.totalOrders}
                </p>
                <p className="text-gray-500 mt-1 text-sm">Total Orders</p>
                {stats.pendingOrders > 0 && (
                  <p className="text-xs text-red-500 font-semibold mt-1">
                    {stats.pendingOrders} pending!
                  </p>
                )}
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-sm text-center">
                <p className="text-3xl font-bold text-green-600">
                  Rs. {stats.totalEarnings.toLocaleString()}
                </p>
                <p className="text-gray-500 mt-1 text-sm">Total Earnings</p>
              </div>

            </div>

            {/* ── PRODUCT STATUS BREAKDOWN ── */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              <div className="bg-white rounded-xl p-4 shadow-sm text-center border-l-4 border-green-500">
                <p className="text-2xl font-bold text-green-600">{stats.available}</p>
                <p className="text-gray-500 text-sm mt-1">🟢 Available</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm text-center border-l-4 border-yellow-500">
                <p className="text-2xl font-bold text-yellow-600">{stats.reserved}</p>
                <p className="text-gray-500 text-sm mt-1">🟡 Reserved</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm text-center border-l-4 border-orange-500">
                <p className="text-2xl font-bold text-orange-600">{stats.sold}</p>
                <p className="text-gray-500 text-sm mt-1">🔴 Sold</p>
              </div>
            </div>

            {/* ── PENDING ORDERS (quick action) ── */}
            {orders.filter(o => o.status === 'pending').length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-yellow-800">
                    ⏳ Pending Orders — Action Required!
                  </h3>
                  <Link to="/seller/orders"
                    className="text-yellow-700 text-sm font-semibold hover:underline">
                    View All →
                  </Link>
                </div>
                <div className="space-y-3">
                  {orders.filter(o => o.status === 'pending').slice(0, 3).map(order => (
                    <div key={order._id}
                      className="bg-white rounded-xl p-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          {order.product?.images?.length > 0 ? (
                            <img src={order.product.images[0]}
                              alt={order.product.title}
                              className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <span className="text-xl">
                              {categoryEmoji[order.product?.category] || '📦'}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-gray-800 text-sm truncate">
                            {order.product?.title}
                          </p>
                          <p className="text-gray-500 text-xs">
                            By {order.buyer?.fullName} •
                            Rs. {Number(order.price).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleOrderStatus(order._id, 'confirmed')}
                        className="bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex-shrink-0 transition-colors">
                        ✅ Confirm
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── MY LISTINGS ── */}
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-gray-800">
                  📦 My Listings
                </h2>
                <Link to="/sell"
                  className="text-primary font-semibold hover:underline text-sm">
                  + Add New
                </Link>
              </div>

              {products.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-5xl mb-3">📭</p>
                  <h3 className="text-lg font-bold text-gray-700 mb-2">
                    No listings yet!
                  </h3>
                  <p className="text-gray-500 mb-4 text-sm">
                    Start selling your furniture today
                  </p>
                  <Link to="/sell"
                    className="bg-primary text-white px-6 py-3 rounded-xl hover:bg-accent transition-colors text-sm">
                    List Your First Product
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {products.map(product => (
                    <div key={product._id}
                      className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">

                      {/* Product image or emoji */}
                      <div className="w-16 h-16 bg-orange-50 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                        {product.images?.length > 0 ? (
                          <img src={product.images[0]} alt={product.title}
                            className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-3xl">
                            {categoryEmoji[product.category] || '📦'}
                          </span>
                        )}
                      </div>

                      {/* Product info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-800 truncate">
                          {product.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <span className="text-primary font-bold text-sm">
                            Rs. {Number(product.price).toLocaleString()}
                          </span>
                          <span className="text-gray-400 text-xs">
                            {conditionLabels[product.condition]}
                          </span>
                          <span className="text-gray-400 text-xs">
                            👁️ {product.views} views
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold
                            ${product.status === 'available' ? 'bg-green-100 text-green-700' :
                              product.status === 'reserved' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-orange-100 text-orange-700'}`}>
                            {product.status === 'available' ? '🟢 Available' :
                             product.status === 'reserved' ? '🟡 Reserved' :
                             '🔴 Sold'}
                          </span>
                          <span className="text-gray-400 text-xs">
                            📍 {product.city}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 flex-shrink-0">
                        <Link to={`/products/${product._id}`}
                          className="bg-blue-50 text-blue-600 px-3 py-2 rounded-lg text-xs hover:bg-blue-100 transition-colors font-semibold">
                          👁️ View
                        </Link>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="bg-red-50 text-red-600 px-3 py-2 rounded-lg text-xs hover:bg-red-100 transition-colors font-semibold">
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── RECENT ORDERS ── */}
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-gray-800">
                  📬 Recent Orders
                </h2>
                <Link to="/seller/orders"
                  className="text-primary font-semibold hover:underline text-sm">
                  View All →
                </Link>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-4xl mb-3">📭</p>
                  <p className="text-gray-500 text-sm">
                    No orders yet. Share your listings to get buyers!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.slice(0, 5).map(order => (
                    <div key={order._id}
                      className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl">

                      <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                        {order.product?.images?.length > 0 ? (
                          <img src={order.product.images[0]}
                            alt={order.product.title}
                            className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-2xl">
                            {categoryEmoji[order.product?.category] || '📦'}
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-800 text-sm truncate">
                          {order.product?.title}
                        </p>
                        <p className="text-gray-500 text-xs mt-0.5">
                          Buyer: {order.buyer?.fullName} •
                          Rs. {Number(order.price).toLocaleString()}
                        </p>
                        <p className="text-gray-400 text-xs">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${statusColors[order.status]}`}>
                          {order.status}
                        </span>
                        {nextStatus[order.status] && (
                          <button
                            onClick={() => handleOrderStatus(order._id, nextStatus[order.status])}
                            className="bg-primary text-white text-xs px-3 py-1 rounded-lg hover:bg-accent transition-colors font-semibold">
                            {nextStatusLabel[order.status]}
                          </button>
                        )}
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

export default SellerDashboard;