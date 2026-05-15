const Pagination = ({
  page,
  totalPages,
  onPageChange,
  hasNext,
  hasPrev,
}) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    pages.push(1);
    let start = Math.max(2, page - 1);
    let end = Math.min(totalPages - 1, page + 1);

    if (start > 2) pages.push('...');
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages - 1) pages.push('...');
    pages.push(totalPages);

    return pages;
  };

  return (
    <nav aria-label="Page navigation">
      <ul className="pagination justify-content-center mb-0">
        <li className={`page-item ${!hasPrev ? 'disabled' : ''}`}>
          <button
            className="page-link"
            onClick={() => onPageChange(page - 1)}
            disabled={!hasPrev}
          >
            Previous
          </button>
        </li>

        {getPageNumbers().map((p, idx) => (
          <li
            key={idx}
            className={`page-item ${p === page ? 'active' : ''} ${p === '...' ? 'disabled' : ''}`}
          >
            <button
              className="page-link"
              onClick={() => typeof p === 'number' && onPageChange(p)}
              disabled={p === '...'}
            >
              {p}
            </button>
          </li>
        ))}

        <li className={`page-item ${!hasNext ? 'disabled' : ''}`}>
          <button
            className="page-link"
            onClick={() => onPageChange(page + 1)}
            disabled={!hasNext}
          >
            Next
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;