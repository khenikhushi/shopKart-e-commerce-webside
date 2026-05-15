const ErrorMessage = ({
  message = 'Something went wrong.',
  onRetry = null,
  fullPage = false,
}) => {
  const content = (
    <div
      className="d-flex flex-column align-items-center
        justify-content-center text-center p-4"
      style={{ gap: 12 }}
    >
      <div style={{ fontSize: 40 }}>⚠️</div>
      <p style={{
        color: '#ff6161',
        fontSize: 15,
        margin: 0,
        maxWidth: 400,
      }}>
        {message}
      </p>
      {onRetry && (
        <button
          className="btn btn-sm btn-outline-danger mt-2"
          onClick={onRetry}
        >
          Try Again
        </button>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div style={{ minHeight: '50vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center' }}>
        {content}
      </div>
    );
  }

  return (
    <div className="alert alert-danger d-flex align-items-start
      gap-2" role="alert">
      <span>⚠️</span>
      <div>
        <span>{message}</span>
        {onRetry && (
          <button
            className="btn btn-link btn-sm p-0 ms-2 text-danger"
            onClick={onRetry}
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;