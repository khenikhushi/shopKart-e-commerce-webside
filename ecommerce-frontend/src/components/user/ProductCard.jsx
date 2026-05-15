import { useNavigate } from 'react-router-dom';
import { calculateDiscount, formatCurrency } from '../../utils/format.util';
import { resolveImageUrl } from '../../utils/image.util';

const ProductCard = ({ product, onAddToCart, addingId, canPurchase = false }) => {
  const navigate = useNavigate();
  const discount = calculateDiscount(
    product.price,
    product.mrp
  );

  const imageSrc = resolveImageUrl(product.thumbnail_url);
  const ratingValue = Number.parseFloat(product.rating ?? 4.3);
  const rating = Number.isFinite(ratingValue)
    ? ratingValue.toFixed(1)
    : '4.3';

  const isOutOfStock = product.stock === 0;
  const isAdding = addingId === product.id;
  const disablePurchase = isOutOfStock || isAdding;

  return (
    <div
      className="product-card"
      onClick={() =>
        navigate(`/products/${product.slug}`)
      }
    >
      {imageSrc ? (
        <img
          key={imageSrc}
          src={imageSrc}
          alt={product.name}
          className="product-card-image"
          style={{ display: 'block' }}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      ) : null}
      <div
        className="product-card-image-placeholder"
        style={{
          display: imageSrc ? 'none' : 'flex',
        }}
      >
        IMG
      </div>

      <div className="product-card-body">
        {product.brand && (
          <div className="product-card-brand">
            {product.brand}
          </div>
        )}

        <div className="product-card-name">
          {product.name}
        </div>

        <div className="product-card-rating">
          <span className="product-card-rating-badge">{rating} *</span>
          <span className="product-card-rating-text">Verified product</span>
        </div>

        <div className="product-card-price">
          {formatCurrency(product.price)}
        </div>

        {product.mrp && discount > 0 && (
          <div>
            <span className="product-card-mrp">
              {formatCurrency(product.mrp)}
            </span>
            <span className="product-card-discount">
              {discount}% off
            </span>
          </div>
        )}

        {isOutOfStock && (
          <div className="product-card-stock-out">
            Out of Stock
          </div>
        )}

        {!canPurchase && (
          <div className="product-card-login-note">
            Login to purchase
          </div>
        )}

        <div className="product-card-add-btn">
          <button
            className="btn btn-sm w-100"
            style={{
              background: disablePurchase
                ? '#f1f3f6'
                : 'var(--accent)',
              color: disablePurchase
                ? '#878787'
                : 'white',
              border: 'none',
              borderRadius: 4,
              fontWeight: 600,
              fontSize: 13,
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (disablePurchase) {
                return;
              }

              if (!canPurchase) {
                navigate('/login');
                return;
              }

              if (onAddToCart) {
                onAddToCart(product);
              }
            }}
            disabled={disablePurchase}
          >
            {isAdding ? (
              <span className="d-flex align-items-center justify-content-center gap-1">
                <span className="spinner-border spinner-border-sm" />
                Adding...
              </span>
            ) : isOutOfStock
              ? 'Out of Stock'
              : canPurchase
                ? '+ Add to Cart'
                : 'Login to buy'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
