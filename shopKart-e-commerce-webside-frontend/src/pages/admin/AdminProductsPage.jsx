import { useState, useEffect } from 'react';
import Navbar from '../../components/common/Navbar';
import AdminSidebar from '../../components/admin/AdminSidebar';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import ConfirmModal from '../../components/common/ConfirmModal';
import productApi from '../../api/product.api';
import { formatCurrency, formatDate } from '../../utils/format.util';
import { resolveImageUrl } from '../../utils/image.util';
import '../../styles/sidebar.css';
import '../../styles/dashboard.css';

const AdminProductsPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 10;

  const [search, setSearch] = useState('');

  // Status toggle confirm
  const [toggleProduct, setToggleProduct] = useState(null);
  const [toggleModalOpen, setToggleModalOpen] = useState(false);
  const [toggleLoading, setToggleLoading] = useState(false);

  // Toast
  const [toast, setToast] = useState({
    show: false, message: '', type: 'success',
  });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(
      () => setToast({ show: false, message: '',
        type: 'success' }),
      3000
    );
  };

  const fetchProducts = async (currentPage = page) => {
    setLoading(true);
    setError('');
    try {
      const res = await productApi.getAllAdmin({
        page: currentPage,
        limit,
      });
      setProducts(res.data.data.products);
      setTotalPages(res.data.pagination.totalPages);
      setTotalItems(res.data.pagination.totalItems);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to load products.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(page);
  }, [page]);

  const openToggleModal = (product) => {
    setToggleProduct(product);
    setToggleModalOpen(true);
  };

  const handleToggleStatus = async () => {
    if (!toggleProduct) return;
    setToggleLoading(true);
    try {
      await productApi.updateStatusAdmin(toggleProduct.slug, {
        is_active: !toggleProduct.is_active,
      });
      showToast(
        `Product ${!toggleProduct.is_active
          ? 'activated'
          : 'deactivated'} successfully!`
      );
      setToggleModalOpen(false);
      setToggleProduct(null);
      fetchProducts(page);
    } catch (err) {
      showToast(
        err.response?.data?.message ||
        'Status update failed.',
        'error'
      );
      setToggleModalOpen(false);
    } finally {
      setToggleLoading(false);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.brand || '').toLowerCase().includes(
      search.toLowerCase()
    ) ||
    (p.seller?.name || '').toLowerCase().includes(
      search.toLowerCase()
    )
  );

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

          <div className="page-title">All Products</div>
          <div className="page-subtitle">
            {totalItems} products across all sellers
          </div>

          {/* Search */}
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Search by name, brand or seller..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ maxWidth: 360, fontSize: 13 }}
            />
          </div>

          {loading && (
            <Loader text="Loading products..." />
          )}
          {error && (
            <ErrorMessage
              message={error}
              onRetry={() => fetchProducts(page)}
            />
          )}

          {!loading && !error && (
            <>
              {filteredProducts.length === 0 ? (
                <EmptyState
                  title="No products found"
                  message="Products created by sellers will appear here."
                  icon="📦"
                />
              ) : (
                <div className="section-card p-0">
                  <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Product</th>
                          <th>Seller</th>
                          <th>SubCategory</th>
                          <th>Price</th>
                          <th>Stock</th>
                          <th>Status</th>
                          <th>Created</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProducts.map((product, idx) => {
                          const imageSrc = resolveImageUrl(
                            product.thumbnail_url
                          );

                          return (
                          <tr key={product.id}>
                            <td style={{ color: '#878787' }}>
                              {(page - 1) * limit + idx + 1}
                            </td>
                            <td>
                              <div className="d-flex
                                align-items-center gap-2">
                                {imageSrc ? (
                                  <img
                                    src={imageSrc}
                                    alt={product.name}
                                    style={{
                                      width: 36,
                                      height: 36,
                                      objectFit: 'cover',
                                      borderRadius: 4,
                                      border: '1px solid #eee',
                                    }}
                                    onError={(e) => {
                                      e.target.style.display =
                                        'none';
                                    }}
                                  />
                                ) : (
                                  <div style={{
                                    width: 36, height: 36,
                                    background: '#f0f4ff',
                                    borderRadius: 4,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 16,
                                  }}>
                                    📦
                                  </div>
                                )}
                                <div>
                                  <div style={{
                                    fontWeight: 600,
                                    fontSize: 13,
                                    maxWidth: 180,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}>
                                    {product.name}
                                  </div>
                                  {product.brand && (
                                    <div style={{
                                      fontSize: 11,
                                      color: '#878787',
                                    }}>
                                      {product.brand}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td>
                              <span style={{
                                fontSize: 12,
                                color: '#1a56db',
                                fontWeight: 500,
                              }}>
                                {product.seller?.name || '—'}
                              </span>
                            </td>
                            <td style={{
                              fontSize: 12,
                              color: '#878787',
                            }}>
                              {product.subCategory?.name || '—'}
                            </td>
                            <td>
                              <strong style={{
                                color: 'var(--primary)',
                              }}>
                                {formatCurrency(product.price)}
                              </strong>
                            </td>
                            <td>
                              <span style={{
                                color: product.stock === 0
                                  ? '#ff6161'
                                  : product.stock < 5
                                    ? '#ff9f00'
                                    : '#26a541',
                                fontWeight: 600,
                                fontSize: 13,
                              }}>
                                {product.stock}
                              </span>
                            </td>
                            <td>
                              <span className={`status-badge
                                ${product.is_active
                                  ? 'badge-active'
                                  : 'badge-inactive'}`}>
                                {product.is_active
                                  ? 'Active'
                                  : 'Inactive'}
                              </span>
                            </td>
                            <td style={{
                              color: '#878787', fontSize: 12,
                            }}>
                              {formatDate(product.created_at)}
                            </td>
                            <td>
                              <button
                                className={`action-btn
                                  ${product.is_active
                                    ? 'danger' : ''}`}
                                onClick={() =>
                                  openToggleModal(product)}
                                title={product.is_active
                                  ? 'Deactivate'
                                  : 'Activate'}
                              >
                                {product.is_active
                                  ? '🔴 Deactivate'
                                  : '🟢 Activate'}
                              </button>
                            </td>
                          </tr>
                          );
                        })}
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

      {/* Toggle Status Confirm Modal */}
      <ConfirmModal
        show={toggleModalOpen}
        title={toggleProduct?.is_active
          ? 'Deactivate Product'
          : 'Activate Product'}
        message={`Are you sure you want to ${
          toggleProduct?.is_active
            ? 'deactivate'
            : 'activate'
        } "${toggleProduct?.name}"? ${
          toggleProduct?.is_active
            ? 'It will no longer be visible to buyers.'
            : 'It will become visible to buyers.'
        }`}
        confirmLabel={toggleProduct?.is_active
          ? 'Deactivate' : 'Activate'}
        confirmVariant={toggleProduct?.is_active
          ? 'danger' : 'success'}
        loading={toggleLoading}
        onConfirm={handleToggleStatus}
        onCancel={() => {
          setToggleModalOpen(false);
          setToggleProduct(null);
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

export default AdminProductsPage;
