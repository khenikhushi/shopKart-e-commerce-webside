import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import ProductCard from '../../components/user/ProductCard';
import storefrontApi from '../../api/storefront.api';
import cartApi from '../../api/cart.api';
import useCart from '../../hooks/useCart';
import useAuth from '../../hooks/useAuth';
import { formatCurrency } from '../../utils/format.util';
import { resolveImageUrl } from '../../utils/image.util';
import '../../styles/storefront.css';

const HomePage = () => {
  const navigate = useNavigate();
  const { refreshCart } = useCart();
  const { role, isAuthenticated, isUser } = useAuth();

  const [home, setHome] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSlide, setActiveSlide] = useState(0);
  const [addingId, setAddingId] = useState('');
  const [refreshSeed, setRefreshSeed] = useState(0);
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success',
  });
  const toastTimerRef = useRef(null);

  const canPurchase = isAuthenticated() && isUser();
  const heroSlides = home?.heroSlides || [];
  const featuredCategories = home?.featuredCategories || [];
  const dealSections = home?.dealSections || [];
  const trendingProducts = home?.trendingProducts || [];
  const budgetFinds = home?.budgetFinds || [];
  const featuredBrands = home?.featuredBrands || [];
  const activeHero = heroSlides[activeSlide] || null;
  const activeHeroImage = resolveImageUrl(activeHero?.imageUrl);
  const dealOfDayImage = resolveImageUrl(home?.dealOfDay?.thumbnail_url);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });

    window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  useEffect(() => {
    let isMounted = true;

    const loadStorefront = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await storefrontApi.getHome();
        if (!isMounted) {
          return;
        }

        setHome(response.data.data);
        setActiveSlide(0);
      } catch (err) {
        if (!isMounted) {
          return;
        }

        setError(
          err.response?.data?.message ||
          'Unable to load storefront right now.'
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadStorefront();

    return () => {
      isMounted = false;
      window.clearTimeout(toastTimerRef.current);
    };
  }, [refreshSeed]);

  useEffect(() => {
    if (heroSlides.length <= 1) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 5200);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [heroSlides.length]);

  const openCategory = (categoryId) => {
    navigate(`/products?categoryId=${categoryId}`);
  };

  const openBrand = (brandName) => {
    navigate(`/products?brand=${encodeURIComponent(brandName)}`);
  };

  const openProduct = (slug) => {
    navigate(`/products/${slug}`);
  };

  const goToPrimaryDestination = () => {
    if (role === 'admin') {
      navigate('/admin/dashboard');
      return;
    }

    if (role === 'seller') {
      navigate('/seller/dashboard');
      return;
    }

    if (role === 'user') {
      navigate('/orders');
      return;
    }

    navigate('/register');
  };

  const handleAddToCart = async (product) => {
    if (!canPurchase) {
      navigate('/login');
      return;
    }

    setAddingId(product.id);

    try {
      await cartApi.addItem({
        product_id: product.id,
        quantity: 1,
      });

      await refreshCart();
      showToast(`"${product.name}" added to cart.`);
    } catch (err) {
      showToast(
        err.response?.data?.message || 'Could not add item to cart.',
        'error'
      );
    } finally {
      setAddingId('');
    }
  };

  return (
    <>
      <Navbar />

      <div className="page-wrapper storefront-page">
        <div className="container">
          {loading && <Loader text="Loading storefront..." />}

          {error && (
            <ErrorMessage
              message={error}
              onRetry={() => setRefreshSeed((current) => current + 1)}
            />
          )}

          {!loading && !error && !home && (
            <EmptyState
              title="Storefront is empty"
              message="Add a few products and categories to bring your homepage to life."
              actionLabel="Browse Products"
              actionLink="/products"
              icon="Store"
            />
          )}

          {!loading && !error && home && (
            <>
              {activeHero && (
                <section className="storefront-hero">
                  <div
                    className="storefront-hero-panel"
                    style={{ background: activeHero.gradient }}
                  >
                    <div className="storefront-hero-copy">
                      <span className="storefront-badge">
                        {activeHero.eyebrow}
                      </span>
                      <h1>{activeHero.title}</h1>
                      <p>{activeHero.subtitle}</p>

                      <div className="storefront-hero-actions">
                        <button
                          type="button"
                          className="storefront-primary-btn"
                          onClick={() => openCategory(activeHero.categoryId)}
                        >
                          {activeHero.actionLabel}
                        </button>
                        <button
                          type="button"
                          className="storefront-secondary-btn"
                          onClick={goToPrimaryDestination}
                        >
                          {role === 'admin'
                            ? 'Open admin dashboard'
                            : role === 'seller'
                              ? 'Open seller dashboard'
                              : role === 'user'
                                ? 'View my orders'
                                : 'Create account'}
                        </button>
                      </div>

                      {activeHero.topBrands?.length > 0 && (
                        <div className="storefront-pill-row">
                          {activeHero.topBrands.map((brand) => (
                            <button
                              key={brand}
                              type="button"
                              className="storefront-pill light"
                              onClick={() => openBrand(brand)}
                            >
                              {brand}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="storefront-hero-media">
                      {activeHeroImage ? (
                        <>
                          <img
                            key={activeHeroImage}
                            src={activeHeroImage}
                            alt={activeHero.title}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                          <div
                            className="storefront-hero-placeholder"
                            style={{ display: 'none' }}
                          >
                            {activeHero.title.slice(0, 2)}
                          </div>
                        </>
                      ) : (
                        <div className="storefront-hero-placeholder">
                          {activeHero.title.slice(0, 2)}
                        </div>
                      )}
                    </div>

                    {heroSlides.length > 1 && (
                      <>
                        <button
                          type="button"
                          className="storefront-hero-arrow left"
                          onClick={() =>
                            setActiveSlide((current) =>
                              current === 0 ? heroSlides.length - 1 : current - 1
                            )
                          }
                          aria-label="Previous slide"
                        >
                          {'<'}
                        </button>
                        <button
                          type="button"
                          className="storefront-hero-arrow right"
                          onClick={() =>
                            setActiveSlide((current) =>
                              (current + 1) % heroSlides.length
                            )
                          }
                          aria-label="Next slide"
                        >
                          {'>'}
                        </button>
                      </>
                    )}
                  </div>

                  <div className="storefront-hero-sidebar">
                    <div className="storefront-side-card dark">
                      <span className="storefront-side-label">Live catalog</span>
                      <strong>{home.stats?.totalProducts || 0}+ products</strong>
                      <p>Real products, real categories, and shared cart flow.</p>
                    </div>
                    <div className="storefront-side-card warm">
                      <span className="storefront-side-label">Featured brands</span>
                      <strong>{home.stats?.totalBrands || 0} brands</strong>
                      <p>Browse collections directly from the brands customers know.</p>
                    </div>
                    <div className="storefront-dots">
                      {heroSlides.map((slide, index) => (
                        <button
                          key={slide.id}
                          type="button"
                          className={`storefront-dot ${index === activeSlide ? 'active' : ''}`}
                          onClick={() => setActiveSlide(index)}
                          aria-label={`Go to ${slide.title}`}
                        />
                      ))}
                    </div>
                  </div>
                </section>
              )}

              <section className="storefront-section">
                <div className="storefront-section-head">
                  <div>
                    <span className="storefront-kicker">Top collections</span>
                    <h2>Shop by category</h2>
                  </div>
                  <button
                    type="button"
                    className="storefront-text-btn"
                    onClick={() => navigate('/products')}
                  >
                    See all products
                  </button>
                </div>

                <div className="storefront-category-grid">
                  {featuredCategories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      className="storefront-category-card"
                      onClick={() => openCategory(category.id)}
                    >
                      <div className="storefront-category-media">
                        {resolveImageUrl(category.image_url) ? (
                          <>
                            <img
                              key={resolveImageUrl(category.image_url)}
                              src={resolveImageUrl(category.image_url)}
                              alt={category.name}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                            <div
                              className="storefront-category-placeholder"
                              style={{ display: 'none' }}
                            >
                              {category.name.slice(0, 1)}
                            </div>
                          </>
                        ) : (
                          <div className="storefront-category-placeholder">
                            {category.name.slice(0, 1)}
                          </div>
                        )}
                      </div>
                      <div className="storefront-category-copy">
                        <h3>{category.name}</h3>
                        <p>{category.description}</p>
                        <div className="storefront-category-meta">
                          <span>{category.productCount} products</span>
                          <span>{category.subCategoryCount} collections</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              <section className="storefront-spotlight-grid">
                <div className="storefront-deal-card">
                  <span className="storefront-kicker">Deal of the day</span>
                  <h2>{home.dealOfDay?.name || 'Top pick from the catalog'}</h2>
                  <p>
                    {home.dealOfDay?.brand
                      ? `Featured brand: ${home.dealOfDay.brand}`
                      : 'Hand-picked from your latest active products.'}
                  </p>

                  {home.dealOfDay && (
                    <div className="storefront-deal-content">
                      <button
                        type="button"
                        className="storefront-deal-media"
                        onClick={() => openProduct(home.dealOfDay.slug)}
                      >
                        {dealOfDayImage ? (
                          <>
                            <img
                              key={dealOfDayImage}
                              src={dealOfDayImage}
                              alt={home.dealOfDay.name}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                            <div
                              className="storefront-category-placeholder"
                              style={{ display: 'none' }}
                            >
                              {home.dealOfDay.name.slice(0, 1)}
                            </div>
                          </>
                        ) : (
                          <div className="storefront-category-placeholder">
                            {home.dealOfDay.name.slice(0, 1)}
                          </div>
                        )}
                      </button>

                      <div className="storefront-deal-copy">
                        <strong>{formatCurrency(home.dealOfDay.price)}</strong>
                        <span>
                          {home.dealOfDay.mrp
                            ? `MRP ${formatCurrency(home.dealOfDay.mrp)}`
                            : 'Fresh marketplace price'}
                        </span>
                        <button
                          type="button"
                          className="storefront-primary-btn"
                          onClick={() => openProduct(home.dealOfDay.slug)}
                        >
                          View product
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="storefront-budget-card">
                  <span className="storefront-kicker">Budget buys</span>
                  <h2>Affordable products to move faster</h2>
                  <div className="storefront-mini-list">
                    {budgetFinds.map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        className="storefront-mini-item"
                        onClick={() => openProduct(product.slug)}
                      >
                        <span className="storefront-mini-name">{product.name}</span>
                        <span className="storefront-mini-price">
                          {formatCurrency(product.price)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="storefront-brand-card">
                  <span className="storefront-kicker">Featured brands</span>
                  <h2>Popular searches from your catalog</h2>
                  <div className="storefront-pill-row">
                    {featuredBrands.map((brand) => (
                      <button
                        key={brand.name}
                        type="button"
                        className="storefront-pill"
                        onClick={() => openBrand(brand.name)}
                      >
                        {brand.name}
                        <span>{brand.productCount}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              {dealSections.map((section) => (
                <section key={section.id} className="storefront-section">
                  <div className="storefront-section-head">
                    <div>
                      <span className="storefront-kicker">{section.categoryName}</span>
                      <h2>{section.title}</h2>
                      <p>{section.subtitle}</p>
                    </div>
                    <button
                      type="button"
                      className="storefront-text-btn"
                      onClick={() => openCategory(section.categoryId)}
                    >
                      Explore {section.categoryName}
                    </button>
                  </div>

                  <div className="row g-3">
                    {section.items.map((product) => (
                      <div
                        key={product.id}
                        className="col-6 col-md-4 col-xl-3"
                      >
                        <ProductCard
                          product={product}
                          onAddToCart={handleAddToCart}
                          addingId={addingId}
                          canPurchase={canPurchase}
                        />
                      </div>
                    ))}
                  </div>
                </section>
              ))}

              <section className="storefront-section">
                <div className="storefront-section-head">
                  <div>
                    <span className="storefront-kicker">New arrivals</span>
                    <h2>Recently added products</h2>
                    <p>Fresh inventory from your current sellers and categories.</p>
                  </div>
                </div>

                <div className="row g-3">
                  {trendingProducts.map((product) => (
                    <div
                      key={product.id}
                      className="col-6 col-md-4 col-xl-3"
                    >
                      <ProductCard
                        product={product}
                        onAddToCart={handleAddToCart}
                        addingId={addingId}
                        canPurchase={canPurchase}
                      />
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </div>

      <Footer />

      {toast.show && (
        <div
          className={`storefront-toast ${toast.type === 'error' ? 'error' : ''}`}
        >
          {toast.message}
        </div>
      )}
    </>
  );
};

export default HomePage;
