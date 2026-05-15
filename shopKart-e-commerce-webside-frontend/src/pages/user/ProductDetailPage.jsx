import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import productApi from '../../api/product.api';
import cartApi from '../../api/cart.api';
import useCart from '../../hooks/useCart';
import useAuth from '../../hooks/useAuth';
import {
  formatCurrency,
  calculateDiscount,
} from '../../utils/format.util';
import {
  resolveImageUrl,
  resolveImageGallery,
} from '../../utils/image.util';
import '../../styles/product-card.css';

const ProductDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { refreshCart } = useCart();
  const { isUser, isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [imageLoadFailed, setImageLoadFailed] = useState(false);

  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success',
  });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(
      () => setToast({
        show: false,
        message: '',
        type: 'success',
      }),
      3000
    );
  };

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await productApi.getBySlug(slug);
        setProduct(res.data.data.product);
      } catch (err) {
        setError(
          err.response?.data?.message ||
          'Product not found.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  const canPurchase = isAuthenticated() && isUser();

  const handleAddToCart = async (buyNow = false) => {
    if (!canPurchase) {
      navigate('/login');
      return;
    }

    if (buyNow) {
      navigate(
        `/checkout?buy_now=true&slug=${encodeURIComponent(
          slug
        )}&quantity=${quantity}`
      );
      return;
    }

    setAddingToCart(true);

    try {
      await cartApi.addItem({
        product_id: product.id,
        quantity,
      });
      await refreshCart();
      showToast(`"${product.name}" added to cart!`);
    } catch (err) {
      showToast(
        err.response?.data?.message ||
        'Failed to add to cart.',
        'error'
      );
    } finally {
      setAddingToCart(false);
    }
  };

  const discount = product
    ? calculateDiscount(product.price, product.mrp)
    : 0;
  const productImages = resolveImageGallery(
    product?.image_urls,
    product?.thumbnail_url
  );
  const productImage = selectedImage || productImages[0] || '';

  useEffect(() => {
    setSelectedImage(productImages[0] || '');
    setImageLoadFailed(false);
  }, [product?.id, product?.thumbnail_url, productImages.join('|')]);

  return (
    <>
      <Navbar />

      <div className="page-wrapper">
        <div className="container">
          {loading && (
            <Loader fullPage text="Loading product..." />
          )}

          {error && (
            <ErrorMessage
              message={error}
              fullPage
              onRetry={() => {
                setLoading(true);
                setError('');
                productApi
                  .getBySlug(slug)
                  .then((res) => {
                    setProduct(res.data.data.product);
                    setLoading(false);
                  })
                  .catch(() => setLoading(false));
              }}
            />
          )}

          {!loading && !error && product && (
            <>
              <nav className="mb-3">
                <ol className="breadcrumb" style={{ fontSize: 13 }}>
                  <li className="breadcrumb-item">
                    <button
                      type="button"
                      className="btn btn-link p-0"
                      style={{ fontSize: 13 }}
                      onClick={() => navigate('/products')}
                    >
                      Products
                    </button>
                  </li>
                  {product.subCategory && (
                    <li className="breadcrumb-item">
                      <button
                        type="button"
                        className="btn btn-link p-0"
                        style={{ fontSize: 13 }}
                        onClick={() =>
                          navigate(
                            `/products?subcategory=${product.subCategory.slug}`
                          )
                        }
                      >
                        {product.subCategory.name}
                      </button>
                    </li>
                  )}
                  <li
                    className="breadcrumb-item active"
                    style={{
                      maxWidth: 200,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {product.name}
                  </li>
                </ol>
              </nav>

              <div className="row g-4">
                <div className="col-md-5">
                  {productImage && !imageLoadFailed ? (
                    <img
                      key={productImage}
                      src={productImage}
                      alt={product.name}
                      className="product-detail-image"
                      style={{ display: 'block' }}
                      onError={(e) => {
                        setImageLoadFailed(true);
                      }}
                    />
                  ) : null}
                  <div
                    className="product-detail-placeholder"
                    style={{
                      display: productImage && !imageLoadFailed
                        ? 'none'
                        : 'flex',
                    }}
                  >
                    IMG
                  </div>
                  {productImages.length > 1 && (
                    <div style={{
                      display: 'flex',
                      gap: 10,
                      flexWrap: 'wrap',
                      marginTop: 12,
                    }}>
                      {productImages.map((imageSrc, index) => (
                        <button
                          key={`${imageSrc}-${index}`}
                          type="button"
                          onClick={() => {
                            setSelectedImage(imageSrc);
                            setImageLoadFailed(false);
                          }}
                          style={{
                            width: 72,
                            height: 72,
                            borderRadius: 8,
                            overflow: 'hidden',
                            border: imageSrc === productImage
                              ? '2px solid var(--accent)'
                              : '1px solid #dfe3eb',
                            padding: 0,
                            background: 'white',
                          }}
                        >
                          <img
                            src={imageSrc}
                            alt={`${product.name} ${index + 1}`}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              display: 'block',
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="col-md-7">
                  {product.brand && (
                    <div
                      style={{
                        fontSize: 13,
                        color: '#878787',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        marginBottom: 6,
                      }}
                    >
                      {product.brand}
                    </div>
                  )}

                  <h1
                    style={{
                      fontSize: 22,
                      fontWeight: 700,
                      lineHeight: 1.3,
                      marginBottom: 12,
                    }}
                  >
                    {product.name}
                  </h1>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      marginBottom: 16,
                    }}
                  >
                    <span
                      style={{
                        background: '#26a541',
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: 4,
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                    >
                      4.3 *
                    </span>
                    <span style={{ fontSize: 13, color: '#878787' }}>
                      Verified Seller
                    </span>
                  </div>

                  <div
                    style={{
                      background: '#f8f9fa',
                      borderRadius: 8,
                      padding: 16,
                      marginBottom: 16,
                    }}
                  >
                    <div className="product-price-large">
                      {formatCurrency(product.price)}
                    </div>
                    {product.mrp && discount > 0 && (
                      <div style={{ marginTop: 4 }}>
                        <span className="product-card-mrp" style={{ fontSize: 14 }}>
                          M.R.P: {formatCurrency(product.mrp)}
                        </span>
                        <span
                          style={{
                            color: '#26a541',
                            fontWeight: 700,
                            fontSize: 14,
                          }}
                        >
                          ({discount}% off)
                        </span>
                      </div>
                    )}
                    <div
                      style={{
                        fontSize: 12,
                        color: '#26a541',
                        marginTop: 6,
                        fontWeight: 600,
                      }}
                    >
                      Inclusive of all taxes
                    </div>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    {product.stock === 0 ? (
                      <span
                        style={{
                          color: '#ff6161',
                          fontWeight: 700,
                          fontSize: 15,
                        }}
                      >
                        Out of Stock
                      </span>
                    ) : (
                      <span
                        style={{
                          color: '#26a541',
                          fontWeight: 600,
                          fontSize: 14,
                        }}
                      >
                        In Stock ({product.stock} available)
                      </span>
                    )}
                  </div>

                  {product.stock > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        marginBottom: 20,
                      }}
                    >
                      <span style={{ fontSize: 14, fontWeight: 600 }}>Qty:</span>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          border: '1px solid #ccc',
                          borderRadius: 4,
                          overflow: 'hidden',
                        }}
                      >
                        <button
                          type="button"
                          style={{
                            width: 36,
                            height: 36,
                            border: 'none',
                            background: '#f1f3f6',
                            cursor: 'pointer',
                            fontSize: 16,
                          }}
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          disabled={quantity <= 1}
                        >
                          -
                        </button>
                        <span
                          style={{
                            width: 40,
                            textAlign: 'center',
                            fontSize: 15,
                            fontWeight: 600,
                          }}
                        >
                          {quantity}
                        </span>
                        <button
                          type="button"
                          style={{
                            width: 36,
                            height: 36,
                            border: 'none',
                            background: '#f1f3f6',
                            cursor: 'pointer',
                            fontSize: 16,
                          }}
                          onClick={() =>
                            setQuantity(Math.min(product.stock, quantity + 1))
                          }
                          disabled={quantity >= product.stock}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="d-flex gap-3 flex-wrap">
                    <button
                      type="button"
                      className="add-to-cart-btn"
                      onClick={() => handleAddToCart(false)}
                      disabled={product.stock === 0 || addingToCart}
                    >
                      {addingToCart ? (
                        <span className="d-flex align-items-center gap-2">
                          <span className="spinner-border spinner-border-sm" />
                          Adding...
                        </span>
                      ) : canPurchase ? 'Add to Cart' : 'Login to purchase'}
                    </button>

                    <button
                      type="button"
                      className="buy-now-btn"
                      onClick={() => handleAddToCart(true)}
                      disabled={product.stock === 0 || addingToCart}
                    >
                      {canPurchase ? 'Buy Now' : 'Login to order'}
                    </button>
                  </div>

                  {!canPurchase && (
                    <div
                      style={{
                        marginTop: 10,
                        fontSize: 13,
                        color: '#878787',
                        fontWeight: 600,
                      }}
                    >
                      Login to purchase
                    </div>
                  )}

                  {product.filters?.length > 0 && (
                    <div style={{ marginTop: 20 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          marginBottom: 8,
                          color: '#444',
                        }}
                      >
                        Specifications
                      </div>
                      <div>
                        {product.filters.map((filter) =>
                          filter.values?.map((val) => (
                            <span key={val.id} className="filter-tag">
                              {filter.display_name}: {val.value}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  <div
                    style={{
                      marginTop: 20,
                      padding: '12px',
                      background: '#f8f9fa',
                      borderRadius: 6,
                      fontSize: 13,
                    }}
                  >
                    <strong>Sold by: </strong>
                    {product.seller?.name || 'shopKart Seller'}
                    <span
                      style={{
                        marginLeft: 8,
                        color: '#26a541',
                        fontWeight: 600,
                      }}
                    >
                      Verified
                    </span>
                  </div>
                </div>
              </div>

              {product.description && (
                <div
                  style={{
                    marginTop: 32,
                    background: 'white',
                    borderRadius: 8,
                    padding: 24,
                    boxShadow: 'var(--card-shadow)',
                  }}
                >
                  <h3
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      marginBottom: 12,
                      paddingBottom: 12,
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    Product Description
                  </h3>
                  <p
                    style={{
                      fontSize: 14,
                      lineHeight: 1.8,
                      color: '#444',
                      margin: 0,
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {product.description}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Footer />

      {toast.show && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 9999,
            background: toast.type === 'success' ? '#26a541' : '#ff6161',
            color: 'white',
            padding: '12px 20px',
            borderRadius: 6,
            fontSize: 14,
            fontWeight: 600,
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          }}
        >
          {toast.type === 'success' ? 'Success:' : 'Error:'} {toast.message}
        </div>
      )}
    </>
  );
};

export default ProductDetailPage;
