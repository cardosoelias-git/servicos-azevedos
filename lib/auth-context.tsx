"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const loggedIn = localStorage.getItem("conta_logged_in") === "true";
    setIsLoggedIn(loggedIn);
    setMounted(true);
  }, []);

  const login = () => {
    localStorage.setItem("conta_logged_in", "true");
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem("conta_logged_in");
    setIsLoggedIn(false);
  };

  // Prevent hydration mismatch
  if (!mounted) return null;

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
