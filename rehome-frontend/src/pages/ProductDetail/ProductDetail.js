// ProductDetail.js
// Shows full details of a single product
// Includes real Cloudinary images, seller info,
// buy/contact buttons based on who is viewing,
// and working wishlist toggle

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../../utils/api';

function ProductDetail() {
  const { id } = useParams(); // gets product ID from URL
  const navigate = useNavigate();

  // Get logged in user from localStorage
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // selectedImage = which image is currently shown big
  const [selectedImage, setSelectedImage] = useState(0);

  // useEffect runs when page loads or ID changes
  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);

      // Get product details
      const response = await API.get(`/products/${id}`);
      setProduct(response.data.product);

      // Check if this product is in user's wishlist
      // Only check if user is logged in
      if (user) {
        try {
          const wishlistRes = await API.get('/wishlist');
          const isInWishlist = wishlistRes.data.wishlist.some(
            item => item._id === response.data.product._id
          );
          setIsWishlisted(isInWishlist);
        } catch (err) {
          console.log('Could not check wishlist');
        }
      }

    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  // Condition display helpers
  const conditionLabels = {
    like_new: '✨ Like New',
    good: '👍 Good',
    fair: '👌 Fair',
    poor: '⚠️ Poor'
  };

  const conditionColors = {
    like_new: 'bg-green-100 text-green-700',
    good: 'bg-blue-100 text-blue-700',
    fair: 'bg-yellow-100 text-yellow-700',
    poor: 'bg-red-100 text-red-700'
  };

  // Category emoji fallback when no image
  const categoryEmoji = {
    sofa: '🛋️',
    chair: '🪑',
    table: '🪵',
    bed: '🛏️',
    wardrobe: '🚪',
    shelf: '📚',
    desk: '🖥️',
    other: '📦'
  };

  // ── LOADING STATE ──
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <div className="text-center">
          <p className="text-5xl animate-bounce">🛋️</p>
          <p className="text-gray-500 mt-3 text-lg">Loading product...</p>
        </div>
      </div>
    );
  }

  // ── NOT FOUND STATE ──
  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <div className="text-center">
          <p className="text-6xl mb-4">😕</p>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">
            Product not found
          </h2>
          <p className="text-gray-500 mb-6">
            This listing may have been removed
          </p>
          <Link to="/products"
            className="bg-primary text-white px-6 py-3 rounded-xl hover:bg-accent transition-colors">
            ← Back to Browse
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary py-8 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-primary mb-6 transition-colors font-medium">
          ← Back to listings
        </button>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* ════════════════════════════
              LEFT SIDE — Images
          ════════════════════════════ */}
          <div>

            {/* Main large image */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[selectedImage]}
                  alt={product.title}
                  className="w-full h-80 object-cover"
                />
              ) : (
                // Fallback emoji if no image uploaded
                <div className="bg-orange-50 h-80 flex items-center justify-center text-9xl">
                  {categoryEmoji[product.category] || '📦'}
                </div>
              )}
            </div>

            {/* Thumbnail images — show if more than 1 image */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 mt-3 flex-wrap">
                {product.images.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`View ${index + 1}`}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-20 object-cover rounded-xl cursor-pointer transition-all
                      ${selectedImage === index
                        ? 'border-3 border-primary ring-2 ring-primary ring-offset-1'
                        : 'border-2 border-gray-200 hover:border-primary opacity-70 hover:opacity-100'
                      }`}
                  />
                ))}
              </div>
            )}

            {/* Product Stats Row */}
            <div className="grid grid-cols-3 gap-3 mt-4">

              <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                <p className="text-2xl font-bold text-blue-600">
                  {product.views}
                </p>
                <p className="text-gray-500 text-xs mt-1">Views</p>
              </div>

              {/* <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                <p className="text-2xl font-bold text-red-500">
                  {product.likes?.length || 0}
                </p>
                <p className="text-gray-500 text-xs mt-1">Likes</p>
              </div> */}

              <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                <p className="text-2xl font-bold text-green-600">
                  {product.status === 'available' ? '✅' : '❌'}
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  {product.status === 'available' ? 'Available' : 'Sold'}
                </p>
              </div>

            </div>
          </div>

          {/* ════════════════════════════
              RIGHT SIDE — Product Details
          ════════════════════════════ */}
          <div>
            <div className="bg-white rounded-2xl p-6 shadow-sm">

              {/* Condition badge */}
              <span className={`text-sm font-semibold px-3 py-1 rounded-full ${conditionColors[product.condition]}`}>
                {conditionLabels[product.condition]}
              </span>

              {/* Product Title */}
              <h1 className="text-2xl font-bold text-gray-800 mt-3 leading-tight">
                {product.title}
              </h1>

              {/* Price Section */}
              <div className="flex items-end gap-3 mt-4">
                <p className="text-3xl font-bold text-primary">
                  Rs. {Number(product.price).toLocaleString()}
                </p>
                {product.originalPrice > 0 && (
                  <div className="pb-1">
                    <p className="text-gray-400 line-through text-sm">
                      Rs. {Number(product.originalPrice).toLocaleString()}
                    </p>
                    <p className="text-green-600 text-sm font-bold">
                      Save Rs. {(product.originalPrice - product.price).toLocaleString()}!
                    </p>
                  </div>
                )}
              </div>

              {/* Location */}
              <div className="flex items-center gap-2 mt-4 text-gray-600">
                <span className="text-lg">📍</span>
                <span className="font-medium">
                  {product.city}
                  {product.address ? `, ${product.address}` : ''}
                </span>
              </div>

              {/* Category */}
              <div className="flex items-center gap-2 mt-2 text-gray-600">
                <span className="text-lg">🏷️</span>
                <span className="capitalize">{product.category}</span>
              </div>

              {/* Date listed */}
              <div className="flex items-center gap-2 mt-2 text-gray-400 text-sm">
                <span>🕐</span>
                <span>
                  Listed on {new Date(product.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>

              {/* Divider */}
              <hr className="my-5 border-gray-100" />

              {/* Description */}
              <div>
                <h3 className="font-bold text-gray-800 mb-2 text-lg">
                  📝 Description
                </h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>

              {/* Divider */}
              <hr className="my-5 border-gray-100" />

              {/* Seller Info Card */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-bold text-gray-800 mb-3">
                  🧑 Seller Info
                </h3>
                {product.seller ? (
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                      {product.seller?.fullName?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">
                        {product.seller?.fullName || 'Unknown Seller'}
                      </p>
                      <p className="text-gray-500 text-sm">
                        📍 {product.seller?.city || 'Unknown location'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">
                    ⚠️ Seller account no longer available
                  </p>
                )}
              </div>

              {/* ── ACTION BUTTONS ──
                  Shows different buttons based on who is viewing:
                  1. Not logged in → show login prompt
                  2. Own product → show delete/dashboard
                  3. Other's product → show buy/chat/wishlist
              */}
              <div className="mt-6 space-y-3">

                {/* CASE 1 — Not logged in */}
                {!user ? (
                  <div className="text-center bg-orange-50 border border-orange-200 rounded-xl p-5">
                    <p className="text-orange-700 font-medium mb-3">
                      🔒 Login to contact seller or buy this item
                    </p>
                    <Link to="/login"
                      className="bg-primary text-white px-8 py-2.5 rounded-lg hover:bg-accent transition-colors inline-block font-semibold">
                      Login Now
                    </Link>
                  </div>

                ) : product.seller?._id === user.id ? (

                  /* CASE 2 — This is seller's own product */
                  <div>
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-3 text-center">
                      <p className="text-blue-600 text-sm font-medium">
                        ℹ️ This is your listing
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={async () => {
                          if (window.confirm('Delete this listing?')) {
                            try {
                              await API.delete(`/products/${product._id}`);
                              alert('✅ Product deleted!');
                              navigate('/seller/dashboard');
                            } catch (err) {
                              alert('Failed to delete');
                            }
                          }
                        }}
                        className="flex-1 border-2 border-red-300 text-red-600 font-bold py-3 rounded-xl hover:bg-red-50 transition-all">
                        🗑️ Delete Listing
                      </button>
                      <Link to="/seller/dashboard"
                        className="flex-1 bg-primary text-white font-bold py-3 rounded-xl text-center hover:bg-accent transition-all">
                        📊 My Dashboard
                      </Link>
                    </div>
                  </div>

                ) : (

                  /* CASE 3 — Another user viewing */
                  <div className="space-y-3">

                    {/* Buy Now button */}
                    <button
                      onClick={() => navigate(`/checkout/${product._id}`)}
                      disabled={product.status !== 'available'}
                      className="w-full bg-primary hover:bg-accent text-white font-bold py-4 rounded-xl transition-all text-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                      {product.status === 'available'
                        ? '🛒 Buy Now'
                        : '❌ Already Sold'}
                    </button>

{/* Chat with seller */}
<button
  onClick={async () => {
    try {
      const response = await API.post('/chat/room', {
        productId: product._id
      });
      navigate(`/chat/${response.data.chat._id}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Could not open chat');
    }
  }}
  className="w-full border-2 border-primary text-primary font-bold py-3 rounded-xl hover:bg-orange-50 transition-all">
  💬 Chat with Seller
</button>

                    {/* Wishlist */}
                    <button
                      onClick={async () => {
                        try {
                          const res = await API.post(`/wishlist/${product._id}`);
                          setIsWishlisted(res.data.added);
                        } catch (err) {
                          alert('Please login to use wishlist');
                        }
                      }}
                      className={`w-full border-2 font-bold py-3 rounded-xl transition-all
                        ${isWishlisted
                          ? 'border-red-300 bg-red-50 text-red-600'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                      {isWishlisted ? '❤️ In Wishlist' : '🤍 Add to Wishlist'}
                    </button>

                  </div>
                )}

              </div>
            </div>
          </div>
        </div>

        {/* Safety Tips */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mt-8">
          <h3 className="font-bold text-yellow-800 text-lg mb-3">
            ⚠️ Safety Tips
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[
              'Always meet in a public place for the first time',
              'Inspect the furniture carefully before paying',
              'Use ReHome secure payment for protection',
              'Never send money before seeing the item',
              'Take photos of the item when you receive it',
              'Report suspicious sellers to our support team'
            ].map((tip, i) => (
              <p key={i} className="text-yellow-700 text-sm flex items-start gap-2">
                <span>•</span>
                <span>{tip}</span>
              </p>
            ))}
          </div>
        </div>

        {/* Similar Products placeholder */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            🛋️ Similar Products
          </h2>
          <div className="bg-white rounded-2xl p-8 text-center text-gray-400 shadow-sm">
            <p className="text-4xl mb-2">🔍</p>
            <p>Similar product recommendations coming soon!</p>
            <Link to="/products"
              className="inline-block mt-3 text-primary font-semibold hover:underline">
              Browse all products →
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

export default ProductDetail;