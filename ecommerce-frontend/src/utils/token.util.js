const TOKEN_KEY = 'ecommerce_token';
const LEGACY_TOKEN_KEYS = ['token', 'authToken'];

const getSessionStorage = () => {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
};

const getLocalStorage = () => {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

const clearTokenKeys = (storage) => {
  if (!storage) return;
  [TOKEN_KEY, ...LEGACY_TOKEN_KEYS].forEach((key) => {
    storage.removeItem(key);
  });
};

const saveToken = (token) => {
  const sessionStorageRef = getSessionStorage();
  if (sessionStorageRef) {
    sessionStorageRef.setItem(TOKEN_KEY, token);
  }
  clearTokenKeys(getLocalStorage());
};

const getToken = () => {
  const sessionStorageRef = getSessionStorage();
  if (!sessionStorageRef) return null;
  return sessionStorageRef.getItem(TOKEN_KEY);
};

const removeToken = () => {
  clearTokenKeys(getSessionStorage());
  clearTokenKeys(getLocalStorage());
};

const hasToken = () => {
  return !!getToken();
};

export { saveToken, getToken, removeToken, hasToken };
