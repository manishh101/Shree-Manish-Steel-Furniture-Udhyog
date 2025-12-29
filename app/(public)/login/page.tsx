'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/services/api';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const router = useRouter();

  useEffect(() => {
    // Clear any existing authentication data first
    const clearExistingAuth = () => {
      const authKeys = [
        'manish_steel_auth_token',
        'manish_steel_user_data',
        'manish_steel_refresh_token',
        'isAuthenticated',
        'isAdminLoggedIn',
        'auth_token',
        'user_data',
        'token'
      ];
      
      authKeys.forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });
    };
    
    clearExistingAuth();
  }, []);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    // Email/Phone validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email or phone number is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^\d{10}$/;
      const isValidEmail = emailRegex.test(formData.email);
      const isValidPhone = phoneRegex.test(formData.email);
      
      if (!isValidEmail && !isValidPhone) {
        newErrors.email = 'Please enter a valid email address or 10-digit phone number';
      }
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear general error when user starts typing
    if (generalError) {
      setGeneralError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setGeneralError('');
    setErrors({});

    try {
      const result = await authAPI.login(formData.email, formData.password);
      
      if (result.token) {
        // Store the token
        localStorage.setItem('token', result.token);
        localStorage.setItem('manish_steel_auth_token', result.token);
        localStorage.setItem('user_data', JSON.stringify(result.user));
        
        // Navigate to admin dashboard
        router.push('/admin/dashboard');
      } else {
        setGeneralError('Login failed. Please check your credentials.');
      }
    } catch (error: unknown) {
      console.error('Login error:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('locked')) {
          setErrors({ 
            email: 'Account temporarily locked due to too many failed attempts',
            password: 'Please try again later'
          });
        } else {
          setGeneralError(error.message || 'Login failed. Please check your internet connection and try again.');
        }
      } else {
        setGeneralError('Login failed. Please check your internet connection and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getInputClassName = (fieldName: keyof typeof errors) => {
    const baseClass = "w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors";
    const errorClass = "border-red-500 focus:ring-red-500";
    const normalClass = "border-gray-300 focus:ring-primary focus:border-primary";
    
    return `${baseClass} ${errors[fieldName] ? errorClass : normalClass}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 px-4">
      <div className="bg-white shadow-2xl rounded-2xl max-w-md w-full p-8 border-t-4 border-accent">
        {/* Header */}
        <div className="text-center mb-8">
          {/* Company Logo */}
          <div className="mx-auto mb-6 flex justify-center">
            <Image 
              src="/images/new-logo-1.png" 
              alt="Shree Manish Steel Furniture Industry" 
              width={80}
              height={80}
              className="h-20 w-auto"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Admin Portal</h1>
          <p className="text-gray-600">Welcome to Manish Steel Admin Panel</p>
        </div>

        {/* General Error */}
        {generalError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
            <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">{generalError}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} noValidate>
          {/* Email/Phone Field */}
          <div className="mb-6">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email or Phone Number
            </label>
            <input
              type="text"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={getInputClassName('email')}
              placeholder="Enter your email or phone number"
              autoComplete="username"
              disabled={isLoading}
            />
            {errors.email && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.email}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={getInputClassName('password')}
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <svg className="w-5 h-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464a11.107 11.107 0 00-2.597 1.414M9.878 9.878l4.242 4.242M15.536 15.536l1.414-1.414a11.107 11.107 0 002.597-1.414M15.536 15.536L15.536 15.536m0 0l-4.242-4.242" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.password}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500 mb-3">
            🔒 Protected by advanced security measures
          </p>
          <Link href="/" className="text-sm text-primary hover:text-primary/80 font-medium mt-2 inline-flex items-center group">
            <svg className="w-4 h-4 mr-1 transform transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m0 7h18" />
            </svg>
            Back to Website
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
