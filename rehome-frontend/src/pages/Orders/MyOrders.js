// MyOrders.js
// Buyer's order history with tracking

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../utils/api';

function MyOrders() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchOrders();
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

  return (
    <div className="min-h-screen bg-secondary py-8 px-4">
      <div className="max-w-4xl mx-auto">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            📦 My Orders
          </h1>
          <p className="text-gray-500 mt-2">
            Track and manage your purchases
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <p className="text-5xl animate-bounce">📦</p>
            <p className="text-gray-500 mt-3">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl text-center py-16 shadow-sm">
            <p className="text-6xl mb-4">🛍️</p>
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              No orders yet
            </h3>
            <p className="text-gray-500 mb-6">
              Start shopping to see your orders here
            </p>
            <Link to="/products"
              className="bg-primary text-white px-6 py-3 rounded-xl hover:bg-accent transition-colors inline-block">
              Browse Furniture
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order._id} className="bg-white rounded-2xl shadow-sm p-6">

                <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
                  <div className="flex gap-4">
                    {/* Product image */}
                    <div className="w-20 h-20 bg-orange-50 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                      {order.product?.images?.length > 0 ? (
                        <img src={order.product.images[0]} alt={order.product.title}
                          className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-3xl">
                          {categoryEmoji[order.product?.category] || '📦'}
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-800">
                        {order.product?.title}
                      </h3>
                      <p className="text-primary font-bold mt-1">
                        Rs. {Number(order.price).toLocaleString()}
                      </p>
                      <p className="text-gray-400 text-sm mt-1">
                        Ordered on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  <span className={`text-xs px-3 py-1.5 rounded-full font-semibold ${statusInfo[order.status].color}`}>
                    {statusInfo[order.status].label}
                  </span>
                </div>

                {/* Tracking progress bar */}
                {order.status !== 'cancelled' && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between">
                      {trackingSteps.map((step, index) => {
                        const currentIndex = trackingSteps.indexOf(order.status);
                        const isCompleted = index <= currentIndex;
                        return (
                          <div key={step} className="flex-1 flex items-center">
                            <div className="flex flex-col items-center flex-shrink-0">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                                ${isCompleted ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                                {isCompleted ? '✓' : index + 1}
                              </div>
                              <p className={`text-xs mt-1 capitalize ${isCompleted ? 'text-primary font-semibold' : 'text-gray-400'}`}>
                                {step}
                              </p>
                            </div>
                            {index < trackingSteps.length - 1 && (
                              <div className={`flex-1 h-1 mx-1 rounded ${index < currentIndex ? 'bg-primary' : 'bg-gray-100'}`} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Delivery details */}
                <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-1">
                  <p className="text-gray-600">
                    📍 <span className="font-semibold">Deliver to:</span> {order.deliveryAddress}, {order.deliveryCity}
                  </p>
                  <p className="text-gray-600">
                    📞 <span className="font-semibold">Contact:</span> {order.contactPhone}
                  </p>
                  <p className="text-gray-600">
                    💵 <span className="font-semibold">Payment:</span> {order.paymentMethod === 'cash_on_delivery' ? 'Cash on Delivery' : 'Online'} • {order.paymentStatus}
                  </p>
                  <p className="text-gray-600">
                    🧑 <span className="font-semibold">Seller:</span> {order.seller?.fullName} ({order.seller?.phone})
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-4">
                  <Link to={`/products/${order.product?._id}`}
                    className="flex-1 text-center border-2 border-gray-200 text-gray-600 font-semibold py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                    View Product
                  </Link>
                  {(order.status === 'pending' || order.status === 'confirmed') && (
                    <button
                      onClick={() => handleCancel(order._id)}
                      className="flex-1 border-2 border-red-200 text-red-600 font-semibold py-2 rounded-lg hover:bg-red-50 transition-colors text-sm">
                      Cancel Order
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