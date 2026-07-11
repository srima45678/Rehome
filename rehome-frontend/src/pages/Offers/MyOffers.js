import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../utils/api';

function MyOffers() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const res = await API.get('/offers/my-offers');
      setOffers(res.data.offers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptCounter = async (offerId) => {
    if (!window.confirm('Accept this counter offer?')) return;
    try {
      await API.put(`/offers/${offerId}/accept-counter`);
      alert('✅ Counter offer accepted!');
      fetchOffers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    }
  };

  const statusConfig = {
    pending:   { label: '⏳ Pending',   bg: 'bg-yellow-100 text-yellow-700' },
    countered: { label: '🔄 Countered', bg: 'bg-blue-100 text-blue-700' },
    accepted:  { label: '✅ Accepted',  bg: 'bg-green-100 text-green-700' },
    rejected:  { label: '❌ Rejected',  bg: 'bg-red-100 text-red-700' }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-5xl animate-bounce">💰</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-primary">← Back</button>
          <h1 className="text-2xl font-bold text-gray-800">💰 My Offers</h1>
        </div>

        {offers.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center shadow-sm">
            <p className="text-5xl mb-4">📭</p>
            <p className="text-gray-500">You haven't made any offers yet</p>
            <Link to="/products" className="inline-block mt-4 text-primary font-semibold hover:underline">
              Browse listings →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {offers.map(offer => (
              <div key={offer._id} className="bg-white rounded-2xl shadow-sm p-5">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-orange-50 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {offer.product?.images?.[0]
                      ? <img src={offer.product.images[0]} alt="" className="w-full h-full object-cover" />
                      : <span className="text-2xl">📦</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-gray-800">{offer.product?.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${statusConfig[offer.status]?.bg}`}>
                        {statusConfig[offer.status]?.label}
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm mt-1">
                      Asking: Rs. {Number(offer.product?.price).toLocaleString()} •
                      Your offer: <span className="text-green-600 font-bold">Rs. {Number(offer.offerPrice).toLocaleString()}</span>
                    </p>
                    {offer.message && (
                      <p className="text-gray-400 text-xs mt-1">Your message: "{offer.message}"</p>
                    )}

                    {/* Counter offer details */}
                    {offer.status === 'countered' && (
                      <div className="mt-3 bg-blue-50 rounded-xl p-3">
                        <p className="text-blue-700 font-semibold text-sm">
                          🔄 Seller countered with: Rs. {Number(offer.counterPrice).toLocaleString()}
                        </p>
                        {offer.sellerMessage && (
                          <p className="text-blue-600 text-xs mt-1">"{offer.sellerMessage}"</p>
                        )}
                        <button
                          onClick={() => handleAcceptCounter(offer._id)}
                          className="mt-2 bg-blue-600 text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-blue-700">
                          ✅ Accept Counter Offer
                        </button>
                      </div>
                    )}

                    {offer.status === 'rejected' && offer.sellerMessage && (
                      <p className="text-red-500 text-xs mt-2">Seller: "{offer.sellerMessage}"</p>
                    )}

                    {offer.status === 'accepted' && (
                      <div className="mt-3">
                        <Link
                          to={`/checkout/${offer.product?._id}?offerPrice=${offer.offerPrice}`}
                          className="bg-primary text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-accent inline-block">
                          🛒 Proceed to Checkout
                        </Link>
                      </div>
                    )}

                    <p className="text-gray-400 text-xs mt-2">
                      {new Date(offer.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyOffers;