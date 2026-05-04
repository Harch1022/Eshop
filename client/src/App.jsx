import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './components/AuthPage/AuthPage.jsx';
import ProductPage from './components/ProductPage/ProductPage.jsx';
import ProductInfoPage from './components/ProductInfoPage/ProductInfoPage.jsx';
import AdminPage from './components/AdminPage/AdminPage.jsx';
import CartPage from './components/CartPage.jsx';
import OrderHistory from './components/OrderHistory.jsx';
import OrderTracking from './components/OrderTracking.jsx';

function App() {
  const [userId, setUserId] = useState(() => {
    try { return sessionStorage.getItem('eshop_userId'); } catch { return null; }
  });
  const [userName, setUserName] = useState(() => {
    try { return sessionStorage.getItem('eshop_userName'); } catch { return null; }
  });
  const [isAdmin, setIsAdmin] = useState(() => {
    try { return sessionStorage.getItem('eshop_isAdmin') === 'true'; } catch { return false; }
  });
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('eshop_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('eshop_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, quantity = 1) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        const newQty = existing.quantity + quantity;
        if (newQty <= 0) return prevCart.filter((item) => item.id !== product.id);
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: Math.min(newQty, 50) } : item
        );
      }
      if (quantity <= 0) return prevCart;
      return [...prevCart, { ...product, quantity: Math.min(quantity, 50) }];
    });
  };

  const handleLogin = (user) => {
    setIsAdmin(user.role === 1);
    setUserName(user.name);
    setUserId(user.id);
    sessionStorage.setItem('eshop_userId', user.id);
    sessionStorage.setItem('eshop_userName', user.name);
    sessionStorage.setItem('eshop_isAdmin', String(user.role === 1));
  };

  const handleLogout = () => {
    setUserName(null);
    setIsAdmin(false);
    setUserId(null);
    setCart([]);
    sessionStorage.clear();
  };

  return (
    <Routes>
      <Route
        path="/login"
        element={
          !userName ? (
            <AuthPage onLogin={handleLogin} />
          ) : isAdmin ? (
            <Navigate to="/adminPage" replace />
          ) : (
            <Navigate to="/productPage" replace />
          )
        }
      />
      <Route
        path="/productPage"
        element={
          userName && !isAdmin ? (
            <ProductPage
              userName={userName}
              onLogout={handleLogout}
              cart={cart}
              addToCart={addToCart}
              isAdmin={isAdmin}
            />
          ) : isAdmin ? (
            <Navigate to="/adminPage" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/adminPage"
        element={
          isAdmin ? (
            <AdminPage userName={userName} onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/product/:productId"
        element={
          userName ? (
            <ProductInfoPage
              userName={userName}
              onLogout={handleLogout}
              cart={cart}
              addToCart={addToCart}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/cart"
        element={
          userName ? (
            <CartPage userName={userName} userId={userId} onLogout={handleLogout} cart={cart} addToCart={addToCart} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/orders"
        element={
          userName && !isAdmin ? (
            <OrderHistory userId={userId} userName={userName} onLogout={handleLogout} />
          ) : isAdmin ? (
            <Navigate to="/adminPage" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/order/:orderId"
        element={
          userName && !isAdmin ? (
            <OrderTracking userName={userName} onLogout={handleLogout} />
          ) : isAdmin ? (
            <Navigate to="/adminPage" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="*"
        element={
          <Navigate to={userName ? (isAdmin ? '/adminPage' : '/productPage') : '/login'} replace />
        }
      />
    </Routes>
  );
}

export default App;
