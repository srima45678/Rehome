// Home.js
// Dynamic homepage with:
// - Real products from database in Featured Listings
// - Real stats from database
// - Role-based personalized sections

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../utils/api';

function Home() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalUsers: 0,
    totalSellers: 0,
    totalCities: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Seller-specific state
  const [myProducts, setMyProducts] = useState([]);
  const [sellerStats, setSellerStats] = useState({
    totalListings: 0,
    totalViews: 0,
    available: 0
  });

  // Buyer-specific state
  const [wishlistCount, setWishlistCount] = useState(0);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    fetchHomeData();
    // eslint-disable-next-line
  }, []);

  const fetchHomeData = async () => {
    try {
      // Always fetch featured products (visible to everyone)
      const productsRes = await API.get('/products?limit=8');
      setFeaturedProducts(productsRes.data.products.slice(0, 8));

      // Try to get platform stats from admin endpoint
      // If not admin, we estimate from products
      const totalProducts = productsRes.data.count || productsRes.data.products.length;
      setStats({
        totalProducts: totalProducts || 0,
        totalUsers: 850,   // keep as marketing number
        totalSellers: 300, // keep as marketing number
        totalCities: 15    // keep as marketing number
      });

      // Fetch role-specific data if logged in
      if (user) {
        if (user.role === 'seller') {
          const [myProductsRes, ordersRes] = await Promise.all([
            API.get('/products/seller/my-products'),
            API.get('/orders/seller-orders')
          ]);
          const myProds = myProductsRes.data.products;
          setMyProducts(myProds.slice(0, 3));
          setSellerStats({
            totalListings: myProds.length,
            totalViews: myProds.reduce((sum, p) => sum + p.views, 0),
            available: myProds.filter(p => p.status === 'available').length,
            pendingOrders: ordersRes.data.orders.filter(o => o.status === 'pending').length
          });
        } else if (user.role === 'buyer') {
          const [wishlistRes, ordersRes] = await Promise.all([
            API.get('/wishlist'),
            API.get('/orders/my-orders')
          ]);
          setWishlistCount(wishlistRes.data.count || 0);
          setRecentOrders(ordersRes.data.orders.slice(0, 2));
        }
      }
    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/products');
    }
  };

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

  const categoryEmoji = {
    sofa: '🛋️', chair: '🪑', table: '🪵', bed: '🛏️',
    wardrobe: '🚪', shelf: '📚', desk: '🖥️', other: '📦'
  };

  const categories = [
    { name: 'Sofa', emoji: '🛋️', value: 'sofa' },
    { name: 'Chair', emoji: '🪑', value: 'chair' },
    { name: 'Table', emoji: '🪵', value: 'table' },
    { name: 'Bed', emoji: '🛏️', value: 'bed' },
    { name: 'Wardrobe', emoji: '🚪', value: 'wardrobe' },
    { name: 'Shelf', emoji: '📚', value: 'shelf' },
  ];

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    shipped: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700'
  };

  return (
    <div className="min-h-screen">

      {/* ════════════════════════════
          HERO SECTION
          Changes based on role
      ════════════════════════════ */}

      {/* Visitor/Buyer Hero */}
      {(!user || user.role === 'buyer') && (
        <div className="bg-primary text-white py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">

            {/* Personalized greeting for buyer */}
            {user && user.role === 'buyer' && (
              <p className="text-orange-200 font-medium mb-2">
                👋 Welcome back, {user.fullName.split(' ')[0]}!
              </p>
            )}

            <h1 className="text-4xl md:text-5xl font-bold mb-3">
              Give Furniture a{' '}
              <span className="text-yellow-400">Second Life</span> 🏡
            </h1>
            <p className="text-orange-200 text-lg mb-8">
              Buy and sell quality second-hand furniture in Nepal
            </p>

            {/* Search bar */}
            <form onSubmit={handleSearch}
              className="flex gap-3 max-w-2xl mx-auto mb-6">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for sofa, chair, table..."
                className="flex-1 px-5 py-3.5 rounded-xl text-gray-800 outline-none text-base"
              />
              <button
                type="submit"
                className="bg-yellow-400 hover:bg-yellow-300 text-gray-800 font-bold px-6 py-3.5 rounded-xl transition-colors">
                🔍 Search
              </button>
            </form>

            {/* Popular tags */}
            <div className="flex flex-wrap justify-center gap-2">
              <span className="text-orange-200 text-sm">Popular:</span>
              {['Sofa', 'Bed', 'Dining Table', 'Office Chair'].map(tag => (
                <button
                  key={tag}
                  onClick={() => navigate(`/products?search=${tag}`)}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white text-sm px-3 py-1 rounded-full transition-colors">
                  {tag}
                </button>
              ))}
            </div>

            {/* Buyer quick actions */}
            {user && user.role === 'buyer' && (
              <div className="flex gap-3 justify-center mt-6 flex-wrap">
                <Link to="/wishlist"
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-5 py-2 rounded-xl font-semibold text-sm transition-colors">
                  ❤️ Wishlist ({wishlistCount})
                </Link>
                <Link to="/orders"
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-5 py-2 rounded-xl font-semibold text-sm transition-colors">
                  📦 My Orders
                </Link>
                <Link to="/chat"
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-5 py-2 rounded-xl font-semibold text-sm transition-colors">
                  💬 Chats
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Seller Hero */}
      {user && user.role === 'seller' && (
        <div className="bg-primary text-white py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-orange-200 text-sm font-medium mb-1">
                  🏷️ Seller Dashboard
                </p>
                <h1 className="text-3xl font-bold">
                  Welcome back, {user.fullName.split(' ')[0]}! 👋
                </h1>
                <p className="text-orange-200 mt-1">
                  Manage your listings and grow your business
                </p>
              </div>
              <div className="flex gap-3 flex-wrap">
                <Link to="/sell"
                  className="bg-yellow-400 hover:bg-yellow-300 text-gray-800 font-bold px-5 py-2.5 rounded-xl transition-colors">
                  + Add New Listing
                </Link>
                <Link to="/seller/orders"
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors">
                  📬 Orders
                  {sellerStats.pendingOrders > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                      {sellerStats.pendingOrders}
                    </span>
                  )}
                </Link>
              </div>
            </div>

            {/* Seller quick stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-white bg-opacity-15 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold">{sellerStats.totalListings}</p>
                <p className="text-orange-200 text-sm">Total Listings</p>
              </div>
              <div className="bg-white bg-opacity-15 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold">{sellerStats.totalViews}</p>
                <p className="text-orange-200 text-sm">Total Views</p>
              </div>
              <div className="bg-white bg-opacity-15 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold">{sellerStats.available}</p>
                <p className="text-orange-200 text-sm">Available</p>
              </div>
              <div className="bg-white bg-opacity-15 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold">
                  {sellerStats.pendingOrders || 0}
                </p>
                <p className="text-orange-200 text-sm">Pending Orders</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Hero */}
      {user && user.role === 'admin' && (
        <div className="bg-gray-800 text-white py-10 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold">
                ⚙️ Admin Panel
              </h1>
              <p className="text-gray-300 mt-1">
                Welcome back, {user.fullName}
              </p>
            </div>
            <div className="flex gap-3">
              <Link to="/admin/dashboard"
                className="bg-yellow-400 text-gray-800 font-bold px-5 py-2.5 rounded-xl hover:bg-yellow-300 transition-colors">
                📊 Dashboard
              </Link>
              <Link to="/admin/users"
                className="bg-gray-700 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-gray-600 transition-colors">
                👥 Users
              </Link>
              <Link to="/admin/products"
                className="bg-gray-700 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-gray-600 transition-colors">
                📦 Products
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════
          PLATFORM STATS
      ════════════════════════════ */}
      <div className="bg-white py-10 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-3xl font-bold text-primary">
              {stats.totalProducts > 0
                ? `${stats.totalProducts}+`
                : '1,200+'}
            </p>
            <p className="text-gray-500 mt-1 text-sm">Products Listed</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-primary">850+</p>
            <p className="text-gray-500 mt-1 text-sm">Happy Buyers</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-primary">300+</p>
            <p className="text-gray-500 mt-1 text-sm">Active Sellers</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-primary">15+</p>
            <p className="text-gray-500 mt-1 text-sm">Cities Covered</p>
          </div>
        </div>
      </div>

      {/* ════════════════════════════
          BUYER — RECENT ORDERS
          (only shows if buyer has orders)
      ════════════════════════════ */}
      {user && user.role === 'buyer' && recentOrders.length > 0 && (
        <div className="bg-orange-50 py-8 px-4 border-t border-orange-100">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                📦 Your Recent Orders
              </h2>
              <Link to="/orders"
                className="text-primary font-semibold text-sm hover:underline">
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentOrders.map(order => (
                <div key={order._id}
                  className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4">
                  <div className="w-14 h-14 bg-orange-50 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                    {order.product?.images?.length > 0 ? (
                      <img src={order.product.images[0]}
                        alt={order.product.title}
                        className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl">
                        {categoryEmoji[order.product?.category] || '📦'}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 text-sm truncate">
                      {order.product?.title}
                    </p>
                    <p className="text-primary font-bold text-sm">
                      Rs. {Number(order.price).toLocaleString()}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold flex-shrink-0 ${statusColors[order.status]}`}>
                    {order.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════
          SELLER — MY RECENT LISTINGS
          (only shows if seller has products)
      ════════════════════════════ */}
      {user && user.role === 'seller' && myProducts.length > 0 && (
        <div className="bg-blue-50 py-8 px-4 border-t border-blue-100">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                🏷️ Your Recent Listings
              </h2>
              <Link to="/seller/dashboard"
                className="text-primary font-semibold text-sm hover:underline">
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {myProducts.map(product => (
                <Link key={product._id}
                  to={`/products/${product._id}`}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                  <div className="h-36 bg-orange-50 flex items-center justify-center overflow-hidden">
                    {product.images?.length > 0 ? (
                      <img src={product.images[0]} alt={product.title}
                        className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-5xl">
                        {categoryEmoji[product.category] || '📦'}
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="font-bold text-gray-800 truncate">{product.title}</p>
                    <p className="text-primary font-bold mt-1">
                      Rs. {Number(product.price).toLocaleString()}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold
                        ${product.status === 'available' ? 'bg-green-100 text-green-700' :
                          product.status === 'reserved' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-orange-100 text-orange-700'}`}>
                        {product.status}
                      </span>
                      <span className="text-gray-400 text-xs">
                        👁️ {product.views} views
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════
          BROWSE BY CATEGORY
      ════════════════════════════ */}
      <div className="bg-secondary py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">
              Browse by Category
            </h2>
            <p className="text-gray-500 mt-2">
              Find exactly what you're looking for
            </p>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {categories.map(cat => (
              <Link
                key={cat.value}
                to={`/products?category=${cat.value}`}
                className="bg-white rounded-2xl p-5 text-center hover:shadow-md transition-all cursor-pointer group border-2 border-transparent hover:border-primary">
                <p className="text-4xl mb-2 group-hover:scale-110 transition-transform">
                  {cat.emoji}
                </p>
                <p className="font-semibold text-gray-700 text-sm">{cat.name}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════════════════
          FEATURED LISTINGS — REAL DATA
      ════════════════════════════ */}
      <div className="py-12 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">
                Featured Listings
              </h2>
              <p className="text-gray-500 mt-1">
                Latest quality furniture near you
              </p>
            </div>
            <Link to="/products"
              className="text-primary font-semibold hover:underline text-sm">
              View All →
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <p className="text-5xl animate-bounce">🛋️</p>
              <p className="text-gray-500 mt-3">Loading products...</p>
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-5xl mb-4">📭</p>
              <p className="text-gray-500 mb-4">
                No products listed yet
              </p>
              {user?.role === 'seller' && (
                <Link to="/sell"
                  className="bg-primary text-white px-6 py-3 rounded-xl hover:bg-accent transition-colors">
                  Be the first to list!
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featuredProducts.map(product => (
                <Link
                  key={product._id}
                  to={`/products/${product._id}`}
                  className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all group">

                  {/* Product Image */}
                  <div className="bg-orange-50 h-44 flex items-center justify-center overflow-hidden">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <span className="text-6xl group-hover:scale-110 transition-transform">
                        {categoryEmoji[product.category] || '📦'}
                      </span>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${conditionColors[product.condition]}`}>
                      {conditionLabels[product.condition]}
                    </span>
                    <h3 className="font-bold text-gray-800 mt-2 text-sm line-clamp-2">
                      {product.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-primary font-bold">
                        Rs. {Number(product.price).toLocaleString()}
                      </p>
                      {product.originalPrice > 0 && (
                        <p className="text-gray-400 text-xs line-through">
                          Rs. {Number(product.originalPrice).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-gray-500 text-xs">
                        📍 {product.city}
                      </p>
                      <p className="text-gray-400 text-xs">
                        👁️ {product.views}
                      </p>
                    </div>
                    <p className="text-gray-400 text-xs mt-1">
                      🧑 {product.seller?.fullName}
                    </p>

                    {/* View Details button */}
                    <button className="w-full mt-3 bg-primary hover:bg-accent text-white font-semibold py-2 rounded-xl transition-colors text-sm">
                      View Details
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ════════════════════════════
          HOW IT WORKS
          Different for buyer/seller
      ════════════════════════════ */}
      <div className="bg-secondary py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            How ReHome Works
          </h2>
          <p className="text-gray-500 mb-8">
            Simple steps to {user?.role === 'seller' ? 'sell' : 'buy'} furniture
          </p>

          {/* Show seller steps if logged in as seller */}
          {user?.role === 'seller' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <p className="text-4xl mb-3">📸</p>
                <h3 className="font-bold text-gray-800 mb-2">
                  1. List Your Furniture
                </h3>
                <p className="text-gray-500 text-sm">
                  Take photos, add description and set your price. It's free!
                </p>
                <Link to="/sell"
                  className="inline-block mt-4 bg-primary text-white px-4 py-2 rounded-xl text-sm hover:bg-accent transition-colors">
                  List Now →
                </Link>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <p className="text-4xl mb-3">💬</p>
                <h3 className="font-bold text-gray-800 mb-2">
                  2. Connect with Buyers
                </h3>
                <p className="text-gray-500 text-sm">
                  Chat directly with interested buyers through our platform.
                </p>
                <Link to="/chat"
                  className="inline-block mt-4 bg-primary text-white px-4 py-2 rounded-xl text-sm hover:bg-accent transition-colors">
                  View Chats →
                </Link>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <p className="text-4xl mb-3">💰</p>
                <h3 className="font-bold text-gray-800 mb-2">
                  3. Deliver & Get Paid
                </h3>
                <p className="text-gray-500 text-sm">
                  Arrange delivery and receive payment safely through ReHome.
                </p>
                <Link to="/seller/orders"
                  className="inline-block mt-4 bg-primary text-white px-4 py-2 rounded-xl text-sm hover:bg-accent transition-colors">
                  View Orders →
                </Link>
              </div>
            </div>
          ) : (
            // Show buyer steps for visitors and buyers
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <p className="text-4xl mb-3">🔍</p>
                <h3 className="font-bold text-gray-800 mb-2">
                  1. Browse & Search
                </h3>
                <p className="text-gray-500 text-sm">
                  Search thousands of quality second-hand furniture listings near you.
                </p>
                <Link to="/products"
                  className="inline-block mt-4 bg-primary text-white px-4 py-2 rounded-xl text-sm hover:bg-accent transition-colors">
                  Browse Now →
                </Link>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <p className="text-4xl mb-3">💬</p>
                <h3 className="font-bold text-gray-800 mb-2">
                  2. Chat with Seller
                </h3>
                <p className="text-gray-500 text-sm">
                  Ask questions and negotiate directly with sellers in real-time.
                </p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <p className="text-4xl mb-3">🚚</p>
                <h3 className="font-bold text-gray-800 mb-2">
                  3. Buy & Track
                </h3>
                <p className="text-gray-500 text-sm">
                  Place order safely and track delivery right to your door.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ════════════════════════════
          CTA SECTION
          Only for visitors (not logged in)
      ════════════════════════════ */}
      {!user && (
        <div className="bg-primary py-14 px-4 text-center text-white">
          <h2 className="text-3xl font-bold mb-3">
            Ready to Give Furniture a Second Life?
          </h2>
          <p className="text-orange-200 text-lg mb-6 max-w-xl mx-auto">
            Join thousands of buyers and sellers across Nepal on ReHome
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/register"
              className="bg-yellow-400 hover:bg-yellow-300 text-gray-800 font-bold px-8 py-3 rounded-xl transition-colors text-lg">
              🛒 Start Buying
            </Link>
            <Link to="/register"
              className="bg-white text-primary font-bold px-8 py-3 rounded-xl hover:bg-orange-50 transition-colors text-lg">
              🏷️ Start Selling
            </Link>
          </div>
        </div>
      )}

    </div>
  );
}

export default Home;