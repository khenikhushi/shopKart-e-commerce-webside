import { useState, useEffect, useRef } from 'react';
import Navbar from '../../components/common/Navbar';
import AdminSidebar from '../../components/admin/AdminSidebar';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import orderApi from '../../api/order.api';
import {
  formatCurrency,
  formatDateTime,
  formatOrderStatus,
  getStatusBadgeColor,
} from '../../utils/format.util';
import '../../styles/sidebar.css';
import '../../styles/dashboard.css';

const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'shipped',
  'out_for_delivery',
  'delivered',
  'cancelled',
];

const STATUS_TRANSITIONS = {
  // pending: ['confirmed', 'cancelled'],
  // confirmed: ['shipped', 'cancelled'],
  shipped: ['out_for_delivery', 'cancelled'],
  out_for_delivery: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};

const AdminOrdersPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 10;

  const [filterStatus, setFilterStatus] = useState('');

  // Detail modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  // Status update
  const [updatingSlug, setUpdatingSlug] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);

  // Toast
  const [toast, setToast] = useState({
    show: false, message: '', type: 'success',
  });

  // Bootstrap modal refs
  const detailModalRef = useRef(null);
  const bsDetailModalRef = useRef(null);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(
      () => setToast({
        show: false, message: '', type: 'success',
      }),
      3000
    );
  };

  // ── Fetch orders ──────────────────────────────────────
  const fetchOrders = async (currentPage = page) => {
    setLoading(true);
    setError('');
    try {
      const params = { page: currentPage, limit };
      if (filterStatus) params.status = filterStatus;
      const res = await orderApi.getAllAdmin(params);
      setOrders(res.data.data.orders);
      setTotalPages(res.data.pagination.totalPages);
      setTotalItems(res.data.pagination.totalItems);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to load orders.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(page);
  }, [page, filterStatus]);

  // ── Bootstrap modal init ──────────────────────────────
  useEffect(() => {
    const el = detailModalRef.current;
    if (!el) return;
    import('bootstrap').then(({ Modal }) => {
      bsDetailModalRef.current =
        Modal.getOrCreateInstance(el);
    });
  }, []);

  useEffect(() => {
    if (!bsDetailModalRef.current) return;
    if (detailModalOpen) bsDetailModalRef.current.show();
    else bsDetailModalRef.current.hide();
  }, [detailModalOpen]);

  // ── Open order detail modal ───────────────────────────
  const openDetailModal = async (slug) => {
    setDetailLoading(true);
    setDetailModalOpen(true);
    setSelectedOrder(null);
    try {
      const res = await orderApi.getOrderAdmin(slug);
      setSelectedOrder(res.data.data.order);
    } catch (err) {
      showToast(
        err.response?.data?.message ||
        'Failed to load order.',
        'error'
      );
      setDetailModalOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  // ── Update order status ───────────────────────────────
  const handleStatusUpdate = async (slug, newStatus) => {
    setUpdatingSlug(slug);
    setStatusLoading(true);
    try {
      await orderApi.updateStatusAdmin(slug, { status: newStatus });
      showToast(
        `Order status updated to "${formatOrderStatus(
          newStatus
        )}"!`
      );
      fetchOrders(page);

      // Update detail modal if open
      if (selectedOrder?.slug === slug) {
        setSelectedOrder((prev) =>
          prev ? { ...prev, status: newStatus } : null
        );
      }
    } catch (err) {
      showToast(
        err.response?.data?.message ||
        'Status update failed.',
        'error'
      );
    } finally {
      setStatusLoading(false);
      setUpdatingSlug('');
    }
  };

  return (
    <>
      <Navbar />
      <div className="admin-layout">
        <AdminSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="admin-content">
          <button
            className="sidebar-toggle-btn"
            onClick={() => setSidebarOpen(true)}
          >
            ☰ Menu
          </button>

          <div className="page-title">All Orders</div>
          <div className="page-subtitle">
            {totalItems} orders total
          </div>

          {/* Filter by status */}
          <div className="mb-3">
            <select
              className="form-select"
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPage(1);
              }}
              style={{ maxWidth: 220, fontSize: 13 }}
            >
              <option value="">All Statuses</option>
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {formatOrderStatus(s)}
                </option>
              ))}
            </select>
          </div>

          {loading && <Loader text="Loading orders..." />}
          {error && (
            <ErrorMessage
              message={error}
              onRetry={() => fetchOrders(page)}
            />
          )}

          {!loading && !error && (
            <>
              {orders.length === 0 ? (
                <EmptyState
                  title="No orders found"
                  message={filterStatus
                    ? `No orders with status "${formatOrderStatus(filterStatus)}".`
                    : 'No orders placed yet.'}
                  icon="🛒"
                />
              ) : (
                <div className="section-card p-0">
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
                            <td>
                              <button
                                className="btn btn-link p-0"
                                style={{
                                  fontSize: 12,
                                  fontWeight: 700,
                                  color: 'var(--primary)',
                                  fontFamily: 'monospace',
                                }}
                                onClick={() =>
                                  openDetailModal(order.slug)
                                }
                              >
                                {order.slug}
                              </button>
                            </td>
                            <td style={{ fontSize: 13 }}>
                              {order.user?.name || '—'}
                            </td>
                            <td style={{
                              fontSize: 13,
                              color: '#878787',
                            }}>
                              {order.items?.length || 0} item(s)
                            </td>
                            <td>
                              <strong>
                                {formatCurrency(
                                  order.total_amount
                                )}
                              </strong>
                            </td>
                            <td>
                              <span style={{
                                fontSize: 12,
                                textTransform: 'uppercase',
                                fontWeight: 600,
                                color: '#878787',
                              }}>
                                {order.payment_method}
                              </span>
                            </td>
                            <td>
                              <span className={`status-badge
                                badge-${getStatusBadgeColor(order.status)}`}>
                                {formatOrderStatus(
                                  order.status
                                )}
                              </span>
                            </td>
                            <td style={{
                              fontSize: 12, color: '#878787',
                            }}>
                              {formatDateTime(order.created_at)}
                            </td>
                            <td>
                              <div className="d-flex gap-1
                                align-items-center">
                                <button
                                  className="action-btn"
                                  onClick={() =>
                                    openDetailModal(order.slug)
                                  }
                                  title="View detail"
                                >
                                  👁️
                                </button>

                                {/* Status update dropdown */}
                                {STATUS_TRANSITIONS[
                                  order.status
                                ]?.length > 0 && (
                                  <select
                                    className="form-select
                                      form-select-sm"
                                    style={{
                                      fontSize: 11,
                                      width: 'auto',
                                      minWidth: 110,
                                    }}
                                    value=""
                                    disabled={
                                      statusLoading &&
                                      updatingSlug ===
                                        order.slug
                                    }
                                    onChange={(e) => {
                                      if (e.target.value) {
                                        handleStatusUpdate(
                                          order.slug,
                                          e.target.value
                                        );
                                      }
                                    }}
                                  >
                                    <option value="">
                                      Update status
                                    </option>
                                    {STATUS_TRANSITIONS[
                                      order.status
                                    ].map((s) => (
                                      <option
                                        key={s}
                                        value={s}
                                      >
                                        → {formatOrderStatus(s)}
                                      </option>
                                    ))}
                                  </select>
                                )}

                                {statusLoading &&
                                  updatingSlug ===
                                    order.slug && (
                                  <span className="spinner-border
                                    spinner-border-sm
                                    text-primary" />
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {totalPages > 1 && (
                <div className="mt-3">
                  <Pagination
                    page={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                    hasNext={page < totalPages}
                    hasPrev={page > 1}
                  />
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* ── Order Detail Modal ────────────────────────── */}
      <div
        className="modal fade"
        ref={detailModalRef}
        tabIndex="-1"
      >
        <div className="modal-dialog modal-dialog-centered
          modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                Order Detail —{' '}
                <span style={{
                  fontFamily: 'monospace',
                  color: 'var(--primary)',
                }}>
                  {selectedOrder?.slug || '...'}
                </span>
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setDetailModalOpen(false)}
              />
            </div>

            <div className="modal-body">
              {detailLoading && (
                <Loader text="Loading order details..." />
              )}

              {!detailLoading && selectedOrder && (
                <>
                  {/* Order Meta */}
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <div style={{
                        background: '#f8f9fa',
                        borderRadius: 6,
                        padding: 12,
                      }}>
                        <div style={{
                          fontSize: 11,
                          color: '#878787',
                          marginBottom: 4,
                          textTransform: 'uppercase',
                          fontWeight: 700,
                        }}>
                          Customer
                        </div>
                        <div style={{
                          fontWeight: 600, fontSize: 14,
                        }}>
                          {selectedOrder.user?.name}
                        </div>
                        <div style={{
                          fontSize: 12, color: '#878787',
                        }}>
                          {selectedOrder.user?.email}
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div style={{
                        background: '#f8f9fa',
                        borderRadius: 6,
                        padding: 12,
                      }}>
                        <div style={{
                          fontSize: 11,
                          color: '#878787',
                          marginBottom: 4,
                          textTransform: 'uppercase',
                          fontWeight: 700,
                        }}>
                          Order Info
                        </div>
                        <div style={{ fontSize: 13 }}>
                          <strong>Status: </strong>
                          <span className={`status-badge
                            badge-${getStatusBadgeColor(selectedOrder.status)}`}>
                            {formatOrderStatus(
                              selectedOrder.status
                            )}
                          </span>
                        </div>
                        <div style={{
                          fontSize: 12,
                          color: '#878787',
                          marginTop: 4,
                        }}>
                          {formatDateTime(
                            selectedOrder.created_at
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div style={{
                    background: '#f8f9fa',
                    borderRadius: 6,
                    padding: 12,
                    marginBottom: 16,
                  }}>
                    <div style={{
                      fontSize: 11,
                      color: '#878787',
                      marginBottom: 4,
                      textTransform: 'uppercase',
                      fontWeight: 700,
                    }}>
                      Shipping Address
                    </div>
                    <div style={{ fontSize: 13 }}>
                      {selectedOrder.shipping_address}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div style={{
                    fontSize: 13,
                    fontWeight: 700,
                    marginBottom: 8,
                  }}>
                    Items ({selectedOrder.items?.length})
                  </div>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Qty</th>
                        <th>Unit Price</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items?.map((item) => (
                        <tr key={item.id}>
                          <td style={{ fontWeight: 500 }}>
                            {item.product_name}
                          </td>
                          <td>{item.quantity}</td>
                          <td>
                            {formatCurrency(item.unit_price)}
                          </td>
                          <td>
                            <strong>
                              {formatCurrency(
                                item.unit_price *
                                item.quantity
                              )}
                            </strong>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Total */}
                  <div style={{
                    textAlign: 'right',
                    marginTop: 12,
                    padding: '10px 0',
                    borderTop: '2px solid #eee',
                  }}>
                    <span style={{
                      fontSize: 15, fontWeight: 700,
                    }}>
                      Total:{' '}
                      {formatCurrency(
                        selectedOrder.total_amount
                      )}
                    </span>
                  </div>

                  {/* Status update from modal */}
                  {STATUS_TRANSITIONS[
                    selectedOrder.status
                  ]?.length > 0 && (
                    <div style={{
                      marginTop: 12,
                      padding: 12,
                      background: '#f0f4ff',
                      borderRadius: 6,
                    }}>
                      <div style={{
                        fontSize: 12,
                        fontWeight: 600,
                        marginBottom: 8,
                        color: '#444',
                      }}>
                        Update Status
                      </div>
                      <div className="d-flex gap-2
                        flex-wrap">
                        {STATUS_TRANSITIONS[
                          selectedOrder.status
                        ].map((s) => (
                          <button
                            key={s}
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => {
                              handleStatusUpdate(
                                selectedOrder.slug, s
                              );
                              setSelectedOrder((prev) =>
                                prev
                                  ? { ...prev, status: s }
                                  : null
                              );
                            }}
                            disabled={statusLoading}
                          >
                            → {formatOrderStatus(s)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setDetailModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

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

export default AdminOrdersPage;