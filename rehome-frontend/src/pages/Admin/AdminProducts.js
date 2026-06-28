// AdminProducts.js
// Admin can view all products and delete inappropriate listings

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../utils/api';

function AdminProducts() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await API.get('/admin/products');
      setProducts(response.data.products);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId, title) => {
    if (!window.confirm(`Delete listing "${title}"?`)) return;
    try {
      await API.delete(`/admin/products/${productId}`);
      alert('✅ Product deleted');
      fetchProducts();
    } catch (error) {
      alert('Failed to delete product');
    }
  };

  const categoryEmoji = {
    sofa: '🛋️', chair: '🪑', table: '🪵', bed: '🛏️',
    wardrobe: '🚪', shelf: '📚', desk: '🖥️', other: '📦'
  };

  return (
    <div className="min-h-screen bg-secondary">

      {/* Header */}
      <div className="bg-gray-800 text-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold">📦 Manage Products</h1>
              <p className="text-gray-300 mt-1">
                Total: {products.length} listings
              </p>
            </div>
            <div className="flex gap-2">
              <Link to="/admin/dashboard"
                className="bg-gray-700 hover:bg-gray-600 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors">
                📊 Overview
              </Link>
              <Link to="/admin/users"
                className="bg-gray-700 hover:bg-gray-600 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors">
                👥 Users
              </Link>
              <Link to="/admin/products"
                className="bg-yellow-400 text-gray-800 font-bold px-4 py-2 rounded-lg text-sm">
                📦 Products
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {loading ? (
          <div className="text-center py-12">
            <p className="text-4xl animate-bounce">📦</p>
            <p className="text-gray-500 mt-2">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-2xl text-center py-12 shadow-sm">
            <p className="text-5xl mb-4">📭</p>
            <p className="text-gray-500">No products listed yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map(product => (
              <div key={product._id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">

                {/* Image */}
                <div className="bg-orange-50 h-40 flex items-center justify-center overflow-hidden">
                  {product.images && product.images.length > 0 ? (
                    <img src={product.images[0]} alt={product.title}
                      className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-5xl">
                      {categoryEmoji[product.category] || '📦'}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-gray-800 line-clamp-1">
                      {product.title}
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold flex-shrink-0
                      ${product.status === 'available'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-orange-100 text-orange-700'}`}>
                      {product.status}
                    </span>
                  </div>

                  <p className="text-primary font-bold text-lg mt-1">
                    Rs. {Number(product.price).toLocaleString()}
                  </p>

                  <p className="text-gray-500 text-sm mt-1">
                    👤 {product.seller?.fullName} • {product.seller?.email}
                  </p>

                  <p className="text-gray-400 text-xs mt-1">
                    📍 {product.city} • 👁️ {product.views} views
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2 mt-3">
                    <Link to={`/products/${product._id}`}
                      className="flex-1 bg-blue-50 text-blue-600 text-center py-2 rounded-lg text-sm font-semibold hover:bg-blue-100 transition-colors">
                      👁️ View
                    </Link>
                    <button
                      onClick={() => handleDelete(product._id, product.title)}
                      className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg text-sm font-semibold hover:bg-red-100 transition-colors">
                      🗑️ Delete
                    </button>
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

export default AdminProducts;