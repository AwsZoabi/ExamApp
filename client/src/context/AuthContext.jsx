import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { dataService } from '../services/dataService';
import { loggerService } from '../services/loggerService';
import { storageService } from '../services/storageService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => storageService.getUser());
  const [isInitializing, setIsInitializing] = useState(() => Boolean(storageService.getToken()));

  useEffect(() => {
    if (!storageService.getToken()) return undefined;
    let active = true;

    dataService
      .getMe()
      .then((freshUser) => {
        if (!active) return;
        storageService.saveSession({ token: storageService.getToken(), user: freshUser });
        setUser(freshUser);
      })
      .catch((error) => {
        if (!active) return;
        loggerService.warning('Stored session could not be refreshed', { message: error.message });
        storageService.clearSession();
        setUser(null);
      })
      .finally(() => {
        if (active) setIsInitializing(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (credentials) => {
    const session = await dataService.login(credentials);
    storageService.saveSession(session);
    setUser(session.user);
    return session.user;
  }, []);

  const register = useCallback(async (details) => {
    const session = await dataService.register(details);
    storageService.saveSession(session);
    setUser(session.user);
    return session.user;
  }, []);

  const logout = useCallback(() => {
    storageService.clearSession();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isInitializing,
      login,
      register,
      logout,
    }),
    [isInitializing, login, logout, register, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider.');
  return context;
}
