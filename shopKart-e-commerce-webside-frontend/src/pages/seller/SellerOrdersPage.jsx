import { useState, useEffect, useRef } from 'react';
import Navbar from '../../components/common/Navbar';
import SellerSidebar from '../../components/seller/SellerSidebar';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import orderApi from '../../api/order.api';
import {
  formatCurrency,
  formatDateTime,
  formatOrderStatus,
} from '../../utils/format.util';
import '../../styles/sidebar.css';
import '../../styles/dashboard.css';

const STATUS_TRANSITIONS = {
  pending: ['confirmed'],
  confirmed: ['shipped'],
  // Sellers don't handle out_for_delivery or delivered, so we leave them out
};

const SellerOrdersPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 10;

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailModalOpen, setDetailModalOpen] =
    useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const detailModalRef = useRef(null);
  const bsDetailModalRef = useRef(null);

  
  const [updatingSlug, setUpdatingSlug] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);

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

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleStatusUpdate = async (slug, newStatus) => {
  setUpdatingSlug(slug);
  setStatusLoading(true);
  try {
    // This calls your backend /api/v1/seller/orders/:slug/status
    await orderApi.updateStatusSeller(slug, { status: newStatus });
    showToast(
        `Order status updated to "${formatOrderStatus(
          newStatus
        )}"!`
      );
    // Refresh the list so the new status shows up
    fetchOrders(page); 
    
    alert(`Order updated to ${newStatus}`);
  } catch (err) {
    alert(err.response?.data?.message || 'Status update failed.');
  } finally {
    setStatusLoading(false);
    setUpdatingSlug('');
  }
  };

  const fetchOrders = async (currentPage = page) => {
    setLoading(true);
    setError('');
    try {
      const res = await orderApi.getSellerOrders({
        page: currentPage,
        limit,
      });
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
  }, [page]);

  const openDetailModal = async (slug) => {
    setDetailLoading(true);
    setDetailModalOpen(true);
    setSelectedOrder(null);
    try {
      const res = await orderApi.getSellerOrder(slug);
      setSelectedOrder(res.data.data.order);
    } catch {
      setDetailModalOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="admin-layout">
        <SellerSidebar
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

          <div className="page-title">My Orders</div>
          <div className="page-subtitle">
            {totalItems} orders for your products
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
                  title="No orders yet"
                  message="Orders for your products will appear here."
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
                          <th>Status</th>
                          <th>Date</th>
                          <th>Detail</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order, idx) => (
                          <tr key={order.id}>
                            <td style={{
                              color: '#878787',
                            }}>
                              {(page - 1) * limit + idx + 1}
                            </td>
                            <td>
                              <span style={{
                                fontSize: 12,
                                fontWeight: 700,
                                color: 'var(--primary)',
                                fontFamily: 'monospace',
                              }}>
                                {order.slug}
                              </span>
                            </td>
                            <td style={{ fontSize: 13 }}>
                              {order.user?.name || '—'}
                            </td>
                            <td style={{
                              fontSize: 13,
                              color: '#878787',
                            }}>
                              {order.items?.length || 0}
                            </td>
                            <td>
                              <strong>
                                {formatCurrency(
                                  order.total_amount
                                )}
                              </strong>
                            </td>
                            <td>
                              <span className={`status-badge
                                badge-${order.status}`}>
                                {formatOrderStatus(
                                  order.status
                                )}
                              </span>
                            </td>
                            <td style={{
                              fontSize: 12,
                              color: '#878787',
                            }}>
                              {formatDateTime(
                                order.created_at
                              )}
                            </td>
                            <td>
                              <div className="d-flex gap-1 align-items-center">
                                <button
                                  className="action-btn"
                                  onClick={() => openDetailModal(order.slug)}
                                  title="View detail"
                                >
                                  👁️
                                </button>

                                {/* SHOW DROPDOWN ONLY IF TRANSITIONS EXIST FOR SELLER */}
                                {STATUS_TRANSITIONS[order.status] && (
                                  <select
                                    className="form-select form-select-sm"
                                    style={{ fontSize: 11, width: 'auto' }}
                                    value=""
                                    disabled={statusLoading && updatingSlug === order.slug}
                                    onChange={(e) => handleStatusUpdate(order.slug, e.target.value)}
                                  >
                                    <option value="">Update Status</option>
                                    {STATUS_TRANSITIONS[order.status].map((s) => (
                                      <option key={s} value={s}>
                                        → {formatOrderStatus(s)}
                                      </option>
                                    ))}
                                  </select>
                                )}

                                {statusLoading && updatingSlug === order.slug && (
                                  <span className="spinner-border spinner-border-sm text-primary" />
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

      {/* Order detail modal */}
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
                Order —{' '}
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
                <Loader text="Loading order..." />
              )}
              {!detailLoading && selectedOrder && (
                <>
                  <div className="row g-2 mb-3">
                    <div className="col-md-6">
                      <div style={{
                        background: '#f8f9fa',
                        padding: 12, borderRadius: 6,
                      }}>
                        <div style={{
                          fontSize: 11,
                          color: '#878787',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          marginBottom: 4,
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
                        padding: 12, borderRadius: 6,
                      }}>
                        <div style={{
                          fontSize: 11,
                          color: '#878787',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          marginBottom: 4,
                        }}>
                          Status
                        </div>
                        <span className={`status-badge
                          badge-${selectedOrder.status}`}>
                          {formatOrderStatus(
                            selectedOrder.status
                          )}
                        </span>
                        <div style={{
                          fontSize: 12,
                          color: '#878787',
                          marginTop: 6,
                        }}>
                          {formatDateTime(
                            selectedOrder.created_at
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{
                    background: '#f8f9fa',
                    padding: 12, borderRadius: 6,
                    marginBottom: 16, fontSize: 13,
                  }}>
                    <strong>Shipping: </strong>
                    {selectedOrder.shipping_address}
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
                          <td>{item.product_name}</td>
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

                  <div style={{
                    textAlign: 'right',
                    marginTop: 12,
                    padding: '10px 0',
                    borderTop: '2px solid #eee',
                    fontWeight: 700, fontSize: 15,
                  }}>
                    Total:{' '}
                    {formatCurrency(
                      selectedOrder.total_amount
                    )}
                  </div>
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
    position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
    background: toast.type === 'success' ? '#26a541' : '#ff6161',
    color: 'white', padding: '12px 20px', borderRadius: 6, fontWeight: 600,
  }}>
    {toast.type === 'success' ? '✅' : '❌'} {toast.message}
  </div>
)}
    </>
  );
};

export default SellerOrdersPage;