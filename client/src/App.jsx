import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './CartContext';
import { AuthProvider } from './AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Header from './components/Header';
import Footer from './components/Footer';

import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import OrderConfirmation from './pages/OrderConfirmation';
import Login from './pages/Login';
import Register from './pages/Register';

import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';

function StoreLayout({ children }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            {/* Storefront */}
            <Route path="/" element={<StoreLayout><Home /></StoreLayout>} />
            <Route path="/shop/:category" element={<StoreLayout><Shop /></StoreLayout>} />
            <Route path="/product/:id" element={<StoreLayout><ProductDetail /></StoreLayout>} />
            <Route path="/cart" element={<StoreLayout><Cart /></StoreLayout>} />
            <Route path="/order-confirmation" element={<StoreLayout><OrderConfirmation /></StoreLayout>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            {/* Admin */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminProducts />} />
              <Route path="orders" element={<AdminOrders />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
