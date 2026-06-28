// Wishlist.js
// Shows all products the buyer has saved

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../utils/api';

function Wishlist() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchWishlist();
    // eslint-disable-next-line
  }, []);

  const fetchWishlist = async () => {
    try {
      const response = await API.get('/wishlist');
      setWishlist(response.data.wishlist);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId) => {
    try {
      await API.post(`/wishlist/${productId}`);
      setWishlist(wishlist.filter(item => item._id !== productId));
    } catch (error) {
      alert('Failed to update wishlist');
    }
  };

  const categoryEmoji = {
    sofa: '🛋️', chair: '🪑', table: '🪵', bed: '🛏️',
    wardrobe: '🚪', shelf: '📚', desk: '🖥️', other: '📦'
  };

  return (
    <div className="min-h-screen bg-secondary py-8 px-4">
      <div className="max-w-6xl mx-auto">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            ❤️ My Wishlist
          </h1>
          <p className="text-gray-500 mt-2">
            Items you've saved for later
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <p className="text-5xl animate-bounce">❤️</p>
            <p className="text-gray-500 mt-3">Loading wishlist...</p>
          </div>
        ) : wishlist.length === 0 ? (
          <div className="bg-white rounded-2xl text-center py-16 shadow-sm">
            <p className="text-6xl mb-4">💔</p>
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              Your wishlist is empty
            </h3>
            <p className="text-gray-500 mb-6">
              Start browsing and save items you love!
            </p>
            <Link to="/products"
              className="bg-primary text-white px-6 py-3 rounded-xl hover:bg-accent transition-colors inline-block">
              Browse Furniture
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {wishlist.map(product => (
              <div key={product._id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 group">

                <Link to={`/products/${product._id}`}>
                  <div className="bg-orange-50 h-48 flex items-center justify-center overflow-hidden">
                    {product.images && product.images.length > 0 ? (
                      <img src={product.images[0]} alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <span className="text-6xl">
                        {categoryEmoji[product.category] || '📦'}
                      </span>
                    )}
                  </div>
                </Link>

                <div className="p-4">
                  <Link to={`/products/${product._id}`}>
                    <h3 className="font-bold text-gray-800 text-base line-clamp-2 hover:text-primary transition-colors">
                      {product.title}
                    </h3>
                  </Link>

                  <p className="text-primary font-bold text-lg mt-1">
                    Rs. {Number(product.price).toLocaleString()}
                  </p>

                  <div className="flex items-center justify-between mt-2">
                    <p className="text-gray-500 text-sm">
                      📍 {product.city}
                    </p>
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold
                      ${product.status === 'available'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-orange-100 text-orange-700'}`}>
                      {product.status === 'available' ? '🟢 Available' : '🔴 ' + product.status}
                    </span>
                  </div>

                  <p className="text-gray-400 text-xs mt-1">
                    🧑 {product.seller?.fullName}
                  </p>

                  <button
                    onClick={() => handleRemove(product._id)}
                    className="w-full mt-3 border-2 border-red-200 text-red-600 font-semibold py-2 rounded-lg hover:bg-red-50 transition-colors text-sm">
                    💔 Remove from Wishlist
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

export default Wishlist;