/**
 * Enhanced Search Component with Autocomplete
 * Provides real-time search suggestions and improved UX
 */
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { searchAPI } from '../services/api';
import { debounce } from '../utils/debounce';

interface EnhancedSearchProps {
  className?: string;
  placeholder?: string;
  showSuggestions?: boolean;
  onSearchSubmit?: (query: string) => void;
}

const EnhancedSearch: React.FC<EnhancedSearchProps> = ({
  className = '',
  placeholder = 'Search products...',
  showSuggestions = true,
  onSearchSubmit = null
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<string[]>([]);

  // Debounced function to fetch suggestions
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedFetchSuggestions = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery || searchQuery.trim().length < 2) {
        setSuggestions([]);
        setLoading(false);
        return;
      }

      try {
        const response = await searchAPI.getSuggestions(searchQuery, 6);
        const newSuggestions = response.data?.suggestions || [];
        setSuggestions(newSuggestions);
        suggestionsRef.current = newSuggestions;
        setSelectedIndex(-1);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);

    if (showSuggestions && value.trim().length >= 2) {
      setLoading(true);
      setShowDropdown(true);
      debouncedFetchSuggestions(value);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query.trim());
  };

  // Perform search action
  const performSearch = (searchQuery: string) => {
    if (!searchQuery) return;

    setShowDropdown(false);
    setSuggestions([]);

    if (onSearchSubmit) {
      onSearchSubmit(searchQuery);
    } else {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    performSearch(suggestion);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;

      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;

      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          const selectedSuggestion = suggestions[selectedIndex];
          setQuery(selectedSuggestion);
          performSearch(selectedSuggestion);
        } else {
          performSearch(query.trim());
        }
        break;

      case 'Escape':
        setShowDropdown(false);
        setSuggestions([]);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle clicks outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle input focus
  const handleFocus = () => {
    if (suggestions.length > 0 && query.trim().length >= 2) {
      setShowDropdown(true);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="flex items-center">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            className="w-full py-1.5 pl-3 pr-10 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            autoComplete="off"
            spellCheck="false"
          />

          {/* Loading indicator */}
          {loading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            </div>
          )}
        </div>

        <button
          type="submit"
          className="ml-2 bg-primary text-white p-2 rounded-md hover:bg-primary/80 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label="Search"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </form>

      {/* Suggestions dropdown */}
      {showSuggestions && showDropdown && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-64 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 flex items-center ${
                index === selectedIndex ? 'bg-primary/10 text-primary' : 'text-gray-700'
              }`}
              onClick={() => handleSuggestionClick(suggestion)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-3 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="capitalize">{suggestion}</span>
            </button>
          ))}

          {/* Search for current query option */}
          {query.trim() && (
            <button
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors text-primary font-medium border-t border-gray-200 flex items-center"
              onClick={() => performSearch(query.trim())}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Search for &quot;{query.trim()}&quot;
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default EnhancedSearch;
