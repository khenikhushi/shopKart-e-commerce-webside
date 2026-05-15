import { useState, useCallback } from 'react';

const usePagination = (defaultLimit = 10) => {
  const [page, setPage] = useState(1);
  const [limit] = useState(defaultLimit);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const updatePagination = useCallback((paginationMeta) => {
    if (!paginationMeta) return;
    setTotalPages(paginationMeta.totalPages || 1);
    setTotalItems(paginationMeta.totalItems || 0);
  }, []);

  const goToPage = useCallback(
    (pageNumber) => {
      if (pageNumber < 1 || pageNumber > totalPages) return;
      setPage(pageNumber);
    },
    [totalPages]
  );

  const nextPage = useCallback(() => {
    setPage((prev) => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setPage((prev) => Math.max(prev - 1, 1));
  }, []);

  const resetPage = useCallback(() => {
    setPage(1);
  }, []);

  return {
    page,
    limit,
    totalPages,
    totalItems,
    updatePagination,
    goToPage,
    nextPage,
    prevPage,
    resetPage,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
};

export default usePagination;