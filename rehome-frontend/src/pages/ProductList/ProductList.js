// ProductList.js
// Shows all available furniture listings
// With search and filter functionality

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../utils/api';

function ProductList() {

  // products = array of all products from database
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    city: '',
    condition: '',
    minPrice: '',
    maxPrice: ''
  });

  // Fetch products from backend when page loads
  // useEffect = runs code when component loads
  // Like constructor in Java
  useEffect(() => {
    fetchProducts();
  }, []); // [] = run only once when page loads

  const fetchProducts = async (filterParams = {}) => {
    try {
      setLoading(true);

      // Build query string from filters
      // Example: ?category=sofa&city=Kathmandu
      const params = new URLSearchParams(filterParams).toString();
      const response = await API.get(`/products?${params}`);

      setProducts(response.data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // When user changes any filter
  const handleFilterChange = (e) => {
    const newFilters = { ...filters, [e.target.name]: e.target.value };
    setFilters(newFilters);

    // Remove empty filters before sending
    const cleanFilters = Object.fromEntries(
      Object.entries(newFilters).filter(([_, v]) => v !== '')
    );
    fetchProducts(cleanFilters);
  };

  // Condition display helper
  const conditionColors = {
    like_new: 'bg-green-100 text-green-700',
    good: 'bg-blue-100 text-blue-700',
    fair: 'bg-yellow-100 text-yellow-700',
    poor: 'bg-red-100 text-red-700'
  };

  const conditionLabels = {
    like_new: 'Like New',
    good: 'Good',
    fair: 'Fair',
    poor: 'Poor'
  };

  return (
    <div className="min-h-screen bg-secondary">

      {/* Page Header */}
      <div className="bg-primary text-white py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">
            🛋️ Browse Furniture
          </h1>

          {/* Search bar */}
          <div className="flex gap-3 max-w-2xl">
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search sofa, chair, table..."
              className="flex-1 px-5 py-3 rounded-xl text-gray-800 outline-none"
            />
            <button className="bg-yellow-400 text-gray-800 font-bold px-6 py-3 rounded-xl">
              🔍 Search
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── LEFT SIDEBAR — Filters ── */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
              <h3 className="font-bold text-gray-800 text-lg mb-4">
                🔧 Filters
              </h3>

              {/* Category filter */}
              <div className="mb-4">
                <label className="block text-gray-600 font-medium mb-2 text-sm">
                  Category
                </label>
                <select
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-primary text-sm bg-white">
                  <option value="">All Categories</option>
                  <option value="sofa">🛋️ Sofa</option>
                  <option value="chair">🪑 Chair</option>
                  <option value="table">🪵 Table</option>
                  <option value="bed">🛏️ Bed</option>
                  <option value="wardrobe">🚪 Wardrobe</option>
                  <option value="shelf">📚 Shelf</option>
                  <option value="desk">🖥️ Desk</option>
                  <option value="other">📦 Other</option>
                </select>
              </div>

              {/* City filter */}
              <div className="mb-4">
                <label className="block text-gray-600 font-medium mb-2 text-sm">
                  City
                </label>
                <select
                  name="city"
                  value={filters.city}
                  onChange={handleFilterChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-primary text-sm bg-white">
                  <option value="">All Cities</option>
                  {["Kathmandu", "Lalitpur", "Bhaktapur",
                    "Pokhara", "Chitwan", "Biratnagar"].map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              {/* Condition filter */}
              <div className="mb-4">
                <label className="block text-gray-600 font-medium mb-2 text-sm">
                  Condition
                </label>
                <select
                  name="condition"
                  value={filters.condition}
                  onChange={handleFilterChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-primary text-sm bg-white">
                  <option value="">Any Condition</option>
                  <option value="like_new">✨ Like New</option>
                  <option value="good">👍 Good</option>
                  <option value="fair">👌 Fair</option>
                  <option value="poor">⚠️ Poor</option>
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-4">
                <label className="block text-gray-600 font-medium mb-2 text-sm">
                  Price Range (Rs.)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    name="minPrice"
                    value={filters.minPrice}
                    onChange={handleFilterChange}
                    placeholder="Min"
                    className="w-1/2 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-primary text-sm"
                  />
                  <input
                    type="number"
                    name="maxPrice"
                    value={filters.maxPrice}
                    onChange={handleFilterChange}
                    placeholder="Max"
                    className="w-1/2 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-primary text-sm"
                  />
                </div>
              </div>

              {/* Clear filters button */}
              <button
                onClick={() => {
                  setFilters({
                    search: '', category: '', city: '',
                    condition: '', minPrice: '', maxPrice: ''
                  });
                  fetchProducts();
                }}
                className="w-full border border-gray-200 text-gray-600 py-2 rounded-lg hover:bg-gray-50 text-sm transition-all">
                Clear All Filters
              </button>

            </div>
          </div>

          {/* ── RIGHT SIDE — Product Grid ── */}
          <div className="flex-1">

            {/* Results count */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-600">
                <span className="font-bold text-gray-800">{products.length}</span> products found
              </p>
              <Link to="/sell"
                className="bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-accent transition-colors">
                + List Your Furniture
              </Link>
            </div>

            {/* Loading state */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <p className="text-4xl mb-4 animate-bounce">🛋️</p>
                  <p className="text-gray-500">Loading products...</p>
                </div>
              </div>
            ) : products.length === 0 ? (
              /* Empty state */
              <div className="text-center py-20 bg-white rounded-2xl">
                <p className="text-5xl mb-4">🔍</p>
                <h3 className="text-xl font-bold text-gray-700 mb-2">
                  No products found
                </h3>
                <p className="text-gray-500">
                  Try different filters or be the first to list!
                </p>
                <Link to="/sell"
                  className="inline-block mt-4 bg-primary text-white px-6 py-3 rounded-xl hover:bg-accent transition-colors">
                  List Your Furniture
                </Link>
              </div>
            ) : (
              /* Product Grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {products.map(product => (
                  <Link
                    key={product._id}
                    to={`/products/${product._id}`}
                    className="bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-all cursor-pointer border border-gray-100 group">

                    {/* Product Image */}
                      <div className="bg-orange-50 h-48 flex items-center justify-center text-6xl group-hover:bg-orange-100 transition-colors overflow-hidden">
                      {product.images && product.images.length > 0 ? (
                      <img
                       src={product.images[0]}
                       alt={product.title}
                        className="w-full h-full object-cover"
                       />
                       ) : (
    <span className="text-6xl">
      {product.category === 'sofa' ? '🛋️' :
       product.category === 'chair' ? '🪑' :
       product.category === 'table' ? '🪵' :
       product.category === 'bed' ? '🛏️' :
       product.category === 'wardrobe' ? '🚪' :
       product.category === 'shelf' ? '📚' : '📦'}
    </span>
  )}
</div>

                    {/* Product Info */}
                    <div className="p-4">

                      {/* Condition badge */}
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${conditionColors[product.condition]}`}>
                        {conditionLabels[product.condition]}
                      </span>

                      {/* Title */}
                      <h3 className="font-bold text-gray-800 mt-2 text-base line-clamp-2">
                        {product.title}
                      </h3>

                      {/* Price */}
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-primary font-bold text-lg">
                          Rs. {Number(product.price).toLocaleString()}
                        </p>
                        {product.originalPrice > 0 && (
                          <p className="text-gray-400 text-sm line-through">
                            Rs. {Number(product.originalPrice).toLocaleString()}
                          </p>
                        )}
                      </div>

                      {/* Location and views */}
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-gray-500 text-sm">
                          📍 {product.city}
                        </p>
                        <p className="text-gray-400 text-xs">
                          👁️ {product.views} views
                        </p>
                      </div>

                      {/* Seller */}
                      <p className="text-gray-400 text-xs mt-1">
                        🧑 {product.seller?.fullName}
                      </p>

                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductList;