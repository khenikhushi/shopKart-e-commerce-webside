import {
  formatCurrency,
  formatDateTime,
  formatOrderStatus,
} from '../../utils/format.util';

const STATUS_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['shipped', 'cancelled'],
  shipped: ['out_for_delivery'],
  out_for_delivery: ['delivered'],
  delivered: [],
  cancelled: [],
};

const AdminOrderTable = ({
  orders,
  page,
  limit,
  onViewDetail,
  onStatusUpdate,
  updatingSlug,
  statusLoading,
}) => {
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
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order, idx) => (
            <tr key={order.id}>
              <td style={{ color: '#878787' }}>
                {(page - 1) * limit + idx + 1}
              </td>

              {/* Order slug — clickable */}
              <td>
                <button
                  className="btn btn-link p-0"
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: 'var(--primary)',
                    fontFamily: 'monospace',
                  }}
                  onClick={() => onViewDetail(order.slug)}
                >
                  {order.slug}
                </button>
              </td>

              <td style={{ fontSize: 13 }}>
                {order.user?.name || '—'}
              </td>

              <td style={{ fontSize: 13, color: '#878787' }}>
                {order.items?.length || 0} item(s)
              </td>

              <td>
                <strong>
                  {formatCurrency(order.total_amount)}
                </strong>
              </td>

              <td>
                <span
                  style={{
                    fontSize: 12,
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    color: '#878787',
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

              <td style={{ fontSize: 12, color: '#878787' }}>
                {formatDateTime(order.created_at)}
              </td>

              {/* Actions */}
              <td>
                <div className="d-flex gap-1 align-items-center">
                  <button
                    className="action-btn"
                    onClick={() => onViewDetail(order.slug)}
                    title="View detail"
                  >
                    👁️
                  </button>

                  {/* Status dropdown */}
                  {STATUS_TRANSITIONS[order.status]?.length >
                    0 && (
                    <select
                      className="form-select form-select-sm"
                      style={{
                        fontSize: 11,
                        width: 'auto',
                        minWidth: 120,
                      }}
                      value=""
                      disabled={
                        statusLoading &&
                        updatingSlug === order.slug
                      }
                      onChange={(e) => {
                        if (e.target.value) {
                          onStatusUpdate(
                            order.slug,
                            e.target.value
                          );
                        }
                      }}
                    >
                      <option value="">Update status</option>
                      {STATUS_TRANSITIONS[order.status].map(
                        (s) => (
                          <option key={s} value={s}>
                            → {formatOrderStatus(s)}
                          </option>
                        )
                      )}
                    </select>
                  )}

                  {statusLoading &&
                    updatingSlug === order.slug && (
                    <span className="spinner-border spinner-border-sm text-primary" />
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminOrderTable;