import { useState } from 'react';
import {
  formatCurrency,
  formatDateTime,
  formatOrderStatus,
} from '../../utils/format.util';
import { resolveImageUrl } from '../../utils/image.util';

const STATUS_COLORS = {
  pending: { bg: '#fff3cd', color: '#856404' },
  confirmed: { bg: '#cff4fc', color: '#055160' },
  shipped: { bg: '#cfe2ff', color: '#084298' },
  out_for_delivery: { bg: '#e2d9f3', color: '#432874' },
  delivered: { bg: '#d1e7dd', color: '#0a3622' },
  cancelled: { bg: '#f8d7da', color: '#842029' },
};

const OrderCard = ({ order, onCancel, cancelling }) => {
  const [expanded, setExpanded] = useState(false);
  const statusStyle = STATUS_COLORS[order.status] || {
    bg: '#f1f3f6', color: '#444',
  };
  const canCancel = ['pending', 'confirmed'].includes(
    order.status
  );

  const getProductImage = (item) => {
    return resolveImageUrl(item.product?.thumbnail_url);
  };

  return (
    <div style={{
      background: 'white', borderRadius: 8,
      boxShadow: 'var(--card-shadow)',
      marginBottom: 16, overflow: 'hidden',
    }}>
      {/* Order Header */}
      <div style={{
        padding: '14px 20px',
        background: '#f8f9fa',
        borderBottom: '1px solid #eee',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 8,
      }}>
        <div style={{ display: 'flex',
          alignItems: 'center', gap: 12,
          flexWrap: 'wrap' }}>
          <span style={{
            fontFamily: 'monospace', fontWeight: 700,
            fontSize: 13, color: 'var(--primary)',
          }}>
            {order.slug}
          </span>
          <span style={{
            background: statusStyle.bg,
            color: statusStyle.color,
            padding: '2px 10px', borderRadius: 10,
            fontSize: 12, fontWeight: 700,
          }}>
            {formatOrderStatus(order.status)}
          </span>
        </div>
        <div style={{
          fontSize: 12, color: '#878787',
        }}>
          {formatDateTime(order.created_at)}
        </div>
      </div>

      {/* Order Body */}
      <div style={{ padding: '16px 20px' }}>
        {/* Items preview */}
        <div style={{ marginBottom: 12 }}>
          {order.items?.slice(0, expanded ? 100 : 2)
            .map((item) => (
            <div
              key={item.id}
              style={{
                display: 'flex', gap: 12,
                marginBottom: 10,
                alignItems: 'center',
              }}
            >
              <div style={{
                width: 44, height: 44, flexShrink: 0,
                background: '#f8f9fa', borderRadius: 4,
                display: 'flex', alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #eee', fontSize: 18,
              }}>
                {getProductImage(item) ? (
                  <img
                    src={getProductImage(item)}
                    alt={item.product_name}
                    style={{
                      width: '100%', height: '100%',
                      objectFit: 'contain', padding: 2,
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : '📦'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: 13, fontWeight: 600,
                  marginBottom: 2,
                }}>
                  {item.product_name}
                </div>
                <div style={{
                  fontSize: 12, color: '#878787',
                }}>
                  Qty: {item.quantity} ×{' '}
                  {formatCurrency(item.unit_price)}
                </div>
              </div>
              <div style={{
                fontWeight: 700, fontSize: 13,
              }}>
                {formatCurrency(
                  item.unit_price * item.quantity
                )}
              </div>
            </div>
          ))}

          {order.items?.length > 2 && !expanded && (
            <button
              style={{
                background: 'none', border: 'none',
                color: 'var(--primary)', cursor: 'pointer',
                fontSize: 13, fontWeight: 600, padding: 0,
              }}
              onClick={() => setExpanded(true)}
            >
              + {order.items.length - 2} more item(s)
            </button>
          )}
          {expanded && order.items?.length > 2 && (
            <button
              style={{
                background: 'none', border: 'none',
                color: '#878787', cursor: 'pointer',
                fontSize: 12, padding: 0,
              }}
              onClick={() => setExpanded(false)}
            >
              Show less
            </button>
          )}
        </div>

        {/* Shipping address */}
        <div style={{
          fontSize: 12, color: '#878787',
          marginBottom: 12,
          borderTop: '1px solid #f0f0f0', paddingTop: 12,
        }}>
          <strong style={{ color: '#444' }}>
            Deliver to:{' '}
          </strong>
          {order.shipping_address?.substring(0, 80)}
          {order.shipping_address?.length > 80 && '...'}
        </div>

        {/* Footer row */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center', flexWrap: 'wrap', gap: 8,
        }}>
          <div>
            <span style={{
              fontSize: 11, color: '#878787',
              textTransform: 'uppercase', fontWeight: 600,
            }}>
              Total Amount:{' '}
            </span>
            <span style={{ fontWeight: 700, fontSize: 16 }}>
              {formatCurrency(order.total_amount)}
            </span>
            <span style={{
              marginLeft: 8, fontSize: 11,
              background: '#f1f3f6', color: '#666',
              padding: '1px 8px', borderRadius: 8,
              fontWeight: 600, textTransform: 'uppercase',
            }}>
              {order.payment_method}
            </span>
          </div>

          {canCancel && (
            <button
              style={{
                background: 'none',
                border: '1px solid #ff6161',
                color: '#ff6161', borderRadius: 4,
                padding: '4px 14px', fontSize: 13,
                cursor: 'pointer', fontWeight: 600,
                transition: 'all 0.15s',
              }}
              onClick={() => onCancel(order.slug)}
              disabled={cancelling === order.slug}
              onMouseEnter={(e) => {
                e.currentTarget.style.background =
                  '#ff6161';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'none';
                e.currentTarget.style.color = '#ff6161';
              }}
            >
              {cancelling === order.slug ? (
                <span className="spinner-border
                  spinner-border-sm" />
              ) : 'Cancel Order'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
