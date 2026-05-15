import { useContext } from 'react';
  import { AuthContext } from '../context/AuthContext';
  import { CartContext } from '../context/CartContext';

/**
 * withAuth HOC - Provides auth and cart context to class components
 * Wraps a class component in a functional component that consumes AuthContext and CartContext
 * Injects auth methods and cart methods as props
 */
const withAuth = (WrappedComponent) => {
  return (props) => {
    const authContext = useContext(AuthContext);
    const cartContext = useContext(CartContext);

    return (
      <WrappedComponent
        {...props}
        // Auth methods and state
        user={authContext.user}
        role={authContext.role}
        loading={authContext.loading}
        error={authContext.error}
        login={authContext.login}
        logout={authContext.logout}
        isAuthenticated={authContext.isAuthenticated}
        isAdmin={authContext.isAdmin}
        isSeller={authContext.isSeller}
        isUser={authContext.isUser}
        clearError={authContext.clearError}
        // Cart methods and state
        cartCount={cartContext.cartCount}
        cartTotal={cartContext.cartTotal}
        cartItems={cartContext.cartItems}
        refreshCart={cartContext.refreshCart}
        clearCartState={cartContext.clearCartState}
      />
    );
  };
};

export default withAuth;
