// SellerOrders.js
// Seller manages orders for their products
// Can update status: pending → confirmed → shipped → delivered

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../utils/api';

function SellerOrders() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState({}); // keyed by orderId

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
  try {
    const response = await API.get('/orders/seller-orders');
    setOrders(response.data.orders);

    // For delivered orders, check if the buyer left a review on that product
    const delivered = response.data.orders.filter(o => o.status === 'delivered' && o.product?._id);
    delivered.forEach(async (order) => {
      try {
        const reviewRes = await API.get(`/reviews/product/${order.product._id}`);
        const matchingReview = reviewRes.data.reviews?.find(
          r => r.buyer?._id === order.buyer?._id
        );
        if (matchingReview) {
          setReviews(prev => ({ ...prev, [order._id]: matchingReview }));
        }
      } catch (err) {
        // No reviews found for this product — ignore
      }
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    setLoading(false);
  }
};

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await API.put(`/orders/${orderId}/status`, { status: newStatus });
      fetchOrders();
    } catch (error) {
      alert('Failed to update order status');
    }
  };
  
  // Seller updates order status
  const handleDownloadReceipt = async (orderId) => {
    try {
      const res = await API.get(`/orders/${orderId}/receipt`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ReHome-Receipt-${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Failed to download receipt');
    }
  };

  // Get next possible status
  const nextStatus = {
    pending: 'confirmed',
    confirmed: 'shipped',
    shipped: 'delivered'
  };

  const nextStatusLabel = {
    pending: '✅ Confirm Order',
    confirmed: '🚚 Mark as Shipped',
    shipped: '📦 Mark as Delivered'
  };

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

        <div className="mb-8 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              📬 Incoming Orders
            </h1>
            <p className="text-gray-500 mt-2">
              Manage orders for your listings
            </p>
          </div>
          <Link to="/seller/dashboard"
            className="bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-accent transition-colors">
            ← Dashboard
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <p className="text-5xl animate-bounce">📬</p>
            <p className="text-gray-500 mt-3">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl text-center py-16 shadow-sm">
            <p className="text-6xl mb-4">📭</p>
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              No orders yet
            </h3>
            <p className="text-gray-500">
              When buyers purchase your items, orders will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order._id} className="bg-white rounded-2xl shadow-sm p-6">

                <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
                  <div className="flex gap-4">
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

                {/* Buyer & delivery info */}
                <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-1">
                  <p className="text-gray-600">
                    🧑 <span className="font-semibold">Buyer:</span> {order.buyer?.fullName}
                  </p>
                  <p className="text-gray-600">
                    📍 <span className="font-semibold">Deliver to:</span> {order.deliveryAddress}, {order.deliveryCity}
                  </p>
                  <p className="text-gray-600">
                    📞 <span className="font-semibold">Contact:</span> {order.contactPhone}
                  </p>
                  <p className="text-gray-600">
                    💵 <span className="font-semibold">Payment:</span> {order.paymentMethod === 'cash_on_delivery' ? 'Cash on Delivery' : 'Online'} • {order.paymentStatus}
                  </p>
                </div>

                {/* Action button */}
                {nextStatus[order.status] && (
                  <button
                    onClick={() => handleStatusUpdate(order._id, nextStatus[order.status])}
                    className="w-full mt-4 bg-primary hover:bg-accent text-white font-bold py-3 rounded-xl transition-all">
                    {nextStatusLabel[order.status]}
                  </button>
                )}

                {order.status === 'delivered' && (
                  <div className="mt-4">
                    <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center mb-3">
                      <p className="text-green-700 font-semibold text-sm">
                        ✅ Order completed successfully!
                      </p>
                    </div>

                    {/* Buyer's review, if left */}
                    {reviews[order._id] ? (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-yellow-800 text-sm">
                            ⭐ Buyer's Review
                          </p>
                          <span className="text-yellow-500 text-sm">
                            {'★'.repeat(reviews[order._id].rating)}
                            {'☆'.repeat(5 - reviews[order._id].rating)}
                          </span>
                        </div>
                        {reviews[order._id].comment && (
                          <p className="text-gray-600 text-sm italic">
                            "{reviews[order._id].comment}"
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-center mb-3">
                        <p className="text-gray-400 text-sm">
                          ⏳ Buyer hasn't left a review yet
                        </p>
                      </div>
                    )}

                    <button
                      onClick={() => handleDownloadReceipt(order._id)}
                      className="w-full border-2 border-green-300 text-green-700 font-semibold py-2 rounded-xl hover:bg-green-50 transition-colors text-sm">
                      🧾 Download Receipt
                    </button>
                  </div>
                )}

                {order.status === 'cancelled' && (
                  <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-3 text-center">
                    <p className="text-red-700 font-semibold text-sm">
                      ❌ This order was cancelled
                    </p>
                  </div>
                )}

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SellerOrders;