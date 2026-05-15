import { useState, useEffect, useCallback } from 'react';

const useFetch = (apiFn, params = null) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = params ? await apiFn(params) : await apiFn();
      setData(res.data.data);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        'Something went wrong. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [apiFn, params]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

export default useFetch;