import { useNavigate } from 'react-router-dom';

const CATEGORY_ICONS = {
  electronics: '📱',
  fashion: '👗',
  'home appliances': '🏠',
  books: '📚',
  sports: '⚽',
  beauty: '💄',
  toys: '🧸',
  grocery: '🛒',
  furniture: '🪑',
  default: '📦',
};

const getCategoryIcon = (name) => {
  const key = name?.toLowerCase();
  return (
    Object.entries(CATEGORY_ICONS).find(([k]) =>
      key?.includes(k)
    )?.[1] || CATEGORY_ICONS.default
  );
};

const CategoryCard = ({ category }) => {
  const navigate = useNavigate();

  return (
    <div
      className="category-card"
      onClick={() =>
        navigate(`/products?category=${category.slug}`)
      }
    >
      <div className="cat-icon">
        {category.image_url ? (
          <img
            src={category.image_url}
            alt={category.name}
            style={{
              width: 40,
              height: 40,
              objectFit: 'contain',
            }}
            onError={(e) => {
              e.target.replaceWith(
                Object.assign(
                  document.createElement('span'),
                  {
                    textContent: getCategoryIcon(
                      category.name
                    ),
                  }
                )
              );
            }}
          />
        ) : (
          getCategoryIcon(category.name)
        )}
      </div>
      <div className="cat-name">{category.name}</div>
    </div>
  );
};

export default CategoryCard;