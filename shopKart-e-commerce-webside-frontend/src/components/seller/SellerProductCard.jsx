import { useNavigate } from 'react-router-dom';
import {
  formatCurrency,
  formatDate,
} from '../../utils/format.util';
import { resolveImageUrl } from '../../utils/image.util';

const SellerProductCard = ({ product, onDelete }) => {
  const navigate = useNavigate();
  const imageSrc = resolveImageUrl(product.thumbnail_url);

  const stockColor =
    product.stock === 0
      ? '#ff6161'
      : product.stock < 5
      ? '#ff9f00'
      : '#26a541';

  return (
    <div
      style={{
        background: 'white',
        borderRadius: 8,
        boxShadow: 'var(--card-shadow)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        border: '1px solid transparent',
        transition: 'border-color 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor =
          'var(--primary)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'transparent';
      }}
    >
      {/* Product image */}
      <div
        style={{
          width: '100%',
          aspectRatio: '4/3',
          background: '#f8f9fa',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={product.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              padding: 8,
            }}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div
          style={{
            fontSize: 40,
            display: imageSrc ? 'none' : 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
          }}
        >
          📦
        </div>
      </div>

      {/* Card body */}
      <div
        style={{
          padding: '12px 14px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}
      >
        {/* Status badge */}
        <div>
          <span
            className={`status-badge ${
              product.is_active
                ? 'badge-active'
                : 'badge-inactive'
            }`}
            style={{ fontSize: 10 }}
          >
            {product.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>

        {/* Brand */}
        {product.brand && (
          <div
            style={{
              fontSize: 11,
              color: '#878787',
              textTransform: 'uppercase',
              fontWeight: 600,
              letterSpacing: 0.5,
            }}
          >
            {product.brand}
          </div>
        )}

        {/* Name */}
        <div
          style={{
            fontWeight: 600,
            fontSize: 13,
            lineHeight: 1.4,
            color: 'var(--text-primary)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {product.name}
        </div>

        {/* SubCategory */}
        <div
          style={{
            fontSize: 11,
            color: '#878787',
          }}
        >
          {product.subCategory?.name || '—'}
        </div>

        {/* Price */}
        <div
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: 'var(--primary)',
          }}
        >
          {formatCurrency(product.price)}
        </div>

        {/* MRP */}
        {product.mrp && (
          <div style={{ fontSize: 12, color: '#878787' }}>
            MRP:{' '}
            <span style={{ textDecoration: 'line-through' }}>
              {formatCurrency(product.mrp)}
            </span>
          </div>
        )}

        {/* Stock */}
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: stockColor,
          }}
        >
          {product.stock === 0
            ? '⚠️ Out of Stock'
            : product.stock < 5
            ? `⚠️ Low Stock: ${product.stock}`
            : `✅ Stock: ${product.stock}`}
        </div>

        {/* Created date */}
        <div
          style={{
            fontSize: 11,
            color: '#aaa',
            marginTop: 'auto',
            paddingTop: 6,
            borderTop: '1px solid #f0f0f0',
          }}
        >
          Added {formatDate(product.created_at)}
        </div>
      </div>

      {/* Action buttons */}
      <div
        style={{
          display: 'flex',
          borderTop: '1px solid #f0f0f0',
        }}
      >
        <button
          style={{
            flex: 1,
            padding: '10px 0',
            background: 'none',
            border: 'none',
            borderRight: '1px solid #f0f0f0',
            cursor: 'pointer',
            fontSize: 13,
            color: 'var(--primary)',
            fontWeight: 600,
            transition: 'background 0.15s',
          }}
          onClick={() =>
            navigate(
              `/seller/products/edit/${product.slug}`
            )
          }
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#f0f4ff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'none';
          }}
        >
          ✏️ Edit
        </button>
        <button
          style={{
            flex: 1,
            padding: '10px 0',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 13,
            color: '#ff6161',
            fontWeight: 600,
            transition: 'background 0.15s',
          }}
          onClick={() => onDelete(product.slug)}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#fff0f0';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'none';
          }}
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  );
};

export default SellerProductCard;
