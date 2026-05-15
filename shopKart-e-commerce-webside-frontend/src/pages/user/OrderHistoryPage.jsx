import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import OrderCard from '../../components/user/OrderCard';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import ConfirmModal from
  '../../components/common/ConfirmModal';
import orderApi from '../../api/order.api';

const OrderHistoryPage = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 5;

  // Cancel
  const [cancelSlug, setCancelSlug] = useState('');
  const [cancelModalOpen, setCancelModalOpen] =
    useState(false);
  const [cancelLoading, setCancelLoading] = useState('');

  // Toast
  const [toast, setToast] = useState({
    show: false, message: '', type: 'success',
  });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(
      () => setToast({
        show: false, message: '', type: 'success',
      }),
      3000
    );
  };

  const fetchOrders = async (currentPage = page) => {
    setLoading(true);
    setError('');
    try {
      const res = await orderApi.getUserOrders({
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

  const handleCancelRequest = (slug) => {
    setCancelSlug(slug);
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    setCancelLoading(cancelSlug);
    setCancelModalOpen(false);
    try {
      await orderApi.cancelOrder(cancelSlug);
      showToast('Order cancelled successfully.');
      fetchOrders(page);
    } catch (err) {
      showToast(
        err.response?.data?.message ||
        'Failed to cancel order.',
        'error'
      );
    } finally {
      setCancelLoading('');
      setCancelSlug('');
    }
  };

  return (
    <>
      <Navbar />

      <div className="page-wrapper">
        <div className="container" style={{
          maxWidth: 760,
        }}>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center', marginBottom: 20,
          }}>
            <div>
              <h1 style={{
                fontSize: 20, fontWeight: 700,
                marginBottom: 4,
              }}>
                My Orders
              </h1>
              <div style={{
                fontSize: 13, color: '#878787',
              }}>
                {totalItems} order(s) total
              </div>
            </div>
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={() => navigate('/products')}
              style={{ borderRadius: 4 }}
            >
              Shop More
            </button>
          </div>

          {loading && (
            <Loader text="Loading your orders..." />
          )}
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
                  message="You haven't placed any orders. Start shopping!"
                  actionLabel="Browse Products"
                  actionLink="/products"
                  icon="🛒"
                />
              ) : (
                <>
                  {orders.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onCancel={handleCancelRequest}
                      cancelling={cancelLoading}
                    />
                  ))}

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
            </>
          )}
        </div>
      </div>

      <Footer />

      <ConfirmModal
        show={cancelModalOpen}
        title="Cancel Order"
        message="Are you sure you want to cancel this order? This action cannot be undone."
        confirmLabel="Yes, Cancel Order"
        confirmVariant="danger"
        loading={false}
        onConfirm={handleConfirmCancel}
        onCancel={() => {
          setCancelModalOpen(false);
          setCancelSlug('');
        }}
      />

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

export default OrderHistoryPage;