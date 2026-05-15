import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import ProductCard from '../../components/user/ProductCard';
// import ProductFilterSidebar from '../../components/user/ProductFilterSidebar';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import productApi from '../../api/product.api';
import categoryApi from '../../api/category.api';
import subCategoryApi from '../../api/subCategory.api';
import filterApi from '../../api/filter.api';
import cartApi from '../../api/cart.api';
import useCart from '../../hooks/useCart';
import useAuth from '../../hooks/useAuth';
import '../../styles/product-card.css';
import '../../styles/filter.css';

const SORT_OPTIONS = [
  { label: 'Newest', sort: 'created_at', order: 'desc' },
  { label: 'Price: Low', sort: 'price', order: 'asc' },
  { label: 'Price: High', sort: 'price', order: 'desc' },
  { label: 'Name A-Z', sort: 'name', order: 'asc' },
];

const DEFAULT_SORT = SORT_OPTIONS[0];

const MARKET_SHORTCUTS = [
  {
    label: 'All',
    action: { reset: true },
  },
  {
    label: "Today's Deals",
    action: { search: 'deals', sort: 'price', order: 'asc' },
  },
  {
    label: 'Fashion',
    action: {
      categoryKeywords: ['fashion', 'cloth', 'apparel'],
    },
  },
  {
    label: 'Electronics',
    action: {
      categoryKeywords: ['electronics', 'mobile', 'phone', 'laptop'],
    },
  },
  {
    label: 'Home',
    action: {
      categoryKeywords: ['home', 'furniture', 'decor', 'kitchen'],
    },
  },
  {
    label: 'Beauty',
    action: {
      categoryKeywords: ['beauty', 'cosmetic', 'groom'],
    },
  },
];

const sortByName = (items = []) => {
  return [...items].sort((a, b) =>
    (a?.name || '').localeCompare(b?.name || '')
  );
};

