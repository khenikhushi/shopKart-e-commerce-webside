import { formatCurrency } from '../../utils/format.util';
import { resolveImageUrl } from '../../utils/image.util';

const CartItem = ({
  item,
  onIncrease,
  onDecrease,
  onRemove,
  updating,
}) => {
  const isUpdating = updating === item.id;
  const subtotal = parseFloat(item.product?.price || 0)
    * item.quantity;
  const imageSrc = resolveImageUrl(item.product?.thumbnail_url);

  return (
    <div style={{
      display: 'flex',
      gap: 16,
      padding: '16px 0',
      borderBottom: '1px solid #f0f0f0',
      alignItems: 'flex-start',
    }}>
      {/* Product image */}
      <div style={{
        width: 80, height: 80, flexShrink: 0,
        background: '#f8f9fa', borderRadius: 6,
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', border: '1px solid #eee',
        overflow: 'hidden',
      }}>
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={item.product?.name}
            style={{
              width: '100%', height: '100%',
              objectFit: 'contain', padding: 4,
            }}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
        ) : null}
        <span style={{
          fontSize: 28,
          display: imageSrc
            ? 'none' : 'block',
        }}>
          📦
        </span>
      </div>

      {/* Product info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontWeight: 600, fontSize: 14,
          marginBottom: 2, lineHeight: 1.3,
        }}>
          {item.product?.name || 'Product unavailable'}
        </div>
        {item.product?.brand && (
          <div style={{
            fontSize: 12, color: '#878787', marginBottom: 4,
          }}>
            {item.product.brand}
          </div>
        )}
        <div style={{
          fontSize: 16, fontWeight: 700, marginBottom: 8,
          color: 'var(--text-primary)',
        }}>
          {formatCurrency(item.product?.price || 0)}
        </div>

        {/* Quantity controls */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8, flexWrap: 'wrap',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center',
            border: '1px solid #ddd', borderRadius: 4,
            overflow: 'hidden',
          }}>
            <button
              style={{
                width: 32, height: 32, border: 'none',
                background: '#f1f3f6', cursor: 'pointer',
                fontSize: 16, display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onClick={() => onDecrease(item)}
              disabled={isUpdating || item.quantity <= 1}
            >
              −
            </button>
            <span style={{
              width: 36, textAlign: 'center',
              fontSize: 14, fontWeight: 600,
            }}>
              {isUpdating ? (
                <span className="spinner-border
                  spinner-border-sm" />
              ) : item.quantity}
            </span>
            <button
              style={{
                width: 32, height: 32, border: 'none',
                background: '#f1f3f6', cursor: 'pointer',
                fontSize: 16, display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onClick={() => onIncrease(item)}
              disabled={
                isUpdating ||
                item.quantity >= (item.product?.stock || 99)
              }
            >
              +
            </button>
          </div>

          <button
            style={{
              background: 'none', border: 'none',
              color: '#ff6161', cursor: 'pointer',
              fontSize: 12, fontWeight: 600, padding: 0,
            }}
            onClick={() => onRemove(item.id)}
            disabled={isUpdating}
          >
            Remove
          </button>
        </div>
      </div>

      {/* Subtotal */}
      <div style={{
        textAlign: 'right', flexShrink: 0,
      }}>
        <div style={{
          fontWeight: 700, fontSize: 15,
        }}>
          {formatCurrency(subtotal)}
        </div>
        {item.quantity > 1 && (
          <div style={{ fontSize: 11, color: '#878787' }}>
            {item.quantity} × {formatCurrency(
              item.product?.price || 0
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CartItem;
