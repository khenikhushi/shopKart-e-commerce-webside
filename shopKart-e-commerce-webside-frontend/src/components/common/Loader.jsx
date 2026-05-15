const Loader = ({ fullPage = false, size = 'md', text = '' }) => {
  const sizeClass = size === 'sm'
    ? 'spinner-border-sm' : '';

  if (fullPage) {
    return (
      <div
        className="d-flex flex-column justify-content-center
          align-items-center"
        style={{ minHeight: '60vh', gap: 16 }}
      >
        <div
          className={`spinner-border text-primary ${sizeClass}`}
          role="status"
        >
          <span className="visually-hidden">Loading...</span>
        </div>
        {text && (
          <p style={{ color: '#878787', fontSize: 14 }}>{text}</p>
        )}
      </div>
    );
  }

  return (
    <div className="d-flex justify-content-center
      align-items-center p-4" style={{ gap: 10 }}>
      <div
        className={`spinner-border text-primary ${sizeClass}`}
        role="status"
        style={{ width: size === 'sm' ? 18 : 28,
          height: size === 'sm' ? 18 : 28 }}
      >
        <span className="visually-hidden">Loading...</span>
      </div>
      {text && (
        <span style={{ fontSize: 14, color: '#878787' }}>{text}</span>
      )}
    </div>
  );
};

export default Loader;