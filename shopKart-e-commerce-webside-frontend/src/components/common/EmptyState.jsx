import { Link } from 'react-router-dom';

const EmptyState = ({
  title = 'Nothing here yet',
  message = '',
  actionLabel = '',
  actionLink = '',
  onAction = null,
  icon = '📭',
}) => {
  return (
    <div
      className="d-flex flex-column align-items-center
        justify-content-center text-center py-5"
      style={{ gap: 12, minHeight: 300 }}
    >
      <div style={{ fontSize: 56 }}>{icon}</div>
      <h5 style={{ color: '#212121', fontWeight: 600 }}>
        {title}
      </h5>
      {message && (
        <p style={{ color: '#878787', fontSize: 14,
          maxWidth: 340, margin: 0 }}>
          {message}
        </p>
      )}
      {actionLabel && actionLink && (
        <Link
          to={actionLink}
          className="btn btn-primary mt-2"
          style={{ borderRadius: 4 }}
        >
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && !actionLink && (
        <button
          className="btn btn-primary mt-2"
          style={{ borderRadius: 4 }}
          onClick={onAction}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;