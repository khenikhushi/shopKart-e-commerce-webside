import {
  createContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import cartApi from '../api/cart.api';
import { getToken } from '../utils/token.util';
import { getRoleFromToken } from '../utils/role.util';

const CartContext = createContext(null);

const CartProvider = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [cartItems, setCartItems] = useState([]);

  // Fetch cart count — only for users with role=user
  const refreshCart = useCallback(async () => {
    const token = getToken();
    const role = getRoleFromToken();

    if (!token || role !== 'user') {
      setCartCount(0);
      setCartItems([]);
      setCartTotal(0);
      return;
    }

    try {
      const res = await cartApi.getCart();
      const data = res.data.data;
      setCartCount(data.totalItems || 0);
      setCartTotal(data.totalAmount || 0);
      setCartItems(data.cart?.items || []);
    } catch {
      setCartCount(0);
      setCartItems([]);
      setCartTotal(0);
    }
  }, []);

  const clearCartState = useCallback(() => {
    setCartCount(0);
    setCartTotal(0);
    setCartItems([]);
  }, []);

  // Load cart on mount if user is logged in
  useEffect(() => {
    const loadCart = async () => {
      await refreshCart();
    };

    loadCart();
  }, [refreshCart]);

  return (
    <CartContext.Provider
      value={{
        cartCount,
        cartTotal,
        cartItems,
        refreshCart,
        clearCartState,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export { CartContext, CartProvider };