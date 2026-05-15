import { useState, useEffect, useRef } from 'react';
import Navbar from '../../components/common/Navbar';
import AdminSidebar from '../../components/admin/AdminSidebar';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import ConfirmModal from '../../components/common/ConfirmModal';
import subCategoryApi from '../../api/subCategory.api';
import categoryApi from '../../api/category.api';
import { formatDate } from '../../utils/format.util';
import '../../styles/sidebar.css';
import '../../styles/dashboard.css';

const EMPTY_FORM = {
  name: '',
  category_id: '',
  description: '',
  image_url: '',
};

const validateSubCategoryForm = ({ name, category_id }) => {
  const errors = {};
  if (!name || name.trim().length < 2) {
    errors.name = 'SubCategory name must be at least 2 characters';
  }
  if (!category_id) {
    errors.category_id = 'Please select a parent category';
  }
  return errors;
};

const AdminSubCategoriesPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Data state
  const [subCategories, setSubCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categoriesLoading, setCategoriesLoading] =
    useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 10;

  // Filter
  const [search, setSearch] = useState('');
  const [filterCategoryId, setFilterCategoryId] = useState('');

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
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success',
  });

  // Bootstrap modal ref
  const bsModalRef = useRef(null);
  const modalElRef = useRef(null);

  // ── Fetch subcategories ───────────────────────────────
  const fetchSubCategories = async (currentPage = page) => {
    setLoading(true);
    setError('');
    try {
      const res = await subCategoryApi.getAllAdmin({
        page: currentPage,
        limit,
      });
      const data = res.data;
      setSubCategories(data.data.subCategories);
      setTotalPages(data.pagination.totalPages);
      setTotalItems(data.pagination.totalItems);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to load subcategories.'
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Fetch all categories for dropdown ─────────────────
  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const res = await categoryApi.getAllAdmin({ limit: 100 });
      setCategories(res.data.data.categories);
    } catch {
      // Silently fail — dropdown will be empty
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    fetchSubCategories(page);
  }, [page]);

  useEffect(() => {
    fetchCategories();
  }, []);

  // ── Bootstrap modal init ──────────────────────────────
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

  // ── Toast helper ──────────────────────────────────────
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(
      () => setToast({ show: false, message: '', type: 'success' }),
      3000
    );
  };

  // ── Form handlers ─────────────────────────────────────
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

  const openEditModal = (subCategory) => {
    setModalMode('edit');
    setForm({
      name: subCategory.name || '',
      category_id: subCategory.category_id || '',
      description: subCategory.description || '',
      image_url: subCategory.image_url || '',
    });
    setFormErrors({});
    setFormApiError('');
    setEditSlug(subCategory.slug);
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateSubCategoryForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      return;
    }

    setFormLoading(true);
    setFormApiError('');

    const payload = {
      name: form.name.trim(),
      category_id: form.category_id,
    };

    if (form.description.trim()) {
      payload.description = form.description.trim();
    }

    if (form.image_url.trim()) {
      payload.image_url = form.image_url.trim();
    }

    try {
      if (modalMode === 'create') {
        await subCategoryApi.create(payload);
        showToast('SubCategory created successfully!');
      } else {
        await subCategoryApi.update(editSlug, payload);
        showToast('SubCategory updated successfully!');
      }
      setModalOpen(false);
      fetchSubCategories(1);
      setPage(1);
    } catch (err) {
      const msg =
        err.response?.data?.message || 'Something went wrong.';
      setFormApiError(msg);
    } finally {
      setFormLoading(false);
    }
  };

  // ── Delete handlers ───────────────────────────────────
  const openDeleteModal = (slug) => {
    setDeleteSlug(slug);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await subCategoryApi.delete(deleteSlug);
      showToast('SubCategory deleted successfully!');
      setDeleteModalOpen(false);
      setDeleteSlug('');
      fetchSubCategories(1);
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

  // ── Client-side filter ────────────────────────────────
  const filteredSubCategories = subCategories.filter((sub) => {
    const matchSearch = sub.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchCategory = filterCategoryId
      ? sub.category_id === filterCategoryId
      : true;
    return matchSearch && matchCategory;
  });

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
          <div
            className="d-flex justify-content-between
              align-items-start mb-1 flex-wrap gap-2"
          >
            <div>
              <div className="page-title">SubCategories</div>
              <div className="page-subtitle">
                {totalItems} subcategories total
              </div>
            </div>
            <button
              className="btn btn-primary btn-sm"
              onClick={openCreateModal}
              style={{ borderRadius: 4 }}
            >
              + Add SubCategory
            </button>
          </div>

          {/* Filters row */}
          <div className="d-flex gap-2 mb-3 flex-wrap">
            <input
              type="text"
              className="form-control"
              placeholder="Search subcategories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ maxWidth: 260, fontSize: 13 }}
            />
            <select
              className="form-select"
              value={filterCategoryId}
              onChange={(e) =>
                setFilterCategoryId(e.target.value)
              }
              style={{ maxWidth: 200, fontSize: 13 }}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {loading && (
            <Loader text="Loading subcategories..." />
          )}
          {error && (
            <ErrorMessage
              message={error}
              onRetry={() => fetchSubCategories(page)}
            />
          )}

          {!loading && !error && (
            <>
              {filteredSubCategories.length === 0 ? (
                <EmptyState
                  title="No subcategories found"
                  message="Create subcategories under your categories."
                  actionLabel="Add SubCategory"
                  onAction={openCreateModal}
                  icon="📂"
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
                          <th>Parent Category</th>
                          <th>Status</th>
                          <th>Created</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredSubCategories.map(
                          (sub, idx) => (
                            <tr key={sub.id}>
                              <td
                                style={{ color: '#878787' }}
                              >
                                {(page - 1) * limit + idx + 1}
                              </td>
                              <td>
                                <strong>{sub.name}</strong>
                              </td>
                              <td>
                                <code
                                  style={{
                                    fontSize: 11,
                                    background: '#f1f3f6',
                                    padding: '2px 6px',
                                    borderRadius: 3,
                                  }}
                                >
                                  {sub.slug}
                                </code>
                              </td>
                              <td>
                                {sub.category ? (
                                  <span
                                    style={{
                                      background: '#e8f0fe',
                                      color: '#1a56db',
                                      padding: '2px 8px',
                                      borderRadius: 10,
                                      fontSize: 12,
                                      fontWeight: 600,
                                    }}
                                  >
                                    {sub.category.name}
                                  </span>
                                ) : (
                                  '—'
                                )}
                              </td>
                              <td>
                                <span
                                  className={`status-badge
                                    ${sub.is_active
                                      ? 'badge-active'
                                      : 'badge-inactive'
                                    }`}
                                >
                                  {sub.is_active
                                    ? 'Active'
                                    : 'Inactive'}
                                </span>
                              </td>
                              <td
                                style={{
                                  color: '#878787',
                                  fontSize: 12,
                                }}
                              >
                                {formatDate(sub.created_at)}
                              </td>
                              <td>
                                <div className="d-flex gap-1">
                                  <button
                                    className="action-btn"
                                    onClick={() =>
                                      openEditModal(sub)
                                    }
                                    title="Edit"
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    className="action-btn danger"
                                    onClick={() =>
                                      openDeleteModal(sub.slug)
                                    }
                                    title="Delete"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )
                        )}
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

      {/* ── Create / Edit Modal ───────────────────────── */}
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
                  ? 'Add New SubCategory'
                  : 'Edit SubCategory'}
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
                  <div
                    className="alert alert-danger py-2 mb-3"
                    style={{ fontSize: 13 }}
                  >
                    {formApiError}
                  </div>
                )}

                {/* Parent Category Dropdown */}
                <div className="mb-3">
                  <label
                    className="form-label fw-semibold"
                    style={{ fontSize: 13 }}
                  >
                    Parent Category *
                  </label>
                  {categoriesLoading ? (
                    <div className="d-flex align-items-center
                      gap-2" style={{ fontSize: 13,
                      color: '#878787' }}>
                      <span className="spinner-border
                        spinner-border-sm" />
                      Loading categories...
                    </div>
                  ) : (
                    <select
                      name="category_id"
                      className={`form-select
                        ${formErrors.category_id
                          ? 'is-invalid'
                          : ''}`}
                      value={form.category_id}
                      onChange={handleFormChange}
                      disabled={formLoading}
                      style={{ fontSize: 14 }}
                    >
                      <option value="">
                        — Select a category —
                      </option>
                      {categories
                        .filter((c) => c.is_active)
                        .map((cat) => (
                          <option
                            key={cat.id}
                            value={cat.id}
                          >
                            {cat.name}
                          </option>
                        ))}
                    </select>
                  )}
                  {formErrors.category_id && (
                    <div className="error-text">
                      {formErrors.category_id}
                    </div>
                  )}
                </div>

                {/* Name */}
                <div className="mb-3">
                  <label
                    className="form-label fw-semibold"
                    style={{ fontSize: 13 }}
                  >
                    SubCategory Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    className={`form-control
                      ${formErrors.name ? 'is-invalid' : ''}`}
                    placeholder="e.g. Smartphones"
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
                  <label
                    className="form-label fw-semibold"
                    style={{ fontSize: 13 }}
                  >
                    Description{' '}
                    <span
                      style={{
                        color: '#878787',
                        fontWeight: 400,
                      }}
                    >
                      (optional)
                    </span>
                  </label>
                  <textarea
                    name="description"
                    className="form-control"
                    placeholder="Brief description"
                    value={form.description}
                    onChange={handleFormChange}
                    disabled={formLoading}
                    rows={3}
                    style={{
                      fontSize: 14,
                      resize: 'vertical',
                    }}
                  />
                </div>

                {/* Image URL */}
                <div className="mb-1">
                  <label
                    className="form-label fw-semibold"
                    style={{ fontSize: 13 }}
                  >
                    Image URL{' '}
                    <span
                      style={{
                        color: '#878787',
                        fontWeight: 400,
                      }}
                    >
                      (optional)
                    </span>
                  </label>
                  <input
                    type="url"
                    name="image_url"
                    className="form-control"
                    placeholder="https://example.com/image.jpg"
                    value={form.image_url}
                    onChange={handleFormChange}
                    disabled={formLoading}
                    style={{ fontSize: 14 }}
                  />
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
                  disabled={formLoading || categoriesLoading}
                >
                  {formLoading ? (
                    <span
                      className="d-flex align-items-center
                        gap-2"
                    >
                      <span
                        className="spinner-border
                          spinner-border-sm"
                      />
                      Saving...
                    </span>
                  ) : modalMode === 'create'
                    ? 'Create SubCategory'
                    : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* ── Delete Confirm Modal ──────────────────────── */}
      <ConfirmModal
        show={deleteModalOpen}
        title="Delete SubCategory"
        message="Are you sure you want to delete this
          subcategory? This cannot be undone. Make sure
          no products exist under it."
        confirmLabel="Delete"
        confirmVariant="danger"
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setDeleteSlug('');
        }}
      />

      {/* ── Toast ────────────────────────────────────── */}
      {toast.show && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 9999,
            background:
              toast.type === 'success' ? '#26a541' : '#ff6161',
            color: 'white',
            padding: '12px 20px',
            borderRadius: 6,
            fontSize: 14,
            fontWeight: 600,
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          }}
        >
          {toast.type === 'success' ? '✅' : '❌'}{' '}
          {toast.message}
        </div>
      )}
    </>
  );
};

export default AdminSubCategoriesPage;
