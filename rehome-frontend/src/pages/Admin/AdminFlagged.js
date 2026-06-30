import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../utils/api';

function AdminFlagged() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/'); return; }
    fetchFlagged();
  }, []);

  const fetchFlagged = async () => {
    try {
      const res = await API.get('/admin/flagged');
      setProducts(res.data.products);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id, action) => {
    const confirmMsg = action === 'remove'
      ? 'Remove this listing permanently?'
      : 'Approve this listing and clear all flags?';
    if (!window.confirm(confirmMsg)) return;
    try {
      const res = await API.put(`/admin/flagged/${id}/resolve`, { action });
      alert(res.data.message);
      fetchFlagged();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    }
  };

  const reasonLabels = {
    fake: '🎭 Fake listing',
    misleading: '🖼️ Misleading',
    wrong_price: '💰 Wrong price',
    inappropriate: '⚠️ Inappropriate',
    other: '📝 Other'
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-5xl animate-bounce">🚩</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-800 text-white py-8 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold">🚩 Flagged Listings</h1>
            <p className="text-gray-300 mt-1">{products.length} listing(s) need review</p>
          </div>
          <div className="flex gap-2">
            <Link to="/admin/dashboard" className="bg-gray-700 hover:bg-gray-600 text-white font-bold px-4 py-2 rounded-lg text-sm">
              📊 Overview
            </Link>
            <Link to="/admin/users" className="bg-gray-700 hover:bg-gray-600 text-white font-bold px-4 py-2 rounded-lg text-sm">
              👥 Users
            </Link>
            <Link to="/admin/products" className="bg-gray-700 hover:bg-gray-600 text-white font-bold px-4 py-2 rounded-lg text-sm">
              📦 Products
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {products.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center shadow-sm">
            <p className="text-6xl mb-4">✅</p>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">All clear!</h2>
            <p className="text-gray-400">No flagged listings at the moment</p>
          </div>
        ) : (
          <div className="space-y-6">
            {products.map(product => (
              <div key={product._id} className="bg-white rounded-2xl shadow-sm p-6">
                {/* Product Info */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-20 h-20 bg-orange-100 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
                    {product.images?.[0]
                      ? <img src={product.images[0]} alt="" className="w-full h-full object-cover rounded-xl" />
                      : '📦'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-xl font-bold text-gray-800">{product.title}</h2>
                      <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-bold">
                        🚩 {product.flags.length} report{product.flags.length > 1 ? 's' : ''}
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm mt-1">
                      Rs. {Number(product.price).toLocaleString()} • {product.category} • {product.city}
                    </p>
                    <p className="text-gray-400 text-sm">
                      Seller: {product.seller?.fullName} ({product.seller?.email})
                    </p>
                  </div>
                </div>

                {/* Reports */}
                <div className="bg-red-50 rounded-xl p-4 mb-4">
                  <p className="font-bold text-red-700 mb-3">Reports:</p>
                  <div className="space-y-2">
                    {product.flags.map((flag, i) => (
                      <div key={i} className="bg-white rounded-lg p-3 border border-red-100">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <span className="font-semibold text-sm text-gray-700">
                            {flag.user?.fullName || 'Unknown user'}
                          </span>
                          <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                            {reasonLabels[flag.reason] || flag.reason}
                          </span>
                        </div>
                        {flag.comment && (
                          <p className="text-gray-500 text-sm mt-1">"{flag.comment}"</p>
                        )}
                        <p className="text-gray-400 text-xs mt-1">
                          {new Date(flag.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={() => handleResolve(product._id, 'keep')}
                    className="flex-1 border-2 border-green-300 text-green-700 font-bold py-3 rounded-xl hover:bg-green-50 transition-all">
                    ✅ Approve — Keep Listing
                  </button>
                  <button
                    onClick={() => handleResolve(product._id, 'remove')}
                    className="flex-1 border-2 border-red-300 text-red-700 font-bold py-3 rounded-xl hover:bg-red-50 transition-all">
                    🗑️ Remove Listing
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminFlagged;