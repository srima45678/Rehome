import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../utils/api';

function MyOrders() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchOrders();
    // eslint-disable-next-line
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await API.get('/orders/my-orders');
      setOrders(response.data.orders);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (orderId) => {
    if (!window.confirm('Cancel this order?')) return;
    try {
      await API.put(`/orders/${orderId}/cancel`);
      alert('Order cancelled');
      fetchOrders();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to cancel order');
    }
  };

  // Order tracking steps
  const trackingSteps = ['pending', 'confirmed', 'shipped', 'delivered'];

  const statusInfo = {
    pending: { label: '⏳ Pending', color: 'bg-yellow-100 text-yellow-700' },
    confirmed: { label: '✅ Confirmed', color: 'bg-blue-100 text-blue-700' },
    shipped: { label: '🚚 Shipped', color: 'bg-purple-100 text-purple-700' },
    delivered: { label: '📦 Delivered', color: 'bg-green-100 text-green-700' },
    cancelled: { label: '❌ Cancelled', color: 'bg-red-100 text-red-700' }
  };

  const categoryEmoji = {
    sofa: '🛋️', chair: '🪑', table: '🪵', bed: '🛏️',
    wardrobe: '🚪', shelf: '📚', desk: '🖥️', other: '📦'
  };

  // Filter orders by status
  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter(o => o.status === filter);

  return (
    <div className="min-h-screen bg-secondary py-8 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              📦 My Orders
            </h1>
            <p className="text-gray-500 mt-1">
              Track and manage your purchases
            </p>
          </div>
          <Link to="/buyer/dashboard"
            className="border-2 border-gray-200 text-gray-600 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors text-sm">
            ← Dashboard
          </Link>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { key: 'all', label: '📋 All' },
            { key: 'pending', label: '⏳ Pending' },
            { key: 'confirmed', label: '✅ Confirmed' },
            { key: 'shipped', label: '🚚 Shipped' },
            { key: 'delivered', label: '📦 Delivered' },
            { key: 'cancelled', label: '❌ Cancelled' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg font-semibold text-sm transition-all
                ${filter === tab.key
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
              {tab.label}
              <span className="ml-1 text-xs opacity-70">
                ({tab.key === 'all'
                  ? orders.length
                  : orders.filter(o => o.status === tab.key).length})
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20">
            <p className="text-5xl animate-bounce">📦</p>
            <p className="text-gray-500 mt-3">Loading orders...</p>
          </div>

        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl text-center py-16 shadow-sm">
            <p className="text-6xl mb-4">🛍️</p>
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              {filter === 'all' ? 'No orders yet' : `No ${filter} orders`}
            </h3>
            <p className="text-gray-500 mb-6">
              {filter === 'all'
                ? 'Start shopping to see your orders here'
                : 'No orders with this status'}
            </p>
            {filter === 'all' && (
              <Link to="/products"
                className="bg-primary text-white px-6 py-3 rounded-xl hover:bg-accent transition-colors inline-block">
                Browse Furniture
              </Link>
            )}
          </div>

        ) : (
          <div className="space-y-5">
            {filteredOrders.map(order => (
              <div key={order._id}
                className="bg-white rounded-2xl shadow-sm p-5">

                {/* Order header */}
                <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
                  <div className="flex gap-4">

                    {/* Product image */}
                    <div className="w-20 h-20 bg-orange-50 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
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

                    <div>
                      <Link
                        to={`/products/${order.product?._id}`}
                        className="font-bold text-gray-800 hover:text-primary transition-colors">
                        {order.product?.title}
                      </Link>
                      <p className="text-primary font-bold text-lg mt-0.5">
                        Rs. {Number(order.price).toLocaleString()}
                      </p>
                      <p className="text-gray-400 text-sm mt-0.5">
                        🕐 Ordered on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'long', year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Status badge */}
                  <span className={`text-sm px-3 py-1.5 rounded-full font-semibold ${statusInfo[order.status]?.color}`}>
                    {statusInfo[order.status]?.label}
                  </span>
                </div>

                {/* ── TRACKING PROGRESS ── */}
                {order.status !== 'cancelled' && (
                  <div className="mb-5">
                    <div className="flex items-center">
                      {trackingSteps.map((step, index) => {
                        const currentIndex = trackingSteps.indexOf(order.status);
                        const isCompleted = index <= currentIndex;
                        const isActive = index === currentIndex;
                        return (
                          <div key={step} className="flex-1 flex items-center">
                            <div className="flex flex-col items-center flex-shrink-0">
                              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all
                                ${isCompleted
                                  ? 'bg-primary text-white shadow-md ring-2 ring-orange-200'
                                  : 'bg-gray-100 text-gray-400'}`}>
                                {isCompleted ? '✓' : index + 1}
                              </div>
                              <p className={`text-xs mt-1 capitalize font-medium
                                ${isActive ? 'text-primary' :
                                  isCompleted ? 'text-green-600' :
                                  'text-gray-400'}`}>
                                {step}
                              </p>
                            </div>
                            {index < trackingSteps.length - 1 && (
                              <div className={`flex-1 h-1.5 mx-1 mb-4 rounded-full transition-all duration-500
                                ${index < currentIndex ? 'bg-primary' : 'bg-gray-100'}`}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Cancelled banner */}
                {order.status === 'cancelled' && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-center">
                    <p className="text-red-700 font-semibold text-sm">
                      ❌ This order was cancelled
                    </p>
                  </div>
                )}

                {/* Delivered banner */}
                {order.status === 'delivered' && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4 text-center">
                    <p className="text-green-700 font-semibold text-sm">
                      🎉 Order delivered successfully! Enjoy your furniture.
                    </p>
                  </div>
                )}

                {/* Delivery details */}
                <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-1.5 mb-4">
                  <p className="font-semibold text-gray-700 mb-2">
                    📋 Order Details
                  </p>
                  <p className="text-gray-600">
                    📍 <span className="font-medium">Deliver to:</span>{' '}
                    {order.deliveryAddress}, {order.deliveryCity}
                  </p>
                  <p className="text-gray-600">
                    📞 <span className="font-medium">Contact:</span>{' '}
                    {order.contactPhone}
                  </p>
                  <p className="text-gray-600">
                    💵 <span className="font-medium">Payment:</span>{' '}
                    {order.paymentMethod === 'cash_on_delivery'
                      ? 'Cash on Delivery'
                      : 'Online'}
                    {' '}•{' '}
                    <span className={order.paymentStatus === 'paid'
                      ? 'text-green-600 font-semibold'
                      : 'text-orange-600'}>
                      {order.paymentStatus}
                    </span>
                  </p>
                  {order.seller && (
                    <p className="text-gray-600">
                      🧑 <span className="font-medium">Seller:</span>{' '}
                      {order.seller.fullName}
                      {order.seller.phone && ` • ${order.seller.phone}`}
                    </p>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex gap-3 flex-wrap">
                  <Link
                    to={`/products/${order.product?._id}`}
                    className="flex-1 text-center border-2 border-gray-200 text-gray-600 font-semibold py-2 rounded-xl hover:bg-gray-50 transition-colors text-sm">
                    👁️ View Product
                  </Link>

                  {/* Chat with seller */}
                  {order.status !== 'cancelled' && order.status !== 'delivered' && (
                    <Link
                      to="/chat"
                      className="flex-1 text-center border-2 border-primary text-primary font-semibold py-2 rounded-xl hover:bg-orange-50 transition-colors text-sm">
                      💬 Chat Seller
                    </Link>
                  )}

                  {/* Cancel button */}
                  {(order.status === 'pending' || order.status === 'confirmed') && (
                    <button
                      onClick={() => handleCancel(order._id)}
                      className="flex-1 border-2 border-red-200 text-red-600 font-semibold py-2 rounded-xl hover:bg-red-50 transition-colors text-sm">
                      ❌ Cancel Order
                    </button>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyOrders;