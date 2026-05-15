import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import CartItemComponent from
  '../../components/user/CartItem';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import ConfirmModal from
  '../../components/common/ConfirmModal';
import cartApi from '../../api/cart.api';
import useCart from '../../hooks/useCart';
import { formatCurrency } from '../../utils/format.util';

const CartPage = () => {
  const navigate = useNavigate();
  const { refreshCart } = useCart();

  const [cartData, setCartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState('');
  const [clearModalOpen, setClearModalOpen] =
    useState(false);
  const [clearLoading, setClearLoading] = useState(false);

  const [toast, setToast] = useState({
    show: false, message: '', type: 'success',
  });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(
      () => setToast({
        show: false, message: '', type: 'success',
      }),
      3000
    );
  };

  const fetchCart = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await cartApi.getCart();
      setCartData(res.data.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to load cart.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleIncrease = async (item) => {
    setUpdatingId(item.id);
    try {
      await cartApi.updateItem(item.id, {
        quantity: item.quantity + 1,
      });
      await fetchCart();
      await refreshCart();
    } catch (err) {
      showToast(
        err.response?.data?.message ||
        'Failed to update quantity.',
        'error'
      );
    } finally {
      setUpdatingId('');
    }
  };

  const handleDecrease = async (item) => {
    if (item.quantity <= 1) return;
    setUpdatingId(item.id);
    try {
      await cartApi.updateItem(item.id, {
        quantity: item.quantity - 1,
      });
      await fetchCart();
      await refreshCart();
    } catch (err) {
      showToast(
        err.response?.data?.message ||
        'Failed to update quantity.',
        'error'
      );
    } finally {
      setUpdatingId('');
    }
  };

  const handleRemove = async (itemId) => {
    setUpdatingId(itemId);
    try {
      await cartApi.removeItem(itemId);
      await fetchCart();
      await refreshCart();
      showToast('Item removed from cart.');
    } catch (err) {
      showToast(
        err.response?.data?.message ||
        'Failed to remove item.',
        'error'
      );
    } finally {
      setUpdatingId('');
    }
  };

  const handleClearCart = async () => {
    setClearLoading(true);
    try {
      await cartApi.clearCart();
      await fetchCart();
      await refreshCart();
      setClearModalOpen(false);
      showToast('Cart cleared.');
    } catch (err) {
      showToast(
        err.response?.data?.message ||
        'Failed to clear cart.',
        'error'
      );
      setClearModalOpen(false);
    } finally {
      setClearLoading(false);
    }
  };

  const items = cartData?.cart?.items || [];
  const totalAmount = cartData?.totalAmount || 0;
  const totalItems = cartData?.totalItems || 0;

  // Calculate savings
  const totalMrp = items.reduce((sum, item) => {
    const mrp = parseFloat(item.product?.mrp || 0);
    return sum + mrp * item.quantity;
  }, 0);
  const savings = totalMrp > totalAmount
    ? totalMrp - totalAmount : 0;

  return (
    <>
      <Navbar />

      <div className="page-wrapper">
        <div className="container">

          <h1 style={{
            fontSize: 20, fontWeight: 700, marginBottom: 4,
          }}>
            My Cart
          </h1>
          <div style={{
            fontSize: 13, color: '#878787',
            marginBottom: 20,
          }}>
            {totalItems} item(s) in your cart
          </div>

          {loading && (
            <Loader fullPage text="Loading cart..." />
          )}
          {error && (
            <ErrorMessage
              message={error}
              onRetry={fetchCart}
            />
          )}

          {!loading && !error && items.length === 0 && (
            <EmptyState
              title="Your cart is empty"
              message="Add items to your cart to see them here."
              actionLabel="Start Shopping"
              actionLink="/products"
              icon="🛒"
            />
          )}

          {!loading && !error && items.length > 0 && (
            <div className="row g-4">

              {/* Left — Cart Items */}
              <div className="col-lg-8">
                <div style={{
                  background: 'white', borderRadius: 8,
                  padding: '0 20px',
                  boxShadow: 'var(--card-shadow)',
                }}>
                  {/* Cart header */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px 0',
                    borderBottom: '1px solid #f0f0f0',
                  }}>
                    <span style={{
                      fontSize: 14, fontWeight: 700,
                    }}>
                      {items.length} Item(s)
                    </span>
                    <button
                      style={{
                        background: 'none', border: 'none',
                        color: '#878787', cursor: 'pointer',
                        fontSize: 12,
                      }}
                      onClick={() =>
                        setClearModalOpen(true)
                      }
                    >
                      Clear Cart
                    </button>
                  </div>

                  {/* Items list */}
                  {items.map((item) => (
                    <CartItemComponent
                      key={item.id}
                      item={item}
                      onIncrease={handleIncrease}
                      onDecrease={handleDecrease}
                      onRemove={handleRemove}
                      updating={updatingId}
                    />
                  ))}

                  {/* Continue shopping */}
                  <div style={{ padding: '12px 0' }}>
                    <button
                      className="btn btn-link p-0"
                      style={{
                        fontSize: 13,
                        color: 'var(--primary)',
                      }}
                      onClick={() =>
                        navigate('/products')
                      }
                    >
                      ← Continue Shopping
                    </button>
                  </div>
                </div>
              </div>

              {/* Right — Order Summary */}
              <div className="col-lg-4">
                <div style={{
                  background: 'white', borderRadius: 8,
                  padding: 20,
                  boxShadow: 'var(--card-shadow)',
                  position: 'sticky', top: 76,
                }}>
                  <div style={{
                    fontSize: 14, fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    marginBottom: 16,
                    paddingBottom: 12,
                    borderBottom: '1px solid #f0f0f0',
                    color: '#878787',
                  }}>
                    Price Details
                  </div>

                  {/* Price breakdown */}
                  <div style={{ marginBottom: 16 }}>
                    {[
                      {
                        label: `Price (${totalItems} item${totalItems > 1 ? 's' : ''})`,
                        value: formatCurrency(
                          totalMrp || totalAmount
                        ),
                      },
                      savings > 0 ? {
                        label: 'Discount',
                        value: `− ${formatCurrency(savings)}`,
                        green: true,
                      } : null,
                      {
                        label: 'Delivery Charges',
                        value: 'FREE',
                        green: true,
                      },
                    ]
                      .filter(Boolean)
                      .map((row) => (
                        <div
                          key={row.label}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: 14, marginBottom: 10,
                          }}
                        >
                          <span style={{
                            color: '#444',
                          }}>
                            {row.label}
                          </span>
                          <span style={{
                            fontWeight: 500,
                            color: row.green
                              ? '#26a541' : 'inherit',
                          }}>
                            {row.value}
                          </span>
                        </div>
                      ))}
                  </div>

                  {/* Total */}
                  <div style={{
                    borderTop: '2px solid #f0f0f0',
                    paddingTop: 12, marginBottom: 16,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <span style={{
                      fontWeight: 700, fontSize: 16,
                    }}>
                      Total Amount
                    </span>
                    <span style={{
                      fontWeight: 700, fontSize: 18,
                    }}>
                      {formatCurrency(totalAmount)}
                    </span>
                  </div>

                  {savings > 0 && (
                    <div style={{
                      background: '#f0faf3',
                      borderRadius: 4, padding: '8px 12px',
                      fontSize: 13, color: '#26a541',
                      fontWeight: 600, marginBottom: 16,
                    }}>
                      🎉 You save {formatCurrency(savings)}!
                    </div>
                  )}

                  <button
                    className="btn btn-primary w-100"
                    style={{
                      height: 48, fontSize: 16,
                      fontWeight: 700, borderRadius: 4,
                    }}
                    onClick={() =>
                      navigate('/checkout')
                    }
                  >
                    Proceed to Checkout →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />

      <ConfirmModal
        show={clearModalOpen}
        title="Clear Cart"
        message="Are you sure you want to remove all items from your cart?"
        confirmLabel="Clear Cart"
        confirmVariant="danger"
        loading={clearLoading}
        onConfirm={handleClearCart}
        onCancel={() => setClearModalOpen(false)}
      />

      {toast.show && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24,
          zIndex: 9999,
          background: toast.type === 'success'
            ? '#26a541' : '#ff6161',
          color: 'white', padding: '12px 20px',
          borderRadius: 6, fontSize: 14, fontWeight: 600,
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        }}>
          {toast.type === 'success' ? '✅' : '❌'}{' '}
          {toast.message}
        </div>
      )}
    </>
  );
};

export default CartPage;