import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../utils/api';

function AdminOffers() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const [offers, setOffers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/'); return; }
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const res = await API.get('/admin/offers');
      setOffers(res.data.offers);
      setStats(res.data.stats);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusConfig = {
    pending:   { label: '⏳ Pending',   bg: 'bg-yellow-100 text-yellow-700' },
    countered: { label: '🔄 Countered', bg: 'bg-blue-100 text-blue-700' },
    accepted:  { label: '✅ Accepted',  bg: 'bg-green-100 text-green-700' },
    rejected:  { label: '❌ Rejected',  bg: 'bg-red-100 text-red-700' }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-5xl animate-bounce">💰</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-gray-800 text-white py-8 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold">💰 Offers Overview</h1>
            <p className="text-gray-300 mt-1">Read-only view — admins don't act on individual offers</p>
          </div>
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="bg-gray-700 hover:bg-gray-600 text-white font-bold px-4 py-2 rounded-lg text-sm">
            ← Back to Dashboard
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Stats row */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-5 shadow-sm text-center">
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              <p className="text-gray-500 text-sm mt-1">Total Offers</p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm text-center">
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              <p className="text-gray-500 text-sm mt-1">Active Negotiations</p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm text-center">
              <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
              <p className="text-gray-500 text-sm mt-1">Accepted</p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm text-center">
              <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              <p className="text-gray-500 text-sm mt-1">Rejected</p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm text-center">
              <p className="text-2xl font-bold text-primary">{stats.avgDiscountPercent}%</p>
              <p className="text-gray-500 text-sm mt-1">Avg. Discount</p>
            </div>
          </div>
        )}

        {/* Offers table */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">All Offer Threads</h2>

          {offers.length === 0 ? (
            <p className="text-gray-400 text-center py-12">No offers yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-100">
                    <th className="py-2 pr-4">Product</th>
                    <th className="py-2 pr-4">Buyer</th>
                    <th className="py-2 pr-4">Seller</th>
                    <th className="py-2 pr-4">Asking</th>
                    <th className="py-2 pr-4">Offer</th>
                    <th className="py-2 pr-4">Counter</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {offers.map(offer => (
                    <tr key={offer._id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 pr-4 font-semibold text-gray-800">
                        {offer.product?.title || '—'}
                      </td>
                      <td className="py-3 pr-4 text-gray-600">
                        {offer.buyer?.fullName || '—'}
                      </td>
                      <td className="py-3 pr-4 text-gray-600">
                        {offer.seller?.fullName || '—'}
                      </td>
                      <td className="py-3 pr-4 text-gray-600">
                        Rs. {Number(offer.product?.price || 0).toLocaleString()}
                      </td>
                      <td className="py-3 pr-4 font-semibold text-green-600">
                        Rs. {Number(offer.offerPrice).toLocaleString()}
                      </td>
                      <td className="py-3 pr-4 text-blue-600">
                        {offer.counterPrice ? `Rs. ${Number(offer.counterPrice).toLocaleString()}` : '—'}
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${statusConfig[offer.status]?.bg}`}>
                          {statusConfig[offer.status]?.label}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-gray-400 text-xs">
                        {new Date(offer.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
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

export default AdminOffers;