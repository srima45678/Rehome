import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../utils/api';

function Home() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Seller specific
  const [myProducts, setMyProducts] = useState([]);
  const [sellerStats, setSellerStats] = useState({
    totalListings: 0,
    totalViews: 0,
    available: 0,
    pendingOrders: 0
  });

  // Buyer specific
  const [wishlistCount, setWishlistCount] = useState(0);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    fetchHomeData();
    // eslint-disable-next-line
  }, []);

  const fetchHomeData = async () => {
    try {
      // Fetch real products for featured section
      const productsRes = await API.get('/products');
      setFeaturedProducts(productsRes.data.products.slice(0, 8));

      if (user?.role === 'seller') {
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
      }

      if (user?.role === 'buyer') {
        const [wishlistRes, ordersRes] = await Promise.all([
          API.get('/wishlist'),
          API.get('/orders/my-orders')
        ]);
        setWishlistCount(wishlistRes.data.count || 0);
        setRecentOrders(ordersRes.data.orders.slice(0, 2));
      }

    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/products${searchQuery.trim() ? `?search=${encodeURIComponent(searchQuery)}` : ''}`);
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

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    shipped: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700'
  };

  const categories = [
    { name: 'Sofa', emoji: '🛋️', value: 'sofa' },
    { name: 'Chair', emoji: '🪑', value: 'chair' },
    { name: 'Table', emoji: '🪵', value: 'table' },
    { name: 'Bed', emoji: '🛏️', value: 'bed' },
    { name: 'Wardrobe', emoji: '🚪', value: 'wardrobe' },
    { name: 'Shelf', emoji: '📚', value: 'shelf' },
  ];

  return (
    <div className="min-h-screen">

      {/* ══════════════════════════════
          HERO — Visitor / Buyer
      ══════════════════════════════ */}
      {(!user || user.role === 'buyer') && (
        <div className="bg-primary text-white py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">

            {user?.role === 'buyer' && (
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

            {/* Search */}
            <form onSubmit={handleSearch}
              className="flex gap-3 max-w-2xl mx-auto mb-6">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for sofa, chair, table..."
                className="flex-1 px-5 py-3.5 rounded-xl text-gray-800 outline-none text-base"
              />
              <button type="submit"
                className="bg-yellow-400 hover:bg-yellow-300 text-gray-800 font-bold px-6 py-3.5 rounded-xl transition-colors">
                🔍 Search
              </button>
            </form>

            {/* Popular tags */}
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              <span className="text-orange-200 text-sm">Popular:</span>
              {['Sofa', 'Bed', 'Dining Table', 'Office Chair'].map(tag => (
                <button key={tag}
                  onClick={() => navigate(`/products?search=${tag}`)}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white text-sm px-3 py-1 rounded-full transition-colors">
                  {tag}
                </button>
              ))}
            </div>

            {/* Buyer quick links */}
            {user?.role === 'buyer' && (
              <div className="flex gap-3 justify-center flex-wrap">
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

      {/* ══════════════════════════════
          HERO — Seller
      ══════════════════════════════ */}
      {user?.role === 'seller' && (
        <div className="bg-primary text-white py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-orange-200 text-sm font-medium mb-1">
                  🏷️ Seller Account
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
                  + Add Listing
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
                <Link to="/chat"
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors">
                  💬 Chats
                </Link>
              </div>
            </div>

            {/* Seller stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {[
                { label: 'Total Listings', value: sellerStats.totalListings },
                { label: 'Total Views', value: sellerStats.totalViews },
                { label: 'Available', value: sellerStats.available },
                { label: 'Pending Orders', value: sellerStats.pendingOrders }
              ].map(stat => (
                <div key={stat.label}
                  className="bg-white bg-opacity-15 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-orange-200 text-sm mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════
          HERO — Admin
      ══════════════════════════════ */}
      {user?.role === 'admin' && (
        <div className="bg-gray-800 text-white py-10 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold">⚙️ Admin Panel</h1>
              <p className="text-gray-300 mt-1">
                Welcome back, {user.fullName}
              </p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Link to="/admin/dashboard"
                className="bg-yellow-400 text-gray-800 font-bold px-5 py-2.5 rounded-xl">
                📊 Dashboard
              </Link>
              <Link to="/admin/users"
                className="bg-gray-700 text-white px-5 py-2.5 rounded-xl hover:bg-gray-600 transition-colors">
                👥 Users
              </Link>
              <Link to="/admin/products"
                className="bg-gray-700 text-white px-5 py-2.5 rounded-xl hover:bg-gray-600 transition-colors">
                📦 Products
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════
          PLATFORM STATS
      ══════════════════════════════ */}
      <div className="bg-white py-10 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: '1,200+', label: 'Products Listed' },
            { value: '850+', label: 'Happy Buyers' },
            { value: '300+', label: 'Active Sellers' },
            { value: '15+', label: 'Cities Covered' }
          ].map(stat => (
            <div key={stat.label}>
              <p className="text-3xl font-bold text-primary">{stat.value}</p>
              <p className="text-gray-500 mt-1 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════
          BUYER — RECENT ORDERS
      ══════════════════════════════ */}
      {user?.role === 'buyer' && recentOrders.length > 0 && (
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
                <Link
                  key={order._id}
                  to={`/orders`}
                  className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
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
                    <p className="text-gray-400 text-xs mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${statusColors[order.status]}`}>
                      {order.status}
                    </span>
                    <span className="text-gray-400 text-xs">Track →</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════
          SELLER — RECENT LISTINGS
      ══════════════════════════════ */}
      {user?.role === 'seller' && myProducts.length > 0 && (
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
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group">
                  <div className="h-36 bg-orange-50 flex items-center justify-center overflow-hidden">
                    {product.images?.length > 0 ? (
                      <img src={product.images[0]} alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <span className="text-5xl">
                        {categoryEmoji[product.category] || '📦'}
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="font-bold text-gray-800 truncate text-sm">
                      {product.title}
                    </p>
                    <p className="text-primary font-bold mt-1 text-sm">
                      Rs. {Number(product.price).toLocaleString()}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold
                        ${product.status === 'available' ? 'bg-green-100 text-green-700' :
                          product.status === 'reserved' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-orange-100 text-orange-700'}`}>
                        {product.status === 'available' ? '🟢 Available' :
                         product.status === 'reserved' ? '🟡 Reserved' :
                         '🔴 Sold'}
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

      {/* ══════════════════════════════
          BROWSE BY CATEGORY
      ══════════════════════════════ */}
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
                className="bg-white rounded-2xl p-5 text-center hover:shadow-md transition-all group border-2 border-transparent hover:border-primary cursor-pointer">
                <p className="text-4xl mb-2 group-hover:scale-110 transition-transform">
                  {cat.emoji}
                </p>
                <p className="font-semibold text-gray-700 text-sm">
                  {cat.name}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════
          FEATURED LISTINGS — REAL DATA
      ══════════════════════════════ */}
      <div className="py-12 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">
                Featured Listings
              </h2>
              <p className="text-gray-500 mt-1">
                Latest quality furniture from our sellers
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
            <div className="text-center py-16 bg-gray-50 rounded-2xl">
              <p className="text-5xl mb-4">📭</p>
              <p className="text-gray-500 mb-2">No products listed yet</p>
              {user?.role === 'seller' && (
                <Link to="/sell"
                  className="inline-block mt-2 bg-primary text-white px-6 py-3 rounded-xl hover:bg-accent transition-colors">
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

                  {/* Image */}
                  <div className="bg-orange-50 h-44 flex items-center justify-center overflow-hidden">
                    {product.images?.length > 0 ? (
                      <img src={product.images[0]} alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <span className="text-6xl group-hover:scale-110 transition-transform">
                        {categoryEmoji[product.category] || '📦'}
                      </span>
                    )}
                  </div>

                  {/* Info */}
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
                      <p className="text-gray-500 text-xs">📍 {product.city}</p>
                      <p className="text-gray-400 text-xs">👁️ {product.views}</p>
                    </div>
                    <p className="text-gray-400 text-xs mt-1">
                      🧑 {product.seller?.fullName}
                    </p>
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

      {/* ══════════════════════════════
          HOW IT WORKS
      ══════════════════════════════ */}
      <div className="bg-secondary py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            How ReHome Works
          </h2>
          <p className="text-gray-500 mb-8">
            Simple steps to {user?.role === 'seller' ? 'sell' : 'buy'} furniture
          </p>

          {user?.role === 'seller' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  emoji: '📸',
                  title: '1. List Your Furniture',
                  desc: 'Take photos, add description and set your price. Listing is completely free!',
                  link: '/sell',
                  linkText: 'List Now →'
                },
                {
                  emoji: '💬',
                  title: '2. Connect with Buyers',
                  desc: 'Chat directly with interested buyers and negotiate the best price.',
                  link: '/chat',
                  linkText: 'View Chats →'
                },
                {
                  emoji: '💰',
                  title: '3. Deliver & Get Paid',
                  desc: 'Arrange delivery and receive payment safely through ReHome.',
                  link: '/seller/orders',
                  linkText: 'View Orders →'
                }
              ].map(step => (
                <div key={step.title} className="bg-white rounded-2xl p-6 shadow-sm">
                  <p className="text-4xl mb-3">{step.emoji}</p>
                  <h3 className="font-bold text-gray-800 mb-2">{step.title}</h3>
                  <p className="text-gray-500 text-sm">{step.desc}</p>
                  <Link to={step.link}
                    className="inline-block mt-4 bg-primary text-white px-4 py-2 rounded-xl text-sm hover:bg-accent transition-colors">
                    {step.linkText}
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  emoji: '🔍',
                  title: '1. Browse & Search',
                  desc: 'Search thousands of quality second-hand furniture listings near you.',
                  link: '/products',
                  linkText: 'Browse Now →'
                },
                {
                  emoji: '💬',
                  title: '2. Chat with Seller',
                  desc: 'Ask questions and negotiate directly with sellers in real-time.',
                  link: user ? '/chat' : '/login',
                  linkText: 'Start Chatting →'
                },
                {
                  emoji: '🚚',
                  title: '3. Buy & Track',
                  desc: 'Place your order safely and track delivery status in real-time.',
                  link: user ? '/orders' : '/register',
                  linkText: user ? 'My Orders →' : 'Register Free →'
                }
              ].map(step => (
                <div key={step.title} className="bg-white rounded-2xl p-6 shadow-sm">
                  <p className="text-4xl mb-3">{step.emoji}</p>
                  <h3 className="font-bold text-gray-800 mb-2">{step.title}</h3>
                  <p className="text-gray-500 text-sm">{step.desc}</p>
                  <Link to={step.link}
                    className="inline-block mt-4 bg-primary text-white px-4 py-2 rounded-xl text-sm hover:bg-accent transition-colors">
                    {step.linkText}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════
          CTA — Only for visitors
      ══════════════════════════════ */}
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