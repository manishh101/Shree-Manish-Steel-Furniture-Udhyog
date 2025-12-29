'use client';

import React, { useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import authService from '../services/authService';

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * ProtectedRoute - Authentication wrapper for protected pages
 * 
 * Features:
 * - Checks authentication status
 * - Shows loading spinner while checking
 * - Redirects to login if not authenticated
 * - Clears stale auth data
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuthentication = async () => {
      console.log('=== ProtectedRoute Authentication Check ===');

      // Check if actually authenticated through the service
      const authenticated = authService.isAuthenticated();
      console.log('AuthService authentication result:', authenticated);

      if (!authenticated) {
        console.warn('ProtectedRoute: Not authenticated. Clearing stale data and redirecting.');
        // Clear any stale auth flags
        authService.logout();
        // Redirect to login
        router.replace('/login');
      } else {
        console.log('ProtectedRoute: Authentication successful, allowing access');
        setIsAuthenticated(true);
      }

      setIsChecking(false);
    };

    checkAuthentication();
  }, [router]);

  if (isChecking) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Return null while redirecting
    return null;
  }

  // If authenticated, render the children
  return <>{children}</>;
};

export default ProtectedRoute;
