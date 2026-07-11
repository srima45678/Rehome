import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../utils/api';

function SellerOfferManager() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [counterInputs, setCounterInputs] = useState({});
  const [counterMessages, setCounterMessages] = useState({});

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const res = await API.get('/offers/incoming');
      setOffers(res.data.offers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (offerId, action) => {
    try {
      const body = { action };
      if (action === 'counter') {
        if (!counterInputs[offerId]) return alert('Enter a counter price');
        body.counterPrice = Number(counterInputs[offerId]);
        body.sellerMessage = counterMessages[offerId] || '';
      }
      if (action === 'reject') {
        body.sellerMessage = counterMessages[offerId] || '';
      }
      await API.put(`/offers/${offerId}/respond`, body);
      alert(`Offer ${action}ed successfully!`);
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
          <h1 className="text-2xl font-bold text-gray-800">💰 Incoming Offers</h1>
        </div>

        {offers.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center shadow-sm">
            <p className="text-5xl mb-4">📭</p>
            <p className="text-gray-500">No offers received yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {offers.map(offer => (
              <div key={offer._id} className="bg-white rounded-2xl shadow-sm p-5">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 bg-orange-50 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {offer.product?.images?.[0]
                      ? <img src={offer.product.images[0]} alt="" className="w-full h-full object-cover" />
                      : <span className="text-2xl">📦</span>}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-gray-800">{offer.product?.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${statusConfig[offer.status]?.bg}`}>
                        {statusConfig[offer.status]?.label}
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm mt-1">
                      Your price: Rs. {Number(offer.product?.price).toLocaleString()} •
                      Offer: <span className="text-green-600 font-bold">Rs. {Number(offer.offerPrice).toLocaleString()}</span>
                    </p>
                    <p className="text-gray-500 text-sm">
                      From: <span className="font-semibold">{offer.buyer?.fullName}</span> • {offer.buyer?.city}
                    </p>
                    {offer.message && (
                      <p className="text-gray-400 text-xs mt-1">"{offer.message}"</p>
                    )}
                  </div>
                </div>

                {/* Action buttons — only show for pending offers */}
                {offer.status === 'pending' && (
                  <div className="space-y-3">
                    {/* Counter offer input */}
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Counter with a different price:</p>
                      <input
                        type="number"
                        placeholder="Counter price (Rs.)"
                        value={counterInputs[offer._id] || ''}
                        onChange={e => setCounterInputs(p => ({ ...p, [offer._id]: e.target.value }))}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-2"
                      />
                      <input
                        type="text"
                        placeholder="Message to buyer (optional)"
                        value={counterMessages[offer._id] || ''}
                        onChange={e => setCounterMessages(p => ({ ...p, [offer._id]: e.target.value }))}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRespond(offer._id, 'accept')}
                        className="flex-1 bg-green-500 text-white font-bold py-2.5 rounded-xl hover:bg-green-600 text-sm">
                        ✅ Accept
                      </button>
                      <button
                        onClick={() => handleRespond(offer._id, 'counter')}
                        className="flex-1 bg-blue-500 text-white font-bold py-2.5 rounded-xl hover:bg-blue-600 text-sm">
                        🔄 Counter
                      </button>
                      <button
                        onClick={() => handleRespond(offer._id, 'reject')}
                        className="flex-1 bg-red-100 text-red-600 font-bold py-2.5 rounded-xl hover:bg-red-200 text-sm">
                        ❌ Reject
                      </button>
                    </div>
                  </div>
                )}

                {offer.status === 'countered' && (
                  <div className="bg-blue-50 rounded-xl p-3">
                    <p className="text-blue-700 text-sm font-semibold">
                      🔄 You countered with Rs. {Number(offer.counterPrice).toLocaleString()} — waiting for buyer response
                    </p>
                  </div>
                )}

                <p className="text-gray-400 text-xs mt-3">
                  {new Date(offer.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SellerOfferManager;