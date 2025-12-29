/**
 * Authentication Context
 * Manages user authentication state across the application
 */
'use client';

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import authService, { authAPI } from '../services/authService';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isAdmin?: boolean;
}

interface DecodedToken {
  exp: number;
  user: {
    id: string;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize state from localStorage on mount
  useEffect(() => {
    const storedToken = authService.getToken();
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  // Load user data on mount or token change
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Check if token is expired (except for offline tokens)
        if (!token.includes('mocked-signature')) {
          try {
            const decoded = jwtDecode<DecodedToken>(token);
            const currentTime = Date.now() / 1000;

            if (decoded.exp < currentTime) {
              // Token expired, logout user
              authService.logout();
              setToken(null);
              setUser(null);
              setLoading(false);
              return;
            }
          } catch {
            // If decode fails, continue - might be offline token
          }
        }

        // Get user data
        const res = await authAPI.getCurrentUser();
        if (res?.data) {
          setUser(res.data);
        } else {
          // Try to get from localStorage
          const storedUser = authService.getUser();
          if (storedUser) {
            setUser(storedUser);
          }
        }
        setError(null);
      } catch (err) {
        console.error('Auth error:', err);
        // Don't logout for offline mode
        if (!authService.isOfflineMode()) {
          authService.logout();
          setToken(null);
          setUser(null);
        } else {
          // In offline mode, load user from storage
          const storedUser = authService.getUser();
          if (storedUser) {
            setUser(storedUser);
          }
        }
        setError('Authentication failed');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  // Login user
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await authService.login(email, password);
      
      if (res.success && res.user) {
        const newToken = authService.getToken();
        setToken(newToken);
        setUser(res.user);
        return true;
      }
      
      setError(res.message || 'Login failed');
      return false;
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err instanceof Error ? err.message : 'Login failed'
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    authService.logout();
    setToken(null);
    setUser(null);
  };

  // Check if user is authenticated
  const isAuthenticated = !!token && !!user;

  // Check if user is admin
  const isAdmin = isAuthenticated && (user?.role === 'admin' || user?.isAdmin === true);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        isAuthenticated,
        isAdmin,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
