import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import API from '../../utils/api';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role !== 'admin') {
      fetchWishlistCount();
    }
    // eslint-disable-next-line
  }, []);

  const fetchWishlistCount = async () => {
    try {
      const response = await API.get('/wishlist');
      setWishlistCount(response.data.count || 0);
    } catch (error) {
      console.log('Could not fetch wishlist count');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
    window.location.reload();
  };

  return (
    <nav className="bg-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🛋️</span>
            <span className="text-xl font-bold text-primary">ReHome</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/"
              className="text-gray-600 hover:text-primary font-medium transition-colors">
              Home
            </Link>
            <Link to="/products"
              className="text-gray-600 hover:text-primary font-medium transition-colors">
              Browse
            </Link>

            {/* Sell Furniture — ONLY for sellers and visitors, NOT buyers */}
            {(!user || user.role === 'seller') && (
              <Link to="/sell"
                className="text-gray-600 hover:text-primary font-medium transition-colors">
                Sell Furniture
              </Link>
            )}

            {/* Not logged in */}
            {!user ? (
              <div className="flex items-center gap-3">
                <Link to="/login"
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-accent transition-colors">
                  Login
                </Link>
                <Link to="/register"
                  className="border-2 border-primary text-primary px-4 py-2 rounded-lg hover:bg-primary hover:text-white transition-colors">
                  Register
                </Link>
              </div>
            ) : (
              /* Logged in user */
              <div className="flex items-center gap-3">

                {/* Hi + name */}
                <span className="text-gray-600 text-sm">
                  Hi, <span className="font-bold text-primary">
                    {user.fullName.split(' ')[0]}
                  </span>
                </span>

                {/* Profile settings icon */}
                <Link to="/profile/settings"
                  className="text-gray-600 hover:text-primary transition-colors"
                  title="Profile Settings">
                  <span className="text-lg">⚙️</span>
                </Link>

                {/* Role badge */}
                <span className={`text-xs px-2 py-1 rounded-full font-semibold
                  ${user.role === 'seller' ? 'bg-blue-100 text-blue-700' :
                    user.role === 'admin' ? 'bg-red-100 text-red-700' :
                    'bg-green-100 text-green-700'}`}>
                  {user.role}
                </span>

                {/* Wishlist — only for buyers and sellers */}
                {user.role !== 'admin' && (
                  <Link to="/wishlist"
                    className="relative text-gray-600 hover:text-red-500 transition-colors"
                    title="My Wishlist">
                    <span className="text-xl">❤️</span>
                    {wishlistCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                        {wishlistCount > 9 ? '9+' : wishlistCount}
                      </span>
                    )}
                  </Link>
                )}

                {/* Chat — only for buyers and sellers */}
                {user.role !== 'admin' && (
                  <Link to="/chat"
                    className="text-gray-600 hover:text-primary transition-colors"
                    title="My Chats">
                    <span className="text-xl">💬</span>
                  </Link>
                )}

                {/* Orders — only for buyers */}
                {user.role === 'buyer' && (
                  <Link to="/orders"
                    className="text-gray-600 hover:text-primary transition-colors"
                    title="My Orders">
                    <span className="text-xl">📦</span>
                  </Link>
                )}

                {/* Dashboard */}
                <Link to={`/${user.role}/dashboard`}
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-accent transition-colors text-sm">
                  Dashboard
                </Link>

                {/* Logout */}
                <button onClick={handleLogout}
                  className="border-2 border-gray-300 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm">
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-gray-600 text-2xl"
            onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-3 flex flex-col gap-3 pb-3 border-t border-gray-100 pt-3">
            <Link to="/"
              className="text-gray-600 hover:text-primary font-medium">
              Home
            </Link>
            <Link to="/products"
              className="text-gray-600 hover:text-primary font-medium">
              Browse
            </Link>

            {/* Sell — only sellers and visitors */}
            {(!user || user.role === 'seller') && (
              <Link to="/sell"
                className="text-gray-600 hover:text-primary font-medium">
                Sell Furniture
              </Link>
            )}

            {!user ? (
              <>
                <Link to="/login"
                  className="bg-primary text-white px-4 py-2 rounded-lg text-center">
                  Login
                </Link>
                <Link to="/register"
                  className="border-2 border-primary text-primary px-4 py-2 rounded-lg text-center">
                  Register
                </Link>
              </>
            ) : (
              <>
                <span className="text-gray-600 text-sm font-medium">
                  Hi, {user.fullName}
                </span>
                <Link to="/profile/settings"
                  className="text-gray-600 hover:text-primary font-medium">
                  ⚙️ Profile Settings
                </Link>
                {user.role !== 'admin' && (
                  <Link to="/wishlist"
                    className="text-gray-600 hover:text-red-500 font-medium">
                    ❤️ Wishlist
                    {wishlistCount > 0 && ` (${wishlistCount})`}
                  </Link>
                )}
                {user.role !== 'admin' && (
                  <Link to="/chat"
                    className="text-gray-600 hover:text-primary font-medium">
                    💬 Chat
                  </Link>
                )}
                {user.role === 'buyer' && (
                  <Link to="/orders"
                    className="text-gray-600 hover:text-primary font-medium">
                    📦 My Orders
                  </Link>
                )}
                <Link to={`/${user.role}/dashboard`}
                  className="bg-primary text-white px-4 py-2 rounded-lg text-center">
                  Dashboard
                </Link>
                <button onClick={handleLogout}
                  className="border-2 border-gray-300 text-gray-600 px-4 py-2 rounded-lg">
                  Logout
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;