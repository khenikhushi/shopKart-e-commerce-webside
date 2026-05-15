import { useState, useEffect, useRef } from 'react';
import Navbar from '../../components/common/Navbar';
import AdminSidebar from '../../components/admin/AdminSidebar';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import ConfirmModal from '../../components/common/ConfirmModal';
import categoryApi from '../../api/category.api';
import { formatDate } from '../../utils/format.util';
import { validateCategoryForm } from '../../utils/validate.util';
import '../../styles/sidebar.css';
import '../../styles/dashboard.css';

const EMPTY_FORM = {
  name: '',
  description: '',
  image_url: '',
};

const AdminCategoriesPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Data state
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 10;

  // Search
  const [search, setSearch] = useState('');

  // Modal state
  const [modalMode, setModalMode] = useState('create');
  const [modalOpen, setModalOpen] = useState(false);
  const [editSlug, setEditSlug] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [formLoading, setFormLoading] = useState(false);
  const [formApiError, setFormApiError] = useState('');

  // Delete modal
  const [deleteSlug, setDeleteSlug] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Toast
  const [toast, setToast] = useState({ show: false,
    message: '', type: 'success' });

  // Bootstrap modal ref
  const bsModalRef = useRef(null);
  const modalElRef = useRef(null);

  // ── Fetch categories ──────────────────────────────────
  const fetchCategories = async (currentPage = page) => {
    setLoading(true);
    setError('');
    try {
      const res = await categoryApi.getAllAdmin({
        page: currentPage,
        limit,
      });
      const data = res.data;
      setCategories(data.data.categories);
      setTotalPages(data.pagination.totalPages);
      setTotalItems(data.pagination.totalItems);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to load categories.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories(page);
  }, [page]);

  // ── Bootstrap modal init ─────────────────────────────
  useEffect(() => {
    const el = modalElRef.current;
    if (!el) return;
    import('bootstrap').then(({ Modal }) => {
      bsModalRef.current = Modal.getOrCreateInstance(el);
    });
  }, []);

  useEffect(() => {
    if (!bsModalRef.current) return;
    if (modalOpen) bsModalRef.current.show();
    else bsModalRef.current.hide();
  }, [modalOpen]);

  // ── Toast helper ─────────────────────────────────────
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false,
      message: '', type: 'success' }), 3000);
  };

  // ── Form handlers ────────────────────────────────────
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setFormApiError('');
  };

  const openCreateModal = () => {
    setModalMode('create');
    setForm(EMPTY_FORM);
    setFormErrors({});
    setFormApiError('');
    setEditSlug('');
    setModalOpen(true);
  };

  const openEditModal = (category) => {
    setModalMode('edit');
    setForm({
      name: category.name || '',
      description: category.description || '',
      image_url: category.image_url || '',
    });
    setFormErrors({});
    setFormApiError('');
    setEditSlug(category.slug);
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateCategoryForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      return;
    }

    setFormLoading(true);
    setFormApiError('');

    const payload = { name: form.name.trim() };
    if (form.description.trim()) {
      payload.description = form.description.trim();
    }
    if (form.image_url.trim()) {
      payload.image_url = form.image_url.trim();
    }

    try {
      if (modalMode === 'create') {
        await categoryApi.create(payload);
        showToast('Category created successfully!');
      } else {
        await categoryApi.update(editSlug, payload);
        showToast('Category updated successfully!');
      }
      setModalOpen(false);
      fetchCategories(1);
      setPage(1);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Something went wrong.';
      setFormApiError(msg);
    } finally {
      setFormLoading(false);
    }
  };

  // ── Delete handlers ──────────────────────────────────
  const openDeleteModal = (slug) => {
    setDeleteSlug(slug);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await categoryApi.delete(deleteSlug);
      showToast('Category deleted successfully!');
      setDeleteModalOpen(false);
      setDeleteSlug('');
      fetchCategories(1);
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

  // ── Filter categories by search ──────────────────────
  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(search.toLowerCase())
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
          {/* Mobile toggle */}
          <button
            className="sidebar-toggle-btn"
            onClick={() => setSidebarOpen(true)}
          >
            ☰ Menu
          </button>

          {/* Page header */}
          <div className="d-flex justify-content-between
            align-items-start mb-1 flex-wrap gap-2">
            <div>
              <div className="page-title">Categories</div>
              <div className="page-subtitle">
                {totalItems} categories total
              </div>
            </div>
            <button
              className="btn btn-primary btn-sm"
              onClick={openCreateModal}
              style={{ borderRadius: 4 }}
            >
              + Add Category
            </button>
          </div>

          {/* Search */}
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ maxWidth: 320, fontSize: 13 }}
            />
          </div>

          {loading && <Loader text="Loading categories..." />}
          {error && (
            <ErrorMessage
              message={error}
              onRetry={() => fetchCategories(page)}
            />
          )}

          {!loading && !error && (
            <>
              {filteredCategories.length === 0 ? (
                <EmptyState
                  title="No categories found"
                  message="Create your first category to get started."
                  actionLabel="Add Category"
                  onAction={openCreateModal}
                  icon="📁"
                />
              ) : (
                <div className="section-card p-0">
                  <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Name</th>
                          <th>Slug</th>
                          <th>Description</th>
                          <th>Status</th>
                          <th>Created</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCategories.map((cat, idx) => (
                          <tr key={cat.id}>
                            <td style={{ color: '#878787' }}>
                              {(page - 1) * limit + idx + 1}
                            </td>
                            <td>
                              <strong>{cat.name}</strong>
                            </td>
                            <td>
                              <code style={{ fontSize: 11,
                                background: '#f1f3f6',
                                padding: '2px 6px',
                                borderRadius: 3 }}>
                                {cat.slug}
                              </code>
                            </td>
                            <td style={{ maxWidth: 200,
                              color: '#878787' }}>
                              {cat.description
                                ? cat.description.length > 50
                                  ? cat.description
                                    .substring(0, 50) + '...'
                                  : cat.description
                                : '—'}
                            </td>
                            <td>
                              <span className={`status-badge
                                ${cat.is_active
                                  ? 'badge-active'
                                  : 'badge-inactive'}`}>
                                {cat.is_active
                                  ? 'Active'
                                  : 'Inactive'}
                              </span>
                            </td>
                            <td style={{ color: '#878787',
                              fontSize: 12 }}>
                              {formatDate(cat.created_at)}
                            </td>
                            <td>
                              <div className="d-flex gap-1">
                                <button
                                  className="action-btn"
                                  onClick={() =>
                                    openEditModal(cat)}
                                  title="Edit"
                                >
                                  ✏️
                                </button>
                                <button
                                  className="action-btn danger"
                                  onClick={() =>
                                    openDeleteModal(cat.slug)}
                                  title="Delete"
                                >
                                  🗑️
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Pagination */}
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

      {/* ── Create / Edit Modal ──────────────────────── */}
      <div
        className="modal fade"
        ref={modalElRef}
        tabIndex="-1"
        data-bs-backdrop="static"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {modalMode === 'create'
                  ? 'Add New Category'
                  : 'Edit Category'}
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setModalOpen(false)}
                disabled={formLoading}
              />
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="modal-body">
                {formApiError && (
                  <div className="alert alert-danger py-2
                    mb-3" style={{ fontSize: 13 }}>
                    {formApiError}
                  </div>
                )}

                {/* Name */}
                <div className="mb-3">
                  <label className="form-label fw-semibold"
                    style={{ fontSize: 13 }}>
                    Category Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    className={`form-control
                      ${formErrors.name ? 'is-invalid' : ''}`}
                    placeholder="e.g. Electronics"
                    value={form.name}
                    onChange={handleFormChange}
                    disabled={formLoading}
                    style={{ fontSize: 14 }}
                  />
                  {formErrors.name && (
                    <div className="error-text">
                      {formErrors.name}
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="mb-3">
                  <label className="form-label fw-semibold"
                    style={{ fontSize: 13 }}>
                    Description
                    <span style={{ color: '#878787',
                      fontWeight: 400 }}> (optional)</span>
                  </label>
                  <textarea
                    name="description"
                    className="form-control"
                    placeholder="Brief description of this category"
                    value={form.description}
                    onChange={handleFormChange}
                    disabled={formLoading}
                    rows={3}
                    style={{ fontSize: 14, resize: 'vertical' }}
                  />
                </div>

                {/* Image URL */}
                <div className="mb-1">
                  <label className="form-label fw-semibold"
                    style={{ fontSize: 13 }}>
                    Image URL
                    <span style={{ color: '#878787',
                      fontWeight: 400 }}> (optional)</span>
                  </label>
                  <input
                    type="url"
                    name="image_url"
                    className={`form-control
                      ${formErrors.image_url
                        ? 'is-invalid' : ''}`}
                    placeholder="https://example.com/image.jpg"
                    value={form.image_url}
                    onChange={handleFormChange}
                    disabled={formLoading}
                    style={{ fontSize: 14 }}
                  />
                  {formErrors.image_url && (
                    <div className="error-text">
                      {formErrors.image_url}
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setModalOpen(false)}
                  disabled={formLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={formLoading}
                >
                  {formLoading ? (
                    <span className="d-flex align-items-center
                      gap-2">
                      <span className="spinner-border
                        spinner-border-sm" />
                      Saving...
                    </span>
                  ) : modalMode === 'create'
                    ? 'Create Category'
                    : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* ── Delete Confirm Modal ─────────────────────── */}
      <ConfirmModal
        show={deleteModalOpen}
        title="Delete Category"
        message={`Are you sure you want to delete this category?
          This action cannot be undone. Make sure no
          subcategories exist under it.`}
        confirmLabel="Delete"
        confirmVariant="danger"
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setDeleteSlug('');
        }}
      />

      {/* ── Toast Notification ───────────────────────── */}
      {toast.show && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 9999,
            background: toast.type === 'success'
              ? '#26a541' : '#ff6161',
            color: 'white',
            padding: '12px 20px',
            borderRadius: 6,
            fontSize: 14,
            fontWeight: 600,
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          {toast.type === 'success' ? '✅' : '❌'}{' '}
          {toast.message}
        </div>
      )}
    </>
  );
};

export default AdminCategoriesPage;
