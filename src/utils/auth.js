const TOKEN_KEY = "unikart_token";
const USER_KEY = "unikart_user";

function isBrowser() {
  return typeof window !== "undefined";
}

export function getToken() {
  if (!isBrowser()) {
    return null;
  }

  return window.localStorage.getItem(TOKEN_KEY);
}

export function getStoredToken() {
  return getToken();
}

export function getStoredUser() {
  if (!isBrowser()) {
    return null;
  }

  const rawUser = window.localStorage.getItem(USER_KEY);

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser);
  } catch (error) {
    clearStoredAuth();
    return null;
  }
}

export function saveAuthSession(token, user) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(user || null));
  window.dispatchEvent(new Event("auth-changed"));
}

export function clearStoredAuth() {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event("auth-changed"));
}

export function logoutForUnauthorized() {
  clearStoredAuth();

  if (!isBrowser()) {
    return;
  }

  const currentPath = window.location.pathname + window.location.search;
  const destination = `/login?reason=session-expired&next=${encodeURIComponent(currentPath)}`;

  if (window.location.pathname !== "/login") {
    window.location.href = destination;
  }
}

export function updateStoredUser(patch) {
  const existingUser = getStoredUser();
  const token = getToken();

  if (!existingUser || !token) {
    return;
  }

  saveAuthSession(token, { ...existingUser, ...patch });
}

export function getAuthHeaders(extraHeaders = {}) {
  const token = getToken();

  return {
    ...extraHeaders,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}
