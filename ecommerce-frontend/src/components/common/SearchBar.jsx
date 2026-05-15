import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SearchBar = ({
  initialValue = '',
  placeholder = 'Search for products, brands and more',
  onSearch = null,
  navigateTo = '/products',
}) => {
  const [query, setQuery] = useState(initialValue);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    if (onSearch) {
      onSearch(trimmed);
    } else {
      navigate(`${navigateTo}?search=${encodeURIComponent(trimmed)}`);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="d-flex"
      style={{ width: '100%', maxWidth: 600 }}
    >
      <input
        type="text"
        className="form-control"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{
          borderRadius: '4px 0 0 4px',
          border: 'none',
          fontSize: 14,
          padding: '8px 16px',
        }}
      />
      <button
        type="submit"
        style={{
          background: 'var(--accent)',
          border: 'none',
          borderRadius: '0 4px 4px 0',
          padding: '8px 20px',
          cursor: 'pointer',
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16"
          height="16" fill="white" viewBox="0 0 16 16">
          <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397
            1.398h-.001c.03.04.062.078.098.115l3.85
            3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007
            1.007 0 0 0-.115-.099zm-5.242
            1.656a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11z"/>
        </svg>
      </button>
    </form>
  );
};

export default SearchBar;