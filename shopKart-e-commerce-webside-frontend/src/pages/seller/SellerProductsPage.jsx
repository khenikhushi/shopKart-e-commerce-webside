import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import SellerSidebar from '../../components/seller/SellerSidebar';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import ConfirmModal from '../../components/common/ConfirmModal';
import productApi from '../../api/product.api';
import {
  formatCurrency,
  formatDate,
} from '../../utils/format.util';
import { resolveImageUrl } from '../../utils/image.util';
import '../../styles/sidebar.css';
import '../../styles/dashboard.css';

const SellerProductsPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 10;

  const [search, setSearch] = useState('');

  // Delete
  const [deleteSlug, setDeleteSlug] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] =
    useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

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

  const fetchProducts = async (currentPage = page) => {
    setLoading(true);
    setError('');
    try {
      const res = await productApi.getSellerProducts({
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

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await productApi.deleteSellerProduct(deleteSlug);
      showToast('Product deleted successfully!');
      setDeleteModalOpen(false);
      setDeleteSlug('');
      fetchProducts(1);
      setPage(1);
    } catch (err) {
      showToast(
        err.response?.data?.message || 'Delete failed.',
        'error'
      );
      setDeleteModalOpen(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.brand || '')
      .toLowerCase()
      .includes(search.toLowerCase())
  );

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

          <div className="d-flex justify-content-between
            align-items-start mb-1 flex-wrap gap-2">
            <div>
              <div className="page-title">My Products</div>
              <div className="page-subtitle">
                {totalItems} products in your store
              </div>
            </div>
            <button
              className="btn btn-primary btn-sm"
              onClick={() =>
                navigate('/seller/products/add')
              }
              style={{ borderRadius: 4 }}
            >
              + Add Product
            </button>
          </div>

          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ maxWidth: 300, fontSize: 13 }}
            />
          </div>

          {loading && <Loader text="Loading products..." />}
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
                  title="No products yet"
                  message="Start selling by adding your first product."
                  actionLabel="Add Product"
                  actionLink="/seller/products/add"
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
                          <th>SubCategory</th>
                          <th>Price</th>
                          <th>MRP</th>
                          <th>Stock</th>
                          <th>Status</th>
                          <th>Created</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProducts.map(
                          (product, idx) => {
                            const imageSrc = resolveImageUrl(
                              product.thumbnail_url
                            );

                            return (
                          <tr key={product.id}>
                            <td style={{
                              color: '#878787',
                            }}>
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
                                      e.target.style
                                        .display = 'none';
                                    }}
                                  />
                                ) : (
                                  <div style={{
                                    width: 36,
                                    height: 36,
                                    background: '#f0f4ff',
                                    borderRadius: 4,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent:
                                      'center',
                                    fontSize: 16,
                                  }}>
                                    📦
                                  </div>
                                )}
                                <div>
                                  <div style={{
                                    fontWeight: 600,
                                    fontSize: 13,
                                    maxWidth: 160,
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
                            <td style={{
                              fontSize: 12,
                              color: '#878787',
                            }}>
                              {product.subCategory?.name
                                || '—'}
                            </td>
                            <td>
                              <strong style={{
                                color: 'var(--primary)',
                              }}>
                                {formatCurrency(
                                  product.price
                                )}
                              </strong>
                            </td>
                            <td style={{
                              fontSize: 12,
                              color: '#878787',
                            }}>
                              {product.mrp
                                ? formatCurrency(product.mrp)
                                : '—'}
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
                              fontSize: 12,
                              color: '#878787',
                            }}>
                              {formatDate(
                                product.created_at
                              )}
                            </td>
                            <td>
                              <div className="d-flex gap-1">
                                <button
                                  className="action-btn"
                                  onClick={() =>
                                    navigate(
                                      `/seller/products/edit/${product.slug}`
                                    )
                                  }
                                  title="Edit"
                                >
                                  ✏️
                                </button>
                                <button
                                  className="action-btn
                                    danger"
                                  onClick={() => {
                                    setDeleteSlug(
                                      product.slug
                                    );
                                    setDeleteModalOpen(
                                      true
                                    );
                                  }}
                                  title="Delete"
                                >
                                  🗑️
                                </button>
                              </div>
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

      <ConfirmModal
        show={deleteModalOpen}
        title="Delete Product"
        message="Are you sure you want to delete this product? This cannot be undone."
        confirmLabel="Delete"
        confirmVariant="danger"
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setDeleteSlug('');
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

export default SellerProductsPage;
