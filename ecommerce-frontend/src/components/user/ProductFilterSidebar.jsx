const ProductFilterSidebar = ({
  filters,
  selectedValues,
  onFilterChange,
  onClearAll,
}) => {
  const hasSelections = Object.values(selectedValues)
    .some((vals) => vals.length > 0);

  return (
    <div className="filter-sidebar">
      <div className="filter-sidebar-title">
        <span>Filters</span>
        {hasSelections && (
          <button
            onClick={onClearAll}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              padding: 0,
            }}
          >
            Clear All
          </button>
        )}
      </div>

      {filters.length === 0 && (
        <div style={{
          fontSize: 13, color: '#878787',
          textAlign: 'center', padding: '16px 0',
        }}>
          No filters available
        </div>
      )}

      {filters.map((filter) => (
        <div key={filter.id} className="filter-group">
          <div className="filter-group-title">
            {filter.display_name}
          </div>
          {filter.values?.map((val) => (
            <label key={val.id} className="filter-option">
              <input
                type={
                  filter.filter_type === 'radio'
                    ? 'radio'
                    : 'checkbox'
                }
                name={`filter_${filter.id}`}
                checked={(
                  selectedValues[filter.name] || []
                ).includes(val.value)}
                onChange={() =>
                  onFilterChange(
                    filter.name,
                    val.value,
                    filter.filter_type
                  )
                }
              />
              {val.value}
            </label>
          ))}
        </div>
      ))}
    </div>
  );
};

export default ProductFilterSidebar;