import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import ProductList from './pages/ProductList/ProductList';
import AddProduct from './pages/AddProduct/AddProduct';
import ProductDetail from './pages/ProductDetail/ProductDetail';
import SellerDashboard from './pages/Dashboard/SellerDashboard';
import BuyerDashboard from './pages/Dashboard/BuyerDashboard';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminUsers from './pages/Admin/AdminUsers';
import AdminProducts from './pages/Admin/AdminProducts';
import Wishlist from './pages/Wishlist/Wishlist';
import Checkout from './pages/Checkout/Checkout';
import MyOrders from './pages/Orders/MyOrders';
import SellerOrders from './pages/Orders/SellerOrders';
import ChatList from './pages/Chat/ChatList';
import ChatRoom from './pages/Chat/ChatRoom';
import ProfileSettings from './pages/Profile/ProfileSettings';
import ForgotPassword from './pages/ForgotPassword/ForgotPassword';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-secondary">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/sell" element={<AddProduct />} />
          <Route path="/seller/dashboard" element={<SellerDashboard />} />
          <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/checkout/:productId" element={<Checkout />} />
          <Route path="/orders" element={<MyOrders />} />
          <Route path="/seller/orders" element={<SellerOrders />} />
          <Route path="/chat" element={<ChatList />} />
          <Route path="/chat/:chatId" element={<ChatRoom />} />
          <Route path="/profile/settings" element={<ProfileSettings />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;