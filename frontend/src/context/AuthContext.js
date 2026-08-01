import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Rehydrate from localStorage on mount ─────────────────
  useEffect(() => {
    const stored = localStorage.getItem('mana_user');
    const token  = localStorage.getItem('mana_token');
    if (stored && token) {
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  // ── Login ────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const data = await authService.login(email, password);
    const userObj = {
      userId: data.userId,
      name:   data.name,
      email:  data.email,
      role:   data.role,
    };
    localStorage.setItem('mana_token',        data.token);
    localStorage.setItem('mana_refresh_token', data.refreshToken || '');
    localStorage.setItem('mana_user',          JSON.stringify(userObj));
    setUser(userObj);
    return data;
  }, []);

  // ── Register cook ────────────────────────────────────────
  const registerCook = useCallback(async (formData) => {
    const data = await authService.registerCook(formData);
    const userObj = { userId: data.userId, name: data.name, email: data.email, role: 'COOK' };
    localStorage.setItem('mana_token', data.token);
    localStorage.setItem('mana_user',  JSON.stringify(userObj));
    setUser(userObj);
    return data;
  }, []);

  // ── Register foodie ──────────────────────────────────────
  const registerFoodie = useCallback(async (formData) => {
    const data = await authService.registerFoodie(formData);
    const userObj = { userId: data.userId, name: data.name, email: data.email, role: 'FOODIE' };
    localStorage.setItem('mana_token', data.token);
    localStorage.setItem('mana_user',  JSON.stringify(userObj));
    setUser(userObj);
    return data;
  }, []);

  // ── Logout ───────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem('mana_token');
    localStorage.removeItem('mana_refresh_token');
    localStorage.removeItem('mana_user');
    setUser(null);
  }, []);

  const isCook   = user?.role === 'COOK';
  const isFoodie = user?.role === 'FOODIE';

  return (
    <AuthContext.Provider value={{
      user, loading, login, logout,
      registerCook, registerFoodie,
      isCook, isFoodie,
      isLoggedIn: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