const parseDelimitedValues = (value = '') => {
  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

const collectParentIds = (targetId, nodes = []) => {
  if (!targetId) {
    return [];
  }

  let result = [];

  const traverse = (list, parentIds) => {
    for (const node of list) {
      if (node.id === targetId) {
        result = parentIds;
        return true;
      }

      const nextParentIds = [...parentIds, node.id];
      if (node.children?.length) {
        const found = traverse(node.children, nextParentIds);
        if (found) {
          return true;
        }
      }
    }

    return false;
  };

  traverse(nodes, []);
  return result;
};

const CategoryTreeItem = ({
  node,
  depth,
  selectedCategoryId,
  expandedCategories,
  onToggle,
  onSelect,
}) => {
  const hasChildren = (node.children || []).length > 0;
  const isExpanded = Boolean(expandedCategories[node.id]);
  const isSelected = selectedCategoryId === node.id;

  return (
    <div className="category-tree-item">
      <div
        className={`category-tree-row ${isSelected ? 'active' : ''}`}
        style={{ paddingLeft: `${8 + depth * 14}px` }}
      >
        {hasChildren ? (
          <button
            type="button"
            className="category-tree-toggle"
            onClick={() => onToggle(node.id)}
            aria-label={isExpanded ? 'Collapse category' : 'Expand category'}
          >
            {isExpanded ? '-' : '+'}
          </button>
        ) : (
          <span className="category-tree-toggle-placeholder" />
        )}

        <button
          type="button"
          className="category-tree-link"
          onClick={() => onSelect(node.id)}
          title={node.name}
        >
          {node.name}
        </button>
      </div>

      {hasChildren && isExpanded && (
        <div className="category-tree-children">
          {node.children.map((child) => (
            <CategoryTreeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedCategoryId={selectedCategoryId}
              expandedCategories={expandedCategories}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const ProductListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { refreshCart } = useCart();
  const { isUser, isAuthenticated } = useAuth();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 12;

  const [filters, setFilters] = useState([]);
  const [selectedValues, setSelectedValues] = useState({});
  const [filtersVisible, setFiltersVisible] = useState(false);

  const [categoryTree, setCategoryTree] = useState([]);
  const [categoryTreeLoading, setCategoryTreeLoading] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [subCategories, setSubCategories] = useState([]);

  const [brandOptions, setBrandOptions] = useState([]);
  const [brandLoading, setBrandLoading] = useState(false);

  const [minPriceInput, setMinPriceInput] = useState('');
  const [maxPriceInput, setMaxPriceInput] = useState('');

  const [addingId, setAddingId] = useState('');
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success',
  });

  const searchQuery = searchParams.get('search') || '';
  const categoryId = searchParams.get('categoryId') || '';
  const selectedCategorySlug = searchParams.get('category') || '';
  const subcategorySlug = searchParams.get('subcategory') || '';
  const brandQuery = searchParams.get('brand') || '';
  const minPriceQuery = searchParams.get('min_price') || '';
  const maxPriceQuery = searchParams.get('max_price') || '';
  const sortQuery = searchParams.get('sort') || DEFAULT_SORT.sort;
  const orderQuery = searchParams.get('order') || DEFAULT_SORT.order;

  const selectedBrands = useMemo(() => {
    return parseDelimitedValues(brandQuery);
  }, [brandQuery]);

  const availableBrandOptions = useMemo(() => {
    const merged = [...new Set([...brandOptions, ...selectedBrands])];
    return merged.sort((a, b) => a.localeCompare(b));
  }, [brandOptions, selectedBrands]);

  const canPurchase = isAuthenticated() && isUser();

  const categoryMaps = useMemo(() => {
    const byId = new Map();
    const bySlug = new Map();

    const walk = (nodes = []) => {
      nodes.forEach((node) => {
        byId.set(node.id, node);
        bySlug.set(node.slug, node.id);

        if (node.children?.length) {
          walk(node.children);
        }
      });
    };

    walk(categoryTree);

    return { byId, bySlug };
  }, [categoryTree]);

  const resolveCategoryIdByKeywords = useCallback(
    (keywords = []) => {
      if (!Array.isArray(keywords) || keywords.length === 0) {
        return '';
      }

      const normalizedKeywords = keywords
        .map((keyword) => String(keyword || '').trim().toLowerCase())
        .filter(Boolean);

      if (normalizedKeywords.length === 0) {
        return '';
      }

      for (const node of categoryMaps.byId.values()) {
        const searchable = `${node?.name || ''} ${node?.slug || ''}`
          .trim()
          .toLowerCase();

        if (
          normalizedKeywords.some((keyword) => searchable.includes(keyword))
        ) {
          return node.id;
        }
      }

      return '';
    },
    [categoryMaps]
  );

  const selectedCategory = categoryMaps.byId.get(categoryId) || null;

  const selectedSubCategory = useMemo(() => {
    if (!subcategorySlug) {
      return null;
    }

    return subCategories.find((sub) => sub.slug === subcategorySlug) || null;
  }, [subCategories, subcategorySlug]);

  const activeSort = useMemo(() => {
    const index = SORT_OPTIONS.findIndex(
      (option) => option.sort === sortQuery && option.order === orderQuery
    );

    return index >= 0 ? index : 0;
  }, [sortQuery, orderQuery]);

  const hasAttributeFilters = useMemo(() => {
    return Object.values(selectedValues).some(
      (values) => Array.isArray(values) && values.length > 0
    );
  }, [selectedValues]);

  const hasCatalogFilters = Boolean(
    searchQuery ||
    categoryId ||
    subcategorySlug ||
    brandQuery ||
    minPriceQuery ||
    maxPriceQuery ||
    hasAttributeFilters
  );

  const catalogDescription = useMemo(() => {
    if (selectedSubCategory && selectedCategory) {
      return `Browsing ${selectedSubCategory.name} inside ${selectedCategory.name}.`;
    }

    if (selectedCategory) {
      return `Browsing the ${selectedCategory.name} catalog with your current filters.`;
    }

    if (searchQuery.trim()) {
      return `Showing products that match "${searchQuery.trim()}".`;
    }

    return 'Browse your full marketplace catalog with category, brand, and price filters.';
  }, [searchQuery, selectedCategory, selectedSubCategory]);

  const activeFilterPills = useMemo(() => {
    const pills = [];

    if (searchQuery.trim()) {
      pills.push(`Search: ${searchQuery.trim()}`);
    }

    if (selectedCategory?.name) {
      pills.push(`Category: ${selectedCategory.name}`);
    }

    if (selectedSubCategory?.name) {
      pills.push(`Subcategory: ${selectedSubCategory.name}`);
    }

    selectedBrands.forEach((brandName) => {
      pills.push(`Brand: ${brandName}`);
    });

    if (minPriceQuery.trim() || maxPriceQuery.trim()) {
      const minLabel = minPriceQuery.trim() || '0';
      const maxLabel = maxPriceQuery.trim() || 'Any';
      pills.push(`Price: ${minLabel} - ${maxLabel}`);
    }

    Object.entries(selectedValues).forEach(([key, values]) => {
      if (!Array.isArray(values) || values.length === 0) {
        return;
      }

      values.forEach((value) => {
        pills.push(`${key.replace(/_/g, ' ')}: ${value}`);
      });
    });

    return pills;
  }, [
    searchQuery,
    selectedCategory,
    selectedSubCategory,
    selectedBrands,
    minPriceQuery,
    maxPriceQuery,
    selectedValues,
  ]);

  const priceValidationError = useMemo(() => {
    const min = minPriceInput.trim();
    const max = maxPriceInput.trim();

    if (min && !Number.isFinite(Number(min))) {
      return 'Enter a valid minimum price.';
    }

    if (max && !Number.isFinite(Number(max))) {
      return 'Enter a valid maximum price.';
    }

    if (min && max && Number(min) > Number(max)) {
      return 'Minimum price cannot be greater than maximum price.';
    }

    return '';
  }, [minPriceInput, maxPriceInput]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(
      () => setToast({ show: false, message: '', type: 'success' }),
      3000
    );
  };

  const updateQueryParams = useCallback(
    (mutator, options = {}) => {
      const next = new URLSearchParams(searchParams);
      mutator(next);
      setSearchParams(next, options);
    },
    [searchParams, setSearchParams]
  );

  const applyMarketplaceAction = useCallback(
    (action = {}) => {
      const {
        reset = false,
        search = '',
        categoryKeywords = [],
        sort = '',
        order = '',
      } = action;

      const matchedCategoryId = resolveCategoryIdByKeywords(categoryKeywords);

      setSelectedValues({});
      setMinPriceInput('');
      setMaxPriceInput('');

      updateQueryParams((params) => {
        if (reset) {
          [
            'search',
            'categoryId',
            'category',
            'subcategory',
            'brand',
            'min_price',
            'max_price',
            'sort',
            'order',
          ].forEach((key) => params.delete(key));
          return;
        }

        if (matchedCategoryId) {
          params.set('categoryId', matchedCategoryId);
          // Also set the category slug
          const categoryNode = categoryMaps.byId.get(matchedCategoryId);
          if (categoryNode?.slug) {
            params.set('category', categoryNode.slug);
          }
        } else {
          params.delete('categoryId');
          params.delete('category');
        }

        params.delete('subcategory');
        params.delete('brand');
        params.delete('min_price');
        params.delete('max_price');

        if (search.trim()) {
          params.set('search', search.trim());
        } else if (matchedCategoryId) {
          params.delete('search');
        }

        if (sort && order) {
          params.set('sort', sort);
          params.set('order', order);
        }
      });

      setFiltersVisible(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [resolveCategoryIdByKeywords, updateQueryParams]
  );

  const isMarketplaceShortcutActive = useCallback(
    (shortcut) => {
      const action = shortcut?.action || {};
      const hasSortSelection = Boolean(
        searchParams.get('sort') || searchParams.get('order')
      );

      if (action.reset) {
        return !hasCatalogFilters && !hasSortSelection;
      }

      const matchedCategoryId = resolveCategoryIdByKeywords(
        action.categoryKeywords || []
      );

      const matchesCategory = matchedCategoryId
        ? matchedCategoryId === categoryId
        : true;
      const matchesSearch = action.search
        ? searchQuery.trim().toLowerCase() === action.search.toLowerCase()
        : true;
      const matchesSort = action.sort && action.order
        ? sortQuery === action.sort && orderQuery === action.order
        : true;

      return matchesCategory && matchesSearch && matchesSort;
    },
    [
      searchParams,
      hasCatalogFilters,
      searchQuery,
      categoryId,
      sortQuery,
      orderQuery,
      resolveCategoryIdByKeywords,
    ]
  );

  useEffect(() => {
    setMinPriceInput(minPriceQuery);
  }, [minPriceQuery]);

  useEffect(() => {
    setMaxPriceInput(maxPriceQuery);
  }, [maxPriceQuery]);

  useEffect(() => {
    if (priceValidationError) {
      return;
    }

    const timeoutId = setTimeout(() => {
      const nextMin = minPriceInput.trim();
      const nextMax = maxPriceInput.trim();

      if (nextMin === minPriceQuery && nextMax === maxPriceQuery) {
        return;
      }

      updateQueryParams(
        (params) => {
          if (nextMin) {
            params.set('min_price', nextMin);
          } else {
            params.delete('min_price');
          }

          if (nextMax) {
            params.set('max_price', nextMax);
          } else {
            params.delete('max_price');
          }
        },
        { replace: true }
      );
    }, 450);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [
    minPriceInput,
    maxPriceInput,
    minPriceQuery,
    maxPriceQuery,
    priceValidationError,
    updateQueryParams,
  ]);

  useEffect(() => {
    let isMounted = true;

    const loadCategoryTree = async () => {
      setCategoryTreeLoading(true);

      try {
        const res = await categoryApi.getTree();
        const categories = sortByName(res.data.data.categories || []);

        if (!isMounted) {
          return;
        }

        setCategoryTree(categories);

        setExpandedCategories((prev) => {
          if (Object.keys(prev).length > 0) {
            return prev;
          }

          const initial = {};
          categories.forEach((category) => {
            initial[category.id] = true;
          });

          return initial;
        });
      } catch {
        if (isMounted) {
          setCategoryTree([]);
        }
      } finally {
        if (isMounted) {
          setCategoryTreeLoading(false);
        }
      }
    };

    loadCategoryTree();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedCategorySlug || categoryId || categoryMaps.bySlug.size === 0) {
      return;
    }

    const legacyId = categoryMaps.bySlug.get(selectedCategorySlug);
    if (!legacyId) {
      return;
    }

    updateQueryParams(
      (params) => {
        params.set('categoryId', legacyId);
        params.delete('category');
      },
      { replace: true }
    );
  }, [
    selectedCategorySlug,
    categoryId,
    categoryMaps.bySlug,
    updateQueryParams,
  ]);

  useEffect(() => {
    if (!categoryId || categoryTree.length === 0) {
      return;
    }

    const parentIds = collectParentIds(categoryId, categoryTree);
    if (parentIds.length === 0) {
      return;
    }

    setExpandedCategories((prev) => {
      const next = { ...prev };
      parentIds.forEach((id) => {
        next[id] = true;
      });
      return next;
    });
  }, [categoryId, categoryTree]);

  useEffect(() => {
    let isMounted = true;

    const loadSubCategories = async () => {
      if (!categoryId) {
        if (isMounted) {
          setSubCategories([]);
        }
        return;
      }

      try {
        const res = await subCategoryApi.getAll({
          page: 1,
          limit: 200,
          category_id: categoryId,
        });

        const nextSubCategories = sortByName(
          res.data.data.subCategories || []
        );

        if (!isMounted) {
          return;
        }

        setSubCategories(nextSubCategories);

        if (
          subcategorySlug &&
          !nextSubCategories.some((sub) => sub.slug === subcategorySlug)
        ) {
          updateQueryParams(
            (params) => {
              params.delete('subcategory');
            },
            { replace: true }
          );
        }
      } catch {
        if (isMounted) {
          setSubCategories([]);
        }
      }
    };

    loadSubCategories();

    return () => {
      isMounted = false;
    };
  }, [
    categoryId,
    subcategorySlug,
    updateQueryParams,
  ]);

  useEffect(() => {
    if (!subcategorySlug && !selectedCategorySlug) {
      setFilters([]);
      return;
    }

    let isMounted = true;

    const loadFilters = async () => {
      try {
        if (subcategorySlug) {
          const res = await filterApi.getBySubCategory(subcategorySlug);
          if (isMounted) {
            setFilters(res.data.data.filters || []);
          }
          return;
        }

        if (selectedCategorySlug) {
          const res = await filterApi.getByCategory(selectedCategorySlug);
          if (isMounted) {
            setFilters(res.data.data.filters || []);
          }
          return;
        }

        if (isMounted) {
          setFilters([]);
        }
      } catch {
        if (isMounted) {
          setFilters([]);
        }
      }
    };

    loadFilters();

    return () => {
      isMounted = false;
    };
  }, [subcategorySlug, selectedCategorySlug]);

  useEffect(() => {
    setSelectedValues({});
  }, [categoryId, subcategorySlug]);

  useEffect(() => {
    let isMounted = true;

    const loadBrands = async () => {
      setBrandLoading(true);

      try {
        const params = {};

        if (searchQuery.trim()) {
          params.search = searchQuery.trim();
        }

        if (categoryId) {
          params.categoryId = categoryId;
        }

        if (selectedCategorySlug) {
          params.category = selectedCategorySlug;
        }

        if (subcategorySlug) {
          params.subcategory = subcategorySlug;
        }

        if (minPriceQuery.trim()) {
          params.min_price = minPriceQuery.trim();
        }

        if (maxPriceQuery.trim()) {
          params.max_price = maxPriceQuery.trim();
        }

        Object.entries(selectedValues).forEach(([key, values]) => {
          if (Array.isArray(values) && values.length > 0) {
            params[key] = values.join(',');
          }
        });

        const res = await productApi.getBrands(params);

        if (!isMounted) {
          return;
        }

        setBrandOptions(res.data.data.brands || []);
      } catch {
        if (isMounted) {
          setBrandOptions([]);
        }
      } finally {
        if (isMounted) {
          setBrandLoading(false);
        }
      }
    };

    loadBrands();

    return () => {
      isMounted = false;
    };
  }, [
    searchQuery,
    categoryId,
    selectedCategorySlug,
    subcategorySlug,
    minPriceQuery,
    maxPriceQuery,
    selectedValues,
  ]);

  const fetchProducts = useCallback(
    async (currentPage = 1) => {
      setLoading(true);
      setError('');

      try {
        const sortOption = SORT_OPTIONS[activeSort] || DEFAULT_SORT;

        const params = {
          page: currentPage,
          limit,
          sort: sortOption.sort,
          order: sortOption.order,
        };

        if (searchQuery.trim()) {
          params.search = searchQuery.trim();
        }

        if (categoryId) {
          params.categoryId = categoryId;
        }

        if (selectedCategorySlug) {
          params.category = selectedCategorySlug;
        }

        if (subcategorySlug) {
          params.subcategory = subcategorySlug;
        }

        if (brandQuery.trim()) {
          params.brand = brandQuery.trim();
        }

        if (minPriceQuery.trim()) {
          params.min_price = minPriceQuery.trim();
        }

        if (maxPriceQuery.trim()) {
          params.max_price = maxPriceQuery.trim();
        }

        Object.entries(selectedValues).forEach(([key, values]) => {
          if (Array.isArray(values) && values.length > 0) {
            params[key] = values.join(',');
          }
        });

        const res = await productApi.getAll(params);

        setProducts(res.data.data.products || []);
        setTotalPages(res.data.pagination?.totalPages || 1);
        setTotalItems(res.data.pagination?.totalItems || 0);
      } catch (err) {
        setError(
          err.response?.data?.message ||
          'Failed to load products.'
        );
      } finally {
        setLoading(false);
      }
    },
    [
      activeSort,
      searchQuery,
      categoryId,
      selectedCategorySlug,
      subcategorySlug,
      brandQuery,
      minPriceQuery,
      maxPriceQuery,
      selectedValues,
    ]
  );

  useEffect(() => {
    setPage(1);
  }, [
    activeSort,
    searchQuery,
    categoryId,
    subcategorySlug,
    brandQuery,
    minPriceQuery,
    maxPriceQuery,
    selectedValues,
  ]);

  useEffect(() => {
    fetchProducts(page);
  }, [fetchProducts, page]);

  const handleFilterChange = (filterName, value, type) => {
    setSelectedValues((prev) => {
      const current = prev[filterName] || [];

      if (type === 'radio') {
        return {
          ...prev,
          [filterName]: current.includes(value)
            ? []
            : [value],
        };
      }

      return {
        ...prev,
        [filterName]: current.includes(value)
          ? current.filter((item) => item !== value)
          : [...current, value],
      };
    });
  };

  const handleToggleCategory = (targetCategoryId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [targetCategoryId]: !prev[targetCategoryId],
    }));
  };

  const handleCategorySelect = (targetCategoryId = '') => {
    if (targetCategoryId) {
      setExpandedCategories((prev) => ({
        ...prev,
        [targetCategoryId]: true,
      }));
    }

    updateQueryParams((params) => {
      if (targetCategoryId) {
        params.set('categoryId', targetCategoryId);
      } else {
        params.delete('categoryId');
      }

      params.delete('category');
      params.delete('subcategory');
    });
  };

  const handleSubCategorySelect = (slug = '') => {
    updateQueryParams((params) => {
      if (slug) {
        params.set('subcategory', slug);
      } else {
        params.delete('subcategory');
      }
    });
  };

  const handleSortChange = (index) => {
    const nextSort = SORT_OPTIONS[index] || DEFAULT_SORT;

    updateQueryParams((params) => {
      params.set('sort', nextSort.sort);
      params.set('order', nextSort.order);
    });
  };

  const handleBrandToggle = (brandName) => {
    const next = selectedBrands.includes(brandName)
      ? selectedBrands.filter((item) => item !== brandName)
      : [...selectedBrands, brandName];

    updateQueryParams((params) => {
      if (next.length > 0) {
        params.set('brand', next.join(','));
      } else {
        params.delete('brand');
      }
    });
  };

  const handleClearBrandFilters = () => {
    updateQueryParams((params) => {
      params.delete('brand');
    });
  };

  const handleClearPriceFilters = () => {
    setMinPriceInput('');
    setMaxPriceInput('');

    updateQueryParams((params) => {
      params.delete('min_price');
      params.delete('max_price');
    });
  };

  const handleClearAllFilters = () => {
    setSelectedValues({});
    setMinPriceInput('');
    setMaxPriceInput('');

    updateQueryParams((params) => {
      params.delete('subcategory');
      params.delete('brand');
      params.delete('min_price');
      params.delete('max_price');
    });
  };

  const handleAddToCart = async (product) => {
    if (!canPurchase) {
      showToast('Login to purchase', 'error');
      return;
    }

    setAddingId(product.id);

    try {
      await cartApi.addItem({
        product_id: product.id,
        quantity: 1,
      });

      await refreshCart();
      showToast(`"${product.name}" added to cart!`);
    } catch (err) {
      showToast(
        err.response?.data?.message || 'Failed to add to cart.',
        'error'
      );
    } finally {
      setAddingId('');
    }
  };

  const headingText = selectedSubCategory?.name ||
    selectedCategory?.name ||
    (searchQuery
      ? `Results for "${searchQuery}"`
      : 'All Products');

  return (
    <>
      <Navbar />

      <div className="page-wrapper">
        <div className="container">
          <section className="catalog-topbar">
            <div className="market-utility-strip">
              {MARKET_SHORTCUTS.map((shortcut) => (
                <button
                  key={shortcut.label}
                  type="button"
                  className={`market-shortcut-btn ${isMarketplaceShortcutActive(shortcut) ? 'active' : ''}`}
                  onClick={() => applyMarketplaceAction(shortcut.action)}
                >
                  {shortcut.label}
                </button>
              ))}
            </div>

            <div className="catalog-summary-card">
              <div className="catalog-summary-copy">
                <span className="catalog-summary-badge">
                  {hasCatalogFilters ? 'Filtered Catalog' : 'Marketplace Catalog'}
                </span>
                <h1>{headingText}</h1>
                <p>{catalogDescription}</p>
              </div>

              <div className="catalog-summary-side">
                <strong>{totalItems}</strong>
                <span>{totalItems === 1 ? 'product found' : 'products found'}</span>
                <button
                  type="button"
                  className="catalog-summary-action"
                  onClick={() =>
                    hasCatalogFilters
                      ? applyMarketplaceAction({ reset: true })
                      : applyMarketplaceAction(MARKET_SHORTCUTS[1].action)
                  }
                >
                  {hasCatalogFilters ? 'Browse all products' : "Show today's deals"}
                </button>
              </div>
            </div>

          </section>

          <div className="product-list-layout">
            <aside className={`filter-column ${filtersVisible ? 'show' : ''}`}>
              <div className="amazon-sidebar">
                <div className="sidebar-block">
                  <div className="sidebar-block-title">Categories</div>

                  <button
                    type="button"
                    className={`category-all-btn ${!categoryId ? 'active' : ''}`}
                    onClick={() => handleCategorySelect('')}
                  >
                    All Categories
                  </button>

                  {categoryTreeLoading && (
                    <div className="sidebar-loading">Loading categories...</div>
                  )}

                  {!categoryTreeLoading && categoryTree.length === 0 && (
                    <div className="sidebar-hint">No categories found.</div>
                  )}

                  {!categoryTreeLoading && categoryTree.length > 0 && (
                    <div className="category-tree-list">
                      {categoryTree.map((categoryNode) => (
                        <CategoryTreeItem
                          key={categoryNode.id}
                          node={categoryNode}
                          depth={0}
                          selectedCategoryId={categoryId}
                          expandedCategories={expandedCategories}
                          onToggle={handleToggleCategory}
                          onSelect={handleCategorySelect}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="sidebar-block">
                  <div className="sidebar-block-title">Subcategories</div>

                  {categoryId ? (
                    <select
                      className="sidebar-select"
                      value={subcategorySlug}
                      onChange={(e) => handleSubCategorySelect(e.target.value)}
                    >
                      <option value="">All Subcategories</option>
                      {subCategories.map((sub) => (
                        <option key={sub.id} value={sub.slug}>
                          {sub.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="sidebar-hint">
                      Select a category to view subcategories.
                    </div>
                  )}
                </div>

                <div className="sidebar-block">
                  <div className="sidebar-block-title">Brand</div>

                  {brandLoading && (
                    <div className="sidebar-loading">Loading brands...</div>
                  )}

                  {!brandLoading && availableBrandOptions.length === 0 && (
                    <div className="sidebar-hint">No brands found.</div>
                  )}

                  {!brandLoading && availableBrandOptions.length > 0 && (
                    <div className="brand-filter-list">
                      {availableBrandOptions.map((brandName) => (
                        <label key={brandName} className="brand-filter-option">
                          <input
                            type="checkbox"
                            checked={selectedBrands.includes(brandName)}
                            onChange={() => handleBrandToggle(brandName)}
                          />
                          <span>{brandName}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {selectedBrands.length > 0 && (
                    <div className="sidebar-actions">
                      <button
                        type="button"
                        className="sidebar-clear-btn w-100"
                        onClick={handleClearBrandFilters}
                      >
                        Clear Brands
                      </button>
                    </div>
                  )}
                </div>

                <div className="sidebar-block">
                  <div className="sidebar-block-title">Price Range</div>

                  <div className="price-range-grid">
                    <input
                      id="min-price-filter"
                      className="sidebar-input"
                      type="number"
                      min="0"
                      placeholder="Min"
                      value={minPriceInput}
                      onChange={(e) => setMinPriceInput(e.target.value)}
                    />
                    <input
                      id="max-price-filter"
                      className="sidebar-input"
                      type="number"
                      min="0"
                      placeholder="Max"
                      value={maxPriceInput}
                      onChange={(e) => setMaxPriceInput(e.target.value)}
                    />
                  </div>

                  {priceValidationError && (
                    <div className="sidebar-hint sidebar-error">
                      {priceValidationError}
                    </div>
                  )}

                  <div className="sidebar-actions">
                    <button
                      type="button"
                      className="sidebar-clear-btn w-100"
                      onClick={handleClearPriceFilters}
                    >
                      Clear Price
                    </button>
                  </div>
                </div>
              </div>

              {/* {filters.length > 0 && (
                <ProductFilterSidebar
                  filters={filters}
                  selectedValues={selectedValues}
                  onFilterChange={handleFilterChange}
                  onClearAll={handleClearAllFilters}
                />
              )} */}
            </aside>

            <div className="products-column">
              <div className="sort-bar">
                <span className="sort-bar-label">Sort by:</span>
                {SORT_OPTIONS.map((option, index) => (
                  <button
                    key={option.label}
                    type="button"
                    className={`sort-btn ${activeSort === index ? 'active' : ''}`}
                    onClick={() => handleSortChange(index)}
                  >
                    {option.label}
                  </button>
                ))}
                <span className="results-count">{totalItems} results</span>
              </div>

              {loading && <Loader text="Loading products..." />}

              {error && (
                <ErrorMessage
                  message={error}
                  onRetry={() => fetchProducts(page)}
                />
              )}

              {!loading && !error && (
                <>
                  {products.length === 0 ? (
                    <EmptyState
                      title="No products found"
                      message="Try adjusting your filters or search query."
                      actionLabel="Clear Filters"
                      onAction={handleClearAllFilters}
                      icon="Search"
                    />
                  ) : (
                    <div className="row g-3">
                      {products.map((product) => (
                        <div
                          key={product.id}
                          className="col-6 col-md-4 col-xl-3"
                        >
                          <ProductCard
                            product={product}
                            onAddToCart={handleAddToCart}
                            addingId={addingId}
                            canPurchase={canPurchase}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {totalPages > 1 && (
                    <div className="mt-4">
                      <Pagination
                        page={page}
                        totalPages={totalPages}
                        onPageChange={setPage}
                        hasNext={page < totalPages}
                        hasPrev={page > 1}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {toast.show && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 9999,
          background: toast.type === 'success' ? '#26a541' : '#ff6161',
          color: 'white',
          padding: '12px 20px',
          borderRadius: 6,
          fontSize: 14,
          fontWeight: 600,
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        }}>
          {toast.type === 'success' ? 'Success:' : 'Error:'} {toast.message}
        </div>
      )}
    </>
  );
};

export default ProductListPage;
