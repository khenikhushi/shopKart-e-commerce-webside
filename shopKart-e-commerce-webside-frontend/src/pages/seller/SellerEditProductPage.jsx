import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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

const MAX_PRODUCT_IMAGES = 6;

const SellerEditProductPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [form, setForm] = useState({
    name: '',
    subcategory_id: '',
    price: '',
    mrp: '',
    stock: '',
    brand: '',
    description: '',
    thumbnail_url: '',
    is_active: true,
  });
  const [formErrors, setFormErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [existingImageUrls, setExistingImageUrls] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imageInputKey, setImageInputKey] = useState(0);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState('');

  const [subCategories, setSubCategories] = useState([]);
  const [filters, setFilters] = useState([]);
  const [filtersLoading, setFiltersLoading] =
    useState(false);
  const [selectedFilterValues, setSelectedFilterValues] =
    useState({});

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

  // ── Load product + subcategories on mount ─────────────
  useEffect(() => {
    const loadData = async () => {
      setPageLoading(true);
      setPageError('');
      try {
        const [productRes, subCatRes] = await Promise.all([
          productApi.getSellerProductBySlug(slug),
          subCategoryApi.getAll({ limit: 100 }),
        ]);

        const product = productRes.data.data.product;
        const subs = subCatRes.data.data.subCategories;
        const currentImages = Array.isArray(product.image_urls) &&
          product.image_urls.length > 0
          ? product.image_urls
          : (product.thumbnail_url ? [product.thumbnail_url] : []);

        setSubCategories(subs);

        setForm({
          name: product.name || '',
          subcategory_id: product.subcategory_id || '',
          price: product.price || '',
          mrp: product.mrp || '',
          stock: product.stock ?? '',
          brand: product.brand || '',
          description: product.description || '',
          thumbnail_url: '',
          is_active: product.is_active ?? true,
        });
        setExistingImageUrls(currentImages);
        setImageFiles([]);
        setImageInputKey((prev) => prev + 1);

        // Pre-select existing filter values
        if (product.filters?.length > 0) {
          const preSelected = {};
          product.filters.forEach((filter) => {
            const valueIds = filter.values?.map(
              (v) => v.id
            ) || [];
            if (valueIds.length > 0) {
              preSelected[filter.id] = valueIds;
            }
          });
          setSelectedFilterValues(preSelected);
        }
      } catch (err) {
        setPageError(getApiErrorMessage(
          err,
          'Failed to load product.'
        ));
      } finally {
        setPageLoading(false);
      }
    };
    loadData();
  }, [slug]);

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
    if (!form.subcategory_id || subCategories.length === 0)
      return;

    const selectedSub = subCategories.find(
      (s) => s.id === form.subcategory_id
    );

    if (!selectedSub?.slug) return;

    const loadFilters = async () => {
      setFiltersLoading(true);
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const nextValue = type === 'checkbox' ? checked : value;

    if (
      name === 'subcategory_id' &&
      value !== form.subcategory_id
    ) {
      setFilters([]);
      setSelectedFilterValues({});
    }

    setForm((prev) => ({
      ...prev,
      [name]: nextValue,
    }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setApiError('');
  };

  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    const availableSlots = Math.max(
      0,
      MAX_PRODUCT_IMAGES -
        existingImageUrls.length -
        (form.thumbnail_url.trim() ? 1 : 0)
    );

    if (selectedFiles.length > availableSlots) {
      setApiError(
        availableSlots > 0
          ? `You can add ${availableSlots} more images for this product.`
          : `You can upload up to ${MAX_PRODUCT_IMAGES} images.`
      );
      setImageFiles(selectedFiles.slice(0, availableSlots));
      return;
    }

    setImageFiles(selectedFiles);
    setApiError('');
  };

  const clearSelectedImages = () => {
    setImageFiles([]);
    setImageInputKey((prev) => prev + 1);
    setApiError('');
  };

  const removeSelectedImage = (indexToRemove) => {
    setImageFiles((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
    setApiError('');
  };

  const removeExistingImage = (indexToRemove) => {
    setExistingImageUrls((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
    setApiError('');
  };

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
        return { ...prev, [filterId]: [valueId] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateProductForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      return;
    }

    const totalImageCount =
      existingImageUrls.length +
      imageFiles.length +
      (form.thumbnail_url.trim() ? 1 : 0);
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
      const payload = new FormData();
      payload.append('name', form.name.trim());
      payload.append('subcategory_id', form.subcategory_id);
      payload.append('price', String(parseFloat(form.price)));
      payload.append('stock', String(parseInt(form.stock, 10)));
      payload.append('is_active', String(form.is_active));

      if (form.mrp)
        payload.append('mrp', String(parseFloat(form.mrp)));
      if (form.brand.trim())
        payload.append('brand', form.brand.trim());
      if (form.description.trim())
        payload.append('description', form.description.trim());
      payload.append('image_urls', JSON.stringify(existingImageUrls));
      if (form.thumbnail_url.trim())
        payload.append('thumbnail_url', form.thumbnail_url.trim());
      imageFiles.forEach((imageFile) => {
        payload.append('images', imageFile);
      });

      const res = await productApi.updateSellerProduct(
        slug, payload
      );
      const updatedSlug = res.data.data.product.slug;

      // Update filters
      const allSelectedValueIds = Object.values(
        selectedFilterValues
      ).flat();

      await productApi.assignFilters(updatedSlug, {
        filters: allSelectedValueIds.map((id) => ({
          filter_value_id: id,
        })),
      });

      showToast('Product updated successfully!');
      setTimeout(
        () => navigate('/seller/products'),
        1500
      );
    } catch (err) {
      const msg = getApiErrorMessage(
        err,
        'Failed to update product.'
      );
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  const urlPreview = resolveImageUrl(form.thumbnail_url);
  const previewImages = urlPreview ? [urlPreview] : [];

  if (pageLoading) {
    return (
      <>
        <Navbar />
        <div className="admin-layout">
          <SellerSidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
          <main className="admin-content">
            <Loader fullPage text="Loading product..." />
          </main>
        </div>
      </>
    );
  }

  if (pageError) {
    return (
      <>
        <Navbar />
        <div className="admin-layout">
          <SellerSidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
          <main className="admin-content">
            <ErrorMessage message={pageError} fullPage />
          </main>
        </div>
      </>
    );
  }

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

          <nav className="mb-3">
            <ol className="breadcrumb"
              style={{ fontSize: 13 }}>
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
                Edit Product
              </li>
            </ol>
          </nav>

          <div className="page-title">Edit Product</div>
          <div className="page-subtitle">
            Update your product details below.
          </div>

          <form onSubmit={handleSubmit}>
            <div className="row g-3">

              {/* Left column */}
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

                  {/* Same fields as Add Product */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold"
                      style={{ fontSize: 13 }}>
                      Product Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      className={`form-control
                        ${formErrors.name
                          ? 'is-invalid' : ''}`}
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

                  <div className="mb-3">
                    <label className="form-label fw-semibold"
                      style={{ fontSize: 13 }}>
                      SubCategory *
                    </label>
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
                        <option key={sub.id} value={sub.id}>
                          {sub.category?.name
                            ? `${sub.category.name} → `
                            : ''}
                          {sub.name}
                        </option>
                      ))}
                    </select>
                    {formErrors.subcategory_id && (
                      <div className="error-text">
                        {formErrors.subcategory_id}
                      </div>
                    )}
                  </div>

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

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label
                        fw-semibold"
                        style={{ fontSize: 13 }}>
                        Stock *
                      </label>
                      <input
                        type="number"
                        name="stock"
                        className={`form-control
                          ${formErrors.stock
                            ? 'is-invalid' : ''}`}
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
                        Brand
                      </label>
                      <input
                        type="text"
                        name="brand"
                        className="form-control"
                        value={form.brand}
                        onChange={handleChange}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold"
                      style={{ fontSize: 13 }}>
                      Description
                    </label>
                    <textarea
                      name="description"
                      className="form-control"
                      value={form.description}
                      onChange={handleChange}
                      disabled={loading}
                      rows={4}
                      style={{ resize: 'vertical' }}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold"
                      style={{ fontSize: 13 }}>
                      Add More Images from PC
                    </label>
                    {existingImageUrls.length > 0 && (
                      <div style={{ marginBottom: 10 }}>
                        <div style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: '#555',
                          marginBottom: 8,
                        }}>
                          Current product images
                        </div>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))',
                          gap: 10,
                        }}>
                          {existingImageUrls.map((imageUrl, index) => {
                            const previewSrc = resolveImageUrl(imageUrl);

                            if (!previewSrc) {
                              return null;
                            }

                            return (
                              <div
                                key={`${previewSrc}-${index}`}
                                style={{ position: 'relative' }}
                              >
                                <img
                                  src={previewSrc}
                                  alt={`Current product ${index + 1}`}
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
                                  onClick={() => removeExistingImage(index)}
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
                            );
                          })}
                        </div>
                      </div>
                    )}
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
                      JPG, PNG, WEBP or GIF up to 5MB each. You can keep or remove existing images and add up to {MAX_PRODUCT_IMAGES} images total.
                    </div>
                    {imageFiles.length > 0 && (
                      <>
                        <button
                          type="button"
                          className="btn btn-link btn-sm p-0 mt-2"
                          onClick={clearSelectedImages}
                          disabled={loading}
                        >
                          Remove all newly selected images
                        </button>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))',
                          gap: 10,
                          marginTop: 10,
                        }}>
                          {imagePreviews.map((previewSrc, index) => (
                            <div
                              key={`${previewSrc}-${index}`}
                              style={{ position: 'relative' }}
                            >
                              <img
                                src={previewSrc}
                                alt={`New product ${index + 1}`}
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

                  <div className="mb-3">
                    <label className="form-label fw-semibold"
                      style={{ fontSize: 13 }}>
                      Add Image URL
                    </label>
                    <input
                      type="url"
                      name="thumbnail_url"
                      className={`form-control ${
                        formErrors.thumbnail_url
                          ? 'is-invalid'
                          : ''
                      }`}
                      value={form.thumbnail_url}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    <div style={{
                      color: '#878787',
                      fontSize: 12,
                      marginTop: 6,
                    }}>
                      Use a public `http(s)` image URL here if you want to add one more gallery image from the web.
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

                  {/* Active toggle */}
                  <div className="form-check"
                    style={{ marginTop: 8 }}>
                    <input
                      type="checkbox"
                      className="form-check-input"
                      name="is_active"
                      id="is_active"
                      checked={form.is_active}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    <label
                      className="form-check-label"
                      htmlFor="is_active"
                      style={{ fontSize: 14 }}
                    >
                      Product is active (visible to buyers)
                    </label>
                  </div>
                </div>
              </div>

              {/* Right column — filters */}
              <div className="col-lg-4">
                <div className="section-card">
                  <div className="section-card-title">
                    Product Filters
                  </div>

                  {filtersLoading && (
                    <Loader
                      size="sm"
                      text="Loading filters..."
                    />
                  )}

                  {!filtersLoading &&
                    filters.length === 0 && (
                    <div style={{
                      color: '#878787',
                      fontSize: 13,
                      textAlign: 'center',
                      padding: '20px 0',
                    }}>
                      No filters for this subcategory.
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
              display: 'flex', gap: 12, marginTop: 16,
              padding: '16px 0',
              borderTop: '1px solid var(--border)',
            }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ minWidth: 140 }}
              >
                {loading ? (
                  <span className="d-flex align-items-center
                    gap-2">
                    <span className="spinner-border
                      spinner-border-sm" />
                    Saving...
                  </span>
                ) : 'Save Changes'}
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

export default SellerEditProductPage;
