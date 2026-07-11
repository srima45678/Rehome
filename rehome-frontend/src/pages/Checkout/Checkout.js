// Checkout.js
// Buyer fills delivery details and places order

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import API from '../../utils/api';

function Checkout() {
  const { productId } = useParams();
  const [searchParams] = useSearchParams();
  const offerPriceParam = searchParams.get('offerPrice');
  const finalPrice = offerPriceParam ? Number(offerPriceParam) : null; // null means "use normal price"
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const displayPrice = finalPrice ?? product?.price ?? 0;

  const [formData, setFormData] = useState({
    deliveryAddress: '',
    deliveryCity: user?.city || '',
    contactPhone: '',
    paymentMethod: 'cash_on_delivery'
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchProduct();
  }, []);

  const fetchProduct = async () => {
    try {
      const response = await API.get(`/products/${productId}`);
      setProduct(response.data.product);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    // Validate phone number
    if (formData.contactPhone.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      setSubmitting(false);
      return;
    }

    try {
      await API.post('/orders', {
        productId,
        deliveryAddress: formData.deliveryAddress,
        deliveryCity: formData.deliveryCity,
        contactPhone: formData.contactPhone,
        paymentMethod: formData.paymentMethod,
        offerPrice: finalPrice
      });

      alert('🎉 Order placed successfully!');
      navigate('/orders');

    } catch (error) {
      setError(error.response?.data?.message || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  const categoryEmoji = {
    sofa: '🛋️', chair: '🪑', table: '🪵', bed: '🛏️',
    wardrobe: '🚪', shelf: '📚', desk: '🖥️', other: '📦'
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <p className="text-5xl animate-bounce">🛒</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <div className="text-center">
          <p className="text-5xl mb-4">😕</p>
          <p className="text-gray-600">Product not found</p>
          <Link to="/products" className="text-primary font-bold hover:underline">
            Back to Browse
          </Link>
        </div>
      </div>
    );
  }

  if (product.status !== 'available') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary px-4">
        <div className="bg-white rounded-2xl p-8 text-center max-w-md">
          <p className="text-5xl mb-4">❌</p>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            This product is no longer available
          </h2>
          <p className="text-gray-500 mb-4">
            It may have already been purchased by someone else.
          </p>
          <Link to="/products"
            className="bg-primary text-white px-6 py-3 rounded-xl hover:bg-accent transition-colors inline-block">
            Browse Other Items
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary py-8 px-4">
      <div className="max-w-4xl mx-auto">

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-primary mb-6 transition-colors font-medium">
          ← Back
        </button>

        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          🛒 Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* LEFT — Delivery Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                📍 Delivery Details
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Delivery Address *
                  </label>
                  <input
                    type="text"
                    name="deliveryAddress"
                    value={formData.deliveryAddress}
                    onChange={handleChange}
                    placeholder="House no, street, area"
                    required
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-orange-100 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    City *
                  </label>
                  <select
                    name="deliveryCity"
                    value={formData.deliveryCity}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-orange-100 transition-all bg-white">
                    <option value="">Select city</option>
                    {["Kathmandu", "Lalitpur", "Bhaktapur", "Pokhara",
                      "Chitwan", "Biratnagar", "Butwal", "Dharan"].map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Contact Phone *
                  </label>
                  <input
                    type="tel"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={(e) => {
                      // Only allow digits, remove any other characters
                      const numbersOnly = e.target.value.replace(/[^0-9]/g, '');
                      setFormData({ ...formData, contactPhone: numbersOnly });
                      setError('');
                    }}
                    placeholder="98XXXXXXXX"
                    required
                    maxLength={10}
                    inputMode="numeric"
                    pattern="[0-9]{10}"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-orange-100 transition-all"
                  />
                  {formData.contactPhone && formData.contactPhone.length !== 10 && (
                    <p className="text-red-500 text-xs mt-1">
                      Phone number must be 10 digits
                    </p>
                  )}
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Payment Method *
                  </label>
                  <div className="grid grid-cols-1 gap-3">

                    <label className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all
                      ${formData.paymentMethod === 'cash_on_delivery'
                        ? 'border-primary bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cash_on_delivery"
                        checked={formData.paymentMethod === 'cash_on_delivery'}
                        onChange={handleChange}
                        className="w-4 h-4 text-primary"
                      />
                      <div>
                        <p className="font-bold text-gray-800">💵 Cash on Delivery</p>
                        <p className="text-gray-500 text-sm">Pay when you receive the item</p>
                      </div>
                    </label>

                    <label className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all opacity-50
                      ${formData.paymentMethod === 'online'
                        ? 'border-primary bg-orange-50'
                        : 'border-gray-200'}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="online"
                        disabled
                        className="w-4 h-4"
                      />
                      <div>
                        <p className="font-bold text-gray-800">💳 Online Payment</p>
                        <p className="text-gray-500 text-sm">Coming soon!</p>
                      </div>
                    </label>

                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
                    ⚠️ {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-primary hover:bg-accent text-white font-bold py-4 rounded-xl transition-all text-lg disabled:opacity-50">
                  {submitting ? '⏳ Placing Order...' : '✅ Place Order'}
                </button>

              </form>
            </div>
          </div>

          {/* RIGHT — Order Summary */}
          <div>
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                📋 Order Summary
              </h2>

              {/* Product preview */}
              <div className="flex gap-3 pb-4 border-b border-gray-100">
                <div className="w-16 h-16 bg-orange-50 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                  {product.images && product.images.length > 0 ? (
                    <img src={product.images[0]} alt={product.title}
                      className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl">
                      {categoryEmoji[product.category] || '📦'}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800 text-sm line-clamp-2">
                    {product.title}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    Sold by {product.seller?.fullName}
                  </p>
                </div>
              </div>

              {/* Price breakdown */}
              <div className="space-y-2 mt-4 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Item Price</span>
                  <span>
                    {finalPrice ? (
                      <>
                        <span className="line-through text-gray-400 mr-2">
                          Rs. {Number(product.price).toLocaleString()}
                        </span>
                        Rs. {Number(finalPrice).toLocaleString()}
                      </>
                    ) : (
                      `Rs. ${Number(product.price).toLocaleString()}`
                    )}
                  </span>
                </div>
                {finalPrice && (
                  <div className="flex justify-between text-green-600 text-xs font-semibold">
                    <span>✅ Accepted offer price applied</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span className="text-green-600 font-semibold">FREE</span>
                </div>
              </div>

              <hr className="my-3 border-gray-100" />

              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-800">Total</span>
                <span className="font-bold text-primary text-xl">
                  Rs. {Number(displayPrice).toLocaleString()}
                </span>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mt-4">
                <p className="text-blue-700 text-xs">
                  ℹ️ Once you place this order, the seller will be notified to confirm and arrange delivery.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Checkout;