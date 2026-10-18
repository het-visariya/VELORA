import { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { UNAUTHORIZED_EVENT } from '../api/client';
import {
  TOKEN_KEY,
  clearAuthStorage,
  getTokenIdentity,
  getTokenRemainingMs,
  getStoredUser,
  getValidStoredToken,
  isTokenValid,
  storeToken,
  storeUser,
} from '../lib/token';

export const AuthContext = createContext(null);

const EMPTY_USER = { name: '', email: '', profileImage: '' };

/** Build the user shape the UI expects, preferring the server's own fields. */
function toUser(serverUser, token) {
  const identity = getTokenIdentity(token);
  return {
    name: serverUser?.name || 'Member',
    email: serverUser?.email || identity?.email || '',
    profileImage: serverUser?.profileImage || '',
  };
}

export function AuthProvider({ children }) {
  // Derived synchronously from the token so the very first render is already
  // correct. Reading it in an effect instead produced one render with
  // isAuthenticated=false, which bounced reloads to the sign-in modal.
  const [token, setToken] = useState(() => getValidStoredToken());
  const [user, setUser] = useState(() => getStoredUser() || EMPTY_USER);

  const isAuthenticated = isTokenValid(token);
  const expiryTimer = useRef(null);

  const logout = useCallback(() => {
    if (expiryTimer.current) {
      clearTimeout(expiryTimer.current);
      expiryTimer.current = null;
    }
    setToken(null);
    setUser(EMPTY_USER);
    clearAuthStorage();
  }, []);

  /**
   * Adopt a token issued by the API. Returns false when the token is missing
   * or unusable, so the caller can surface an error rather than showing a
   * signed-in UI backed by nothing.
   */
  const login = useCallback((serverUser, newToken) => {
    const candidate = newToken || getValidStoredToken();
    if (!isTokenValid(candidate)) {
      logout();
      return false;
    }
    const nextUser = toUser(serverUser, candidate);
    storeToken(candidate);
    storeUser(nextUser);
    setToken(candidate);
    setUser(nextUser);
    return true;
  }, [logout]);

  const updateUser = useCallback((updated) => {
    setUser((current) => {
      const next = { ...current, ...updated };
      storeUser(next);
      return next;
    });
  }, []);

  // Sign out exactly when the token expires, rather than waiting for the next
  // request to fail. jsonwebtoken's default is 7d, so this is a long timer.
  useEffect(() => {
    if (!token) return undefined;
    const remaining = getTokenRemainingMs(token);
    if (remaining === Number.POSITIVE_INFINITY) return undefined;
    if (remaining <= 0) {
      logout();
      return undefined;
    }
    // setTimeout saturates above ~24.8 days and would fire immediately.
    const delay = Math.min(remaining, 2_147_483_647);
    expiryTimer.current = setTimeout(logout, delay);
    return () => clearTimeout(expiryTimer.current);
  }, [token, logout]);

  // A 401 from any request means this token is finished.
  useEffect(() => {
    const onUnauthorized = () => logout();
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, [logout]);

  // Keep tabs in step: signing out in one tab signs out the others.
  useEffect(() => {
    const onStorage = (event) => {
      if (event.key !== TOKEN_KEY) return;
      const next = getValidStoredToken();
      setToken(next);
      if (!next) setUser(EMPTY_USER);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, token, user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}
