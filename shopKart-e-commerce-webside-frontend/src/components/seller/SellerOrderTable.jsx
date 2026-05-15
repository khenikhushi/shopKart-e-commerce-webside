import {
  formatCurrency,
  formatDateTime,
  formatOrderStatus,
} from '../../utils/format.util';

const SellerOrderTable = ({ orders, page, limit, onView }) => {
  if (!orders || orders.length === 0) return null;

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="data-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Items</th>
            <th>Total</th>
            <th>Payment</th>
            <th>Status</th>
            <th>Date</th>
            <th>Detail</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order, idx) => (
            <tr key={order.id}>
              <td style={{ color: '#878787' }}>
                {(page - 1) * limit + idx + 1}
              </td>

              {/* Order slug */}
              <td>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: 'var(--primary)',
                    fontFamily: 'monospace',
                  }}
                >
                  {order.slug}
                </span>
              </td>

              {/* Customer name */}
              <td>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: '#e8f0fe',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 11,
                      fontWeight: 700,
                      color: 'var(--primary)',
                      flexShrink: 0,
                    }}
                  >
                    {order.user?.name
                      ?.charAt(0)
                      ?.toUpperCase() || '?'}
                  </div>
                  <span style={{ fontSize: 13 }}>
                    {order.user?.name || '—'}
                  </span>
                </div>
              </td>

              {/* Items count */}
              <td>
                <span
                  style={{
                    background: '#f0f4ff',
                    color: 'var(--primary)',
                    padding: '2px 8px',
                    borderRadius: 10,
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {order.items?.length || 0} item(s)
                </span>
              </td>

              {/* Total */}
              <td>
                <strong style={{ fontSize: 14 }}>
                  {formatCurrency(order.total_amount)}
                </strong>
              </td>

              {/* Payment method */}
              <td>
                <span
                  style={{
                    fontSize: 11,
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    background:
                      order.payment_method === 'cod'
                        ? '#fff3cd'
                        : '#cfe2ff',
                    color:
                      order.payment_method === 'cod'
                        ? '#856404'
                        : '#084298',
                    padding: '2px 8px',
                    borderRadius: 8,
                  }}
                >
                  {order.payment_method}
                </span>
              </td>

              {/* Status badge */}
              <td>
                <span
                  className={`status-badge badge-${order.status}`}
                >
                  {formatOrderStatus(order.status)}
                </span>
              </td>

              {/* Date */}
              <td style={{ fontSize: 12, color: '#878787' }}>
                {formatDateTime(order.created_at)}
              </td>

              {/* View action */}
              <td>
                <button
                  className="action-btn"
                  onClick={() => onView(order.slug)}
                  title="View order detail"
                >
                  👁️ View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SellerOrderTable;