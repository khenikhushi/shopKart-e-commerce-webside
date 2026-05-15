import {
  formatCurrency,
  formatDate,
} from '../../utils/format.util';
import { resolveImageUrl } from '../../utils/image.util';

const AdminProductTable = ({
  products,
  page,
  limit,
  onToggleStatus,
}) => {
  if (!products || products.length === 0) return null;

  return (
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
          {products.map((product, idx) => {
            const imageSrc = resolveImageUrl(product.thumbnail_url);

            return (
            <tr key={product.id}>
              <td style={{ color: '#878787' }}>
                {(page - 1) * limit + idx + 1}
              </td>

              {/* Product name + thumbnail */}
              <td>
                <div className="d-flex align-items-center gap-2">
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
                        flexShrink: 0,
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        background: '#f0f4ff',
                        borderRadius: 4,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 16,
                        flexShrink: 0,
                      }}
                    >
                      📦
                    </div>
                  )}
                  <div>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: 13,
                        maxWidth: 180,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {product.name}
                    </div>
                    {product.brand && (
                      <div
                        style={{
                          fontSize: 11,
                          color: '#878787',
                        }}
                      >
                        {product.brand}
                      </div>
                    )}
                  </div>
                </div>
              </td>

              {/* Seller */}
              <td>
                <span
                  style={{
                    fontSize: 12,
                    color: '#1a56db',
                    fontWeight: 500,
                  }}
                >
                  {product.seller?.name || '—'}
                </span>
              </td>

              {/* SubCategory */}
              <td style={{ fontSize: 12, color: '#878787' }}>
                {product.subCategory?.name || '—'}
              </td>

              {/* Price */}
              <td>
                <strong style={{ color: 'var(--primary)' }}>
                  {formatCurrency(product.price)}
                </strong>
              </td>

              {/* Stock with color */}
              <td>
                <span
                  style={{
                    color:
                      product.stock === 0
                        ? '#ff6161'
                        : product.stock < 5
                        ? '#ff9f00'
                        : '#26a541',
                    fontWeight: 600,
                    fontSize: 13,
                  }}
                >
                  {product.stock}
                </span>
              </td>

              {/* Status */}
              <td>
                <span
                  className={`status-badge ${
                    product.is_active
                      ? 'badge-active'
                      : 'badge-inactive'
                  }`}
                >
                  {product.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>

              <td style={{ fontSize: 12, color: '#878787' }}>
                {formatDate(product.created_at)}
              </td>

              {/* Toggle action */}
              <td>
                <button
                  className={`action-btn ${
                    product.is_active ? 'danger' : ''
                  }`}
                  onClick={() => onToggleStatus(product)}
                  title={
                    product.is_active
                      ? 'Deactivate'
                      : 'Activate'
                  }
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
  );
};

export default AdminProductTable;
