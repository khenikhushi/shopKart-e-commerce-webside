import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import cartApi from '../../api/cart.api';
import orderApi from '../../api/order.api';
import productApi from '../../api/product.api';
import useCart from '../../hooks/useCart';
import { formatCurrency } from '../../utils/format.util';
import { validateCheckoutForm } from
  '../../utils/validate.util';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshCart, clearCartState } = useCart();

  const [cartData, setCartData] = useState(null);
  const [cartLoading, setCartLoading] = useState(true);
  const [cartError, setCartError] = useState('');

  const [buyNowMode, setBuyNowMode] = useState(false);
  const [buyNowProduct, setBuyNowProduct] = useState(null);
  const [buyNowQuantity, setBuyNowQuantity] = useState(1);

  const [form, setForm] = useState({
    shipping_address: '',
    payment_method: 'cod',
  });
  const [formErrors, setFormErrors] = useState({});
  const [placing, setPlacing] = useState(false);
  const [apiError, setApiError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(null);

  useEffect(() => {
    const buyNowParam = searchParams.get('buy_now');
    const slug = searchParams.get('slug');
    const quantity = Number.parseInt(searchParams.get('quantity'), 10) || 1;
    const isBuyNow = buyNowParam === 'true' || buyNowParam === '1';

    setBuyNowMode(isBuyNow);
    setBuyNowQuantity(Math.max(1, quantity));

    const fetchCart = async () => {
      setCartError('');
      setCartLoading(true);
      try {
        const res = await cartApi.getCart();
        const data = res.data.data;

        if (!data.cart?.items?.length) {
          navigate('/cart');
          return;
        }

        setCartData(data);
      } catch (err) {
        setCartError(
          err.response?.data?.message ||
          'Failed to load cart.'
        );
      } finally {
        setCartLoading(false);
      }
    };

    const fetchBuyNowProduct = async () => {
      setCartError('');
      setBuyNowProduct(null);
      setCartLoading(true);

      if (!slug) {
        setCartError('Buy now product is missing.');
        setCartLoading(false);
        return;
      }

      try {
        const res = await productApi.getBySlug(slug);
        const product = res.data.data.product;
        if (!product) {
          throw new Error('Product not found.');
        }
        setBuyNowProduct(product);
      } catch (err) {
        setCartError(
          err.response?.data?.message ||
          'Unable to load buy now product.'
        );
      } finally {
        setCartLoading(false);
      }
    };

    if (isBuyNow) {
      fetchBuyNowProduct();
      return;
    }

    fetchCart();
  }, [navigate, searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setApiError('');
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    const validationErrors = validateCheckoutForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      return;
    }

    setPlacing(true);
    setApiError('');

    try {
      const orderPayload = {
        shipping_address: form.shipping_address.trim(),
        payment_method: form.payment_method,
      };

      if (buyNowMode) {
        orderPayload.buy_now = true;
        orderPayload.product_id = buyNowProduct?.id;
        orderPayload.quantity = buyNowQuantity;
      }

      const res = await orderApi.placeOrder(orderPayload);
      const order = res.data.data.order;
      setOrderSuccess(order);

      if (!buyNowMode) {
        clearCartState();
      }

      await refreshCart();
    } catch (err) {
      const validationErrors = err.response?.data?.errors;
      if (Array.isArray(validationErrors) && validationErrors.length > 0) {
        const nextFormErrors = {};

        validationErrors.forEach((item) => {
          if (item?.field) {
            nextFormErrors[item.field] = item.message;
          }
        });

        if (Object.keys(nextFormErrors).length > 0) {
          setFormErrors(nextFormErrors);
        }
      }

      setApiError(
        validationErrors?.[0]?.message ||
        err.response?.data?.message ||
        'Order placement failed. Please try again.'
      );
    } finally {
      setPlacing(false);
    }
  };

  const items = buyNowMode
    ? buyNowProduct
      ? [{ product: buyNowProduct, quantity: buyNowQuantity }]
      : []
    : cartData?.cart?.items || [];
  const totalAmount = buyNowMode
    ? buyNowProduct
      ? buyNowProduct.price * buyNowQuantity
      : 0
    : cartData?.totalAmount || 0;
  const totalItems = buyNowMode
    ? buyNowQuantity
    : cartData?.totalItems || 0;

  // ── Order Success Screen ──────────────────────────────
  if (orderSuccess) {
    return (
      <>
        <Navbar />
        <div className="page-wrapper">
          <div className="container">
            <div style={{
              maxWidth: 480, margin: '0 auto',
              background: 'white', borderRadius: 12,
              padding: 40, textAlign: 'center',
              boxShadow: 'var(--card-shadow)',
              marginTop: 24,
            }}>
              <div style={{ fontSize: 64,
                marginBottom: 16 }}>
                🎉
              </div>
              <h2 style={{
                fontWeight: 800, marginBottom: 8,
                color: '#26a541',
              }}>
                Order Placed!
              </h2>
              <p style={{
                color: '#878787', fontSize: 14,
                marginBottom: 16,
              }}>
                Your order has been placed successfully.
                We will notify you when it ships.
              </p>
              <div style={{
                background: '#f8f9fa', borderRadius: 8,
                padding: '12px 20px', marginBottom: 24,
                fontFamily: 'monospace', fontSize: 16,
                fontWeight: 700, color: 'var(--primary)',
              }}>
                {orderSuccess.slug}
              </div>
              <div style={{
                fontSize: 14, marginBottom: 24,
                color: '#444',
              }}>
                <strong>Total: </strong>
                {formatCurrency(orderSuccess.total_amount)}
                <span style={{
                  marginLeft: 12, color: '#878787',
                }}>
                  ({orderSuccess.payment_method
                    .toUpperCase()})
                </span>
              </div>
              <div className="d-flex gap-3
                justify-content-center">
                <button
                  className="btn btn-primary"
                  onClick={() => navigate('/orders')}
                  style={{ borderRadius: 4 }}
                >
                  View My Orders
                </button>
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => navigate('/products')}
                  style={{ borderRadius: 4 }}
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="page-wrapper">
        <div className="container">

          <h1 style={{
            fontSize: 20, fontWeight: 700, marginBottom: 20,
          }}>
            Checkout
          </h1>

          {cartLoading && (
            <Loader fullPage text="Loading checkout..." />
          )}
          {cartError && (
            <ErrorMessage message={cartError} fullPage />
          )}

          {!cartLoading && !cartError && (
            <form onSubmit={handlePlaceOrder}>
              <div className="row g-4">

                {/* Left — Shipping + Payment */}
                <div className="col-lg-7">

                  {apiError && (
                    <div className="alert alert-danger
                      mb-3" style={{ fontSize: 13 }}>
                      {apiError}
                    </div>
                  )}

                  {/* Shipping Address */}
                  <div style={{
                    background: 'white', borderRadius: 8,
                    padding: 24,
                    boxShadow: 'var(--card-shadow)',
                    marginBottom: 16,
                  }}>
                    <h3 style={{
                      fontSize: 15, fontWeight: 700,
                      marginBottom: 16,
                      paddingBottom: 12,
                      borderBottom: '1px solid #f0f0f0',
                      display: 'flex',
                      alignItems: 'center', gap: 8,
                    }}>
                      📍 Delivery Address
                    </h3>

                    <div className="mb-1">
                      <label className="form-label"
                        style={{
                          fontSize: 13, fontWeight: 600,
                        }}>
                        Full Delivery Address *
                      </label>
                      <textarea
                        name="shipping_address"
                        className={`form-control
                          ${formErrors.shipping_address
                            ? 'is-invalid' : ''}`}
                        placeholder="Flat/House No, Street, Area, City, State, PIN Code"
                        value={form.shipping_address}
                        onChange={handleChange}
                        rows={4}
                        style={{
                          fontSize: 14,
                          resize: 'vertical',
                        }}
                        disabled={placing}
                      />
                      {formErrors.shipping_address && (
                        <div className="error-text">
                          {formErrors.shipping_address}
                        </div>
                      )}
                      <div style={{
                        fontSize: 11, color: '#878787',
                        marginTop: 4,
                      }}>
                        Minimum 10 characters required
                      </div>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div style={{
                    background: 'white', borderRadius: 8,
                    padding: 24,
                    boxShadow: 'var(--card-shadow)',
                  }}>
                    <h3 style={{
                      fontSize: 15, fontWeight: 700,
                      marginBottom: 16,
                      paddingBottom: 12,
                      borderBottom: '1px solid #f0f0f0',
                      display: 'flex',
                      alignItems: 'center', gap: 8,
                    }}>
                      💳 Payment Method
                    </h3>

                    {[
                      {
                        value: 'cod',
                        label: 'Cash on Delivery',
                        icon: '💵',
                        desc: 'Pay when your order arrives',
                      },
                      {
                        value: 'online',
                        label: 'Online Payment',
                        icon: '💳',
                        desc: 'UPI, Cards, Net Banking',
                      },
                    ].map((method) => (
                      <label
                        key={method.value}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: 14,
                          border: `2px solid ${
                            form.payment_method ===
                            method.value
                              ? 'var(--primary)'
                              : '#eee'
                          }`,
                          borderRadius: 8,
                          marginBottom: 10,
                          cursor: 'pointer',
                          background:
                            form.payment_method ===
                            method.value
                              ? '#f0f4ff' : 'white',
                          transition: 'all 0.15s',
                        }}
                      >
                        <input
                          type="radio"
                          name="payment_method"
                          value={method.value}
                          checked={
                            form.payment_method ===
                            method.value
                          }
                          onChange={handleChange}
                          disabled={placing}
                          style={{ display: 'none' }}
                        />
                        <span style={{ fontSize: 24 }}>
                          {method.icon}
                        </span>
                        <div>
                          <div style={{
                            fontWeight: 700, fontSize: 14,
                          }}>
                            {method.label}
                          </div>
                          <div style={{
                            fontSize: 12, color: '#878787',
                          }}>
                            {method.desc}
                          </div>
                        </div>
                        {form.payment_method ===
                          method.value && (
                          <span style={{
                            marginLeft: 'auto',
                            color: 'var(--primary)',
                            fontSize: 18,
                          }}>
                            ✓
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Right — Order Summary */}
                <div className="col-lg-5">
                  <div style={{
                    background: 'white', borderRadius: 8,
                    padding: 20,
                    boxShadow: 'var(--card-shadow)',
                    position: 'sticky', top: 76,
                  }}>
                    <div style={{
                      fontSize: 14, fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: 1, color: '#878787',
                      marginBottom: 16,
                      paddingBottom: 12,
                      borderBottom: '1px solid #f0f0f0',
                    }}>
                      Order Summary ({totalItems} item{totalItems > 1 ? 's' : ''})
                    </div>

                    {/* Items preview */}
                    <div style={{ marginBottom: 16 }}>
                      {items.slice(0, 3).map((item) => (
                        <div
                          key={item.id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: 13,
                            marginBottom: 8,
                            gap: 8,
                          }}
                        >
                          <span style={{
                            flex: 1, overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            color: '#444',
                          }}>
                            {item.product?.name} ×{' '}
                            {item.quantity}
                          </span>
                          <span style={{
                            fontWeight: 600,
                            flexShrink: 0,
                          }}>
                            {formatCurrency(
                              parseFloat(
                                item.product?.price || 0
                              ) * item.quantity
                            )}
                          </span>
                        </div>
                      ))}
                      {items.length > 3 && (
                        <div style={{
                          fontSize: 12, color: '#878787',
                        }}>
                          +{items.length - 3} more item(s)
                        </div>
                      )}
                    </div>

                    {/* Totals */}
                    <div style={{
                      borderTop: '1px solid #f0f0f0',
                      paddingTop: 12, marginBottom: 20,
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: 13, marginBottom: 6,
                        color: '#444',
                      }}>
                        <span>Subtotal</span>
                        <span>
                          {formatCurrency(totalAmount)}
                        </span>
                      </div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: 13, marginBottom: 8,
                        color: '#26a541',
                      }}>
                        <span>Delivery</span>
                        <span style={{ fontWeight: 600 }}>
                          FREE
                        </span>
                      </div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontWeight: 700, fontSize: 17,
                        borderTop: '2px solid #f0f0f0',
                        paddingTop: 10,
                      }}>
                        <span>Total</span>
                        <span>
                          {formatCurrency(totalAmount)}
                        </span>
                      </div>
                    </div>

                    {/* Place Order Button */}
                    <button
                      type="submit"
                      className="btn btn-primary w-100"
                      style={{
                        height: 52, fontSize: 16,
                        fontWeight: 700, borderRadius: 4,
                      }}
                      disabled={placing}
                    >
                      {placing ? (
                        <span className="d-flex
                          align-items-center
                          justify-content-center gap-2">
                          <span className="spinner-border
                            spinner-border-sm" />
                          Placing Order...
                        </span>
                      ) : `Place Order — ${formatCurrency(totalAmount)}`}
                    </button>

                    <p style={{
                      fontSize: 11, color: '#878787',
                      textAlign: 'center', marginTop: 10,
                      marginBottom: 0,
                    }}>
                      By placing this order you agree to our
                      Terms & Conditions.
                    </p>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default CheckoutPage;