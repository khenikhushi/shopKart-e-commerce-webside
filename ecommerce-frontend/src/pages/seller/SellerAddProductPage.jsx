import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import SellerSidebar from '../../components/seller/SellerSidebar';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import subCategoryApi from '../../api/subCategory.api';
import filterApi from '../../api/filter.api';
import productApi from '../../api/product.api';
import { resolveImageUrl } from '../../utils/image.util';
import { validateProductForm } from '../../utils/validate.util';
import '../../styles/sidebar.css';
import '../../styles/dashboard.css';

const EMPTY_FORM = {
  name: '',
  subcategory_id: '',
  price: '',
  mrp: '',
  stock: '',
  brand: '',
  description: '',
  thumbnail_url: '',
};

const MAX_PRODUCT_IMAGES = 6;

const SellerAddProductPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imageInputKey, setImageInputKey] = useState(0);

  // SubCategories for dropdown
  const [subCategories, setSubCategories] = useState([]);
  const [subCatLoading, setSubCatLoading] = useState(true);

  // Filters for selected subcategory
  const [filters, setFilters] = useState([]);
  const [filtersLoading, setFiltersLoading] = useState(false);
  const [selectedFilterValues, setSelectedFilterValues] =
    useState({});

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

  const getApiErrorMessage = (err, fallbackMessage) => {
    return (
      err.response?.data?.errors?.[0]?.message ||
      err.response?.data?.message ||
      fallbackMessage
    );
  };

  // ── Load all subcategories on mount ──────────────────
  useEffect(() => {
    const loadSubCategories = async () => {
      setSubCatLoading(true);
      try {
        const res = await subCategoryApi.getAll({
          limit: 100,
        });
        setSubCategories(res.data.data.subCategories);
      } catch {
        // Silent fail
      } finally {
        setSubCatLoading(false);
      }
    };
    loadSubCategories();
  }, []);

  useEffect(() => {
    if (imageFiles.length === 0) {
      setImagePreviews([]);
      return undefined;
    }

    const objectUrls = imageFiles.map((imageFile) =>
      URL.createObjectURL(imageFile)
    );
    setImagePreviews(objectUrls);

    return () => {
      objectUrls.forEach((objectUrl) => {
        URL.revokeObjectURL(objectUrl);
      });
    };
  }, [imageFiles]);

  // ── Load filters when subcategory changes ────────────
  useEffect(() => {
    if (!form.subcategory_id) {
      setFilters([]);
      setSelectedFilterValues({});
      return;
    }

    const selectedSub = subCategories.find(
      (s) => s.id === form.subcategory_id
    );

    if (!selectedSub?.slug) return;

    const loadFilters = async () => {
      setFiltersLoading(true);
      setSelectedFilterValues({});
      try {
        const res = await filterApi.getBySubCategory(
          selectedSub.slug
        );
        setFilters(res.data.data.filters || []);
      } catch {
        setFilters([]);
      } finally {
        setFiltersLoading(false);
      }
    };

    loadFilters();
  }, [form.subcategory_id, subCategories]);

  // ── Form change handler ───────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setApiError('');
  };

  const handleImageChange = (e) => {
    const nextFiles = Array.from(e.target.files || []);
    if (nextFiles.length > MAX_PRODUCT_IMAGES) {
      setApiError(`You can upload up to ${MAX_PRODUCT_IMAGES} images.`);
      setImageFiles(nextFiles.slice(0, MAX_PRODUCT_IMAGES));
      return;
    }

    setImageFiles(nextFiles);
    setApiError('');
  };

  const removeSelectedImage = (indexToRemove) => {
    setImageFiles((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
    setApiError('');
  };

  const clearSelectedImages = () => {
    setImageFiles([]);
    setImageInputKey((prev) => prev + 1);
    setApiError('');
  };

  // ── Filter value selection ────────────────────────────
  const handleFilterChange = (filterId, valueId, type) => {
    setSelectedFilterValues((prev) => {
      if (type === 'checkbox') {
        const current = prev[filterId] || [];
        const exists = current.includes(valueId);
        return {
          ...prev,
          [filterId]: exists
            ? current.filter((id) => id !== valueId)
            : [...current, valueId],
        };
      } else {
        // radio
        return { ...prev, [filterId]: [valueId] };
      }
    });
  };

  // ── Form submit ───────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateProductForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      return;
    }

    const totalImageCount =
      imageFiles.length + (form.thumbnail_url.trim() ? 1 : 0);
    if (totalImageCount > MAX_PRODUCT_IMAGES) {
      setApiError(`You can upload up to ${MAX_PRODUCT_IMAGES} images.`);
      return;
    }

    if (
      form.mrp &&
      parseFloat(form.mrp) < parseFloat(form.price)
    ) {
      setFormErrors((prev) => ({
        ...prev,
        mrp: 'MRP cannot be less than selling price',
      }));
      return;
    }

    setLoading(true);
    setApiError('');

    try {
      // Step 1 — Create product
      const payload = new FormData();
      payload.append('name', form.name.trim());
      payload.append('subcategory_id', form.subcategory_id);
      payload.append('price', String(parseFloat(form.price)));
      payload.append('stock', String(parseInt(form.stock, 10)));

      if (form.mrp)
        payload.append('mrp', String(parseFloat(form.mrp)));
      if (form.brand.trim())
        payload.append('brand', form.brand.trim());
      if (form.description.trim())
        payload.append('description', form.description.trim());
      if (form.thumbnail_url.trim())
        payload.append('thumbnail_url', form.thumbnail_url.trim());
      imageFiles.forEach((imageFile) => {
        payload.append('images', imageFile);
      });

      const res = await productApi.createSellerProduct(
        payload
      );
      const newSlug = res.data.data.product.slug;

      // Step 2 — Assign filters if any selected
      const allSelectedValueIds = Object.values(
        selectedFilterValues
      ).flat();

      if (allSelectedValueIds.length > 0) {
        await productApi.assignFilters(newSlug, {
          filters: allSelectedValueIds.map((id) => ({
            filter_value_id: id,
          })),
        });
      }

      showToast('Product created successfully!');
      setTimeout(() => navigate('/seller/products'), 1500);
    } catch (err) {
      const msg = getApiErrorMessage(
        err,
        'Failed to create product.'
      );
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  const urlPreview = resolveImageUrl(form.thumbnail_url);
  const previewImages = [
    ...imagePreviews,
    ...(urlPreview ? [urlPreview] : []),
  ];

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

          {/* Breadcrumb */}
          <nav className="mb-3">
            <ol className="breadcrumb" style={{
              fontSize: 13,
            }}>
              <li className="breadcrumb-item">
                <button
                  className="btn btn-link p-0"
                  style={{ fontSize: 13 }}
                  onClick={() =>
                    navigate('/seller/products')
                  }
                >
                  My Products
                </button>
              </li>
              <li className="breadcrumb-item active">
                Add Product
              </li>
            </ol>
          </nav>

          <div className="page-title">Add New Product</div>
          <div className="page-subtitle">
            Fill in the details to list a new product.
          </div>

          <form onSubmit={handleSubmit}>
            <div className="row g-3">

              {/* Left column — main fields */}
              <div className="col-lg-8">
                <div className="section-card mb-3">
                  <div className="section-card-title">
                    Basic Information
                  </div>

                  {apiError && (
                    <div className="alert alert-danger
                      py-2 mb-3" style={{ fontSize: 13 }}>
                      {apiError}
                    </div>
                  )}

                  {/* Product Name */}
                  <div className="mb-3">
                    <label className="form-label
                      fw-semibold" style={{ fontSize: 13 }}>
                      Product Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      className={`form-control
                        ${formErrors.name
                          ? 'is-invalid' : ''}`}
                      placeholder="e.g. Samsung Galaxy S24"
                      value={form.name}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    {formErrors.name && (
                      <div className="error-text">
                        {formErrors.name}
                      </div>
                    )}
                  </div>

                  {/* SubCategory */}
                  <div className="mb-3">
                    <label className="form-label
                      fw-semibold" style={{ fontSize: 13 }}>
                      SubCategory *
                    </label>
                    {subCatLoading ? (
                      <div className="d-flex
                        align-items-center gap-2"
                        style={{ fontSize: 13,
                          color: '#878787' }}>
                        <span className="spinner-border
                          spinner-border-sm" />
                        Loading subcategories...
                      </div>
                    ) : (
                      <select
                        name="subcategory_id"
                        className={`form-select
                          ${formErrors.subcategory_id
                            ? 'is-invalid' : ''}`}
                        value={form.subcategory_id}
                        onChange={handleChange}
                        disabled={loading}
                      >
                        <option value="">
                          — Select subcategory —
                        </option>
                        {subCategories.map((sub) => (
                          <option
                            key={sub.id}
                            value={sub.id}
                          >
                            {sub.category?.name
                              ? `${sub.category.name} → `
                              : ''}
                            {sub.name}
                          </option>
                        ))}
                      </select>
                    )}
                    {formErrors.subcategory_id && (
                      <div className="error-text">
                        {formErrors.subcategory_id}
                      </div>
                    )}
                  </div>

                  {/* Price + MRP row */}
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label
                        fw-semibold"
                        style={{ fontSize: 13 }}>
                        Selling Price (₹) *
                      </label>
                      <input
                        type="number"
                        name="price"
                        className={`form-control
                          ${formErrors.price
                            ? 'is-invalid' : ''}`}
                        placeholder="e.g. 59999"
                        value={form.price}
                        onChange={handleChange}
                        disabled={loading}
                        min="0.01"
                        step="0.01"
                      />
                      {formErrors.price && (
                        <div className="error-text">
                          {formErrors.price}
                        </div>
                      )}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label
                        fw-semibold"
                        style={{ fontSize: 13 }}>
                        MRP (₹){' '}
                        <span style={{ color: '#878787',
                          fontWeight: 400 }}>
                          (optional)
                        </span>
                      </label>
                      <input
                        type="number"
                        name="mrp"
                        className={`form-control
                          ${formErrors.mrp
                            ? 'is-invalid' : ''}`}
                        placeholder="e.g. 69999"
                        value={form.mrp}
                        onChange={handleChange}
                        disabled={loading}
                        min="0.01"
                        step="0.01"
                      />
                      {formErrors.mrp && (
                        <div className="error-text">
                          {formErrors.mrp}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stock + Brand row */}
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label
                        fw-semibold"
                        style={{ fontSize: 13 }}>
                        Stock Quantity *
                      </label>
                      <input
                        type="number"
                        name="stock"
                        className={`form-control
                          ${formErrors.stock
                            ? 'is-invalid' : ''}`}
                        placeholder="e.g. 100"
                        value={form.stock}
                        onChange={handleChange}
                        disabled={loading}
                        min="0"
                        step="1"
                      />
                      {formErrors.stock && (
                        <div className="error-text">
                          {formErrors.stock}
                        </div>
                      )}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label
                        fw-semibold"
                        style={{ fontSize: 13 }}>
                        Brand{' '}
                        <span style={{ color: '#878787',
                          fontWeight: 400 }}>
                          (optional)
                        </span>
                      </label>
                      <input
                        type="text"
                        name="brand"
                        className="form-control"
                        placeholder="e.g. Samsung"
                        value={form.brand}
                        onChange={handleChange}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-3">
                    <label className="form-label
                      fw-semibold" style={{ fontSize: 13 }}>
                      Description{' '}
                      <span style={{ color: '#878787',
                        fontWeight: 400 }}>
                        (optional)
                      </span>
                    </label>
                    <textarea
                      name="description"
                      className="form-control"
                      placeholder="Describe your product..."
                      value={form.description}
                      onChange={handleChange}
                      disabled={loading}
                      rows={4}
                      style={{ resize: 'vertical' }}
                    />
                  </div>

                  {/* Product Image */}
                  <div className="mb-3">
                    <label className="form-label
                      fw-semibold" style={{ fontSize: 13 }}>
                      Upload Product Images from PC{' '}
                      <span style={{ color: '#878787',
                        fontWeight: 400 }}>
                        (optional)
                      </span>
                    </label>
                    <input
                      key={imageInputKey}
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                      multiple
                      className="form-control"
                      onChange={handleImageChange}
                      disabled={loading}
                    />
                    <div style={{
                      color: '#878787',
                      fontSize: 12,
                      marginTop: 6,
                    }}>
                      JPG, PNG, WEBP or GIF up to 5MB each. You can add up to {MAX_PRODUCT_IMAGES} images and the first image becomes the cover image.
                    </div>
                    {imageFiles.length > 0 && (
                      <>
                        <button
                          type="button"
                          className="btn btn-link btn-sm p-0 mt-2"
                          onClick={clearSelectedImages}
                          disabled={loading}
                        >
                          Remove all selected images
                        </button>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))',
                          gap: 10,
                          marginTop: 10,
                        }}>
                          {imagePreviews.map((previewSrc, index) => (
                            <div key={previewSrc} style={{ position: 'relative' }}>
                              <img
                                src={previewSrc}
                                alt={`Upload preview ${index + 1}`}
                                style={{
                                  width: '100%',
                                  aspectRatio: '1 / 1',
                                  borderRadius: 6,
                                  border: '1px solid #eee',
                                  objectFit: 'cover',
                                  display: 'block',
                                }}
                              />
                              <button
                                type="button"
                                className="btn btn-sm btn-light"
                                onClick={() => removeSelectedImage(index)}
                                disabled={loading}
                                style={{
                                  position: 'absolute',
                                  top: 4,
                                  right: 4,
                                  padding: '2px 6px',
                                  lineHeight: 1,
                                }}
                              >
                                x
                              </button>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="mb-1">
                    <label className="form-label
                      fw-semibold" style={{ fontSize: 13 }}>
                      Extra Image URL{' '}
                      <span style={{ color: '#878787',
                        fontWeight: 400 }}>
                        (optional)
                      </span>
                    </label>
                    <input
                      type="url"
                      name="thumbnail_url"
                      className={`form-control ${
                        formErrors.thumbnail_url
                          ? 'is-invalid'
                          : ''
                      }`}
                      placeholder="https://example.com/image.jpg"
                      value={form.thumbnail_url}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    <div style={{
                      color: '#878787',
                      fontSize: 12,
                      marginTop: 6,
                    }}>
                      Use a public `http(s)` image URL here if you want to add one more image from the web.
                    </div>
                    {formErrors.thumbnail_url && (
                      <div className="error-text">
                        {formErrors.thumbnail_url}
                      </div>
                    )}
                    {previewImages.length > 0 && (
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))',
                        gap: 10,
                        marginTop: 10,
                      }}>
                        {previewImages.map((previewSrc, index) => (
                          <img
                            key={`${previewSrc}-${index}`}
                            src={previewSrc}
                            alt={`Preview ${index + 1}`}
                            style={{
                              width: '100%',
                              aspectRatio: '1 / 1',
                              borderRadius: 6,
                              border: '1px solid #eee',
                              objectFit: 'cover',
                              display: 'block',
                            }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right column — filters */}
              <div className="col-lg-4">
                <div className="section-card">
                  <div className="section-card-title">
                    Product Filters
                  </div>

                  {!form.subcategory_id && (
                    <div style={{
                      color: '#878787',
                      fontSize: 13,
                      textAlign: 'center',
                      padding: '20px 0',
                    }}>
                      Select a subcategory to see
                      available filters
                    </div>
                  )}

                  {filtersLoading && (
                    <Loader
                      size="sm"
                      text="Loading filters..."
                    />
                  )}

                  {!filtersLoading &&
                    form.subcategory_id &&
                    filters.length === 0 && (
                    <div style={{
                      color: '#878787',
                      fontSize: 13,
                      textAlign: 'center',
                      padding: '20px 0',
                    }}>
                      No filters defined for this
                      subcategory yet.
                    </div>
                  )}

                  {!filtersLoading &&
                    filters.map((filter) => (
                    <div
                      key={filter.id}
                      style={{ marginBottom: 16 }}
                    >
                      <div style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: '#444',
                        marginBottom: 8,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                      }}>
                        {filter.display_name}
                      </div>

                      {filter.values?.map((val) => (
                        <div
                          key={val.id}
                          className="form-check"
                          style={{ marginBottom: 4 }}
                        >
                          <input
                            className="form-check-input"
                            type={
                              filter.filter_type === 'radio'
                                ? 'radio'
                                : 'checkbox'
                            }
                            name={`filter_${filter.id}`}
                            id={`val_${val.id}`}
                            checked={
                              (selectedFilterValues[
                                filter.id
                              ] || []).includes(val.id)
                            }
                            onChange={() =>
                              handleFilterChange(
                                filter.id,
                                val.id,
                                filter.filter_type
                              )
                            }
                            disabled={loading}
                          />
                          <label
                            className="form-check-label"
                            htmlFor={`val_${val.id}`}
                            style={{ fontSize: 13 }}
                          >
                            {val.value}
                          </label>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Submit bar */}
            <div style={{
              display: 'flex',
              gap: 12,
              marginTop: 16,
              padding: '16px 0',
              borderTop: '1px solid var(--border)',
            }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || subCatLoading}
                style={{ minWidth: 140 }}
              >
                {loading ? (
                  <span className="d-flex align-items-center
                    gap-2">
                    <span className="spinner-border
                      spinner-border-sm" />
                    Creating...
                  </span>
                ) : 'Create Product'}
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() =>
                  navigate('/seller/products')
                }
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        </main>
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

export default SellerAddProductPage;
