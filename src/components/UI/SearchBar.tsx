import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Clock, TrendingUp } from 'lucide-react';
import { Product } from '../../types';
import { productsService } from '../../services/databaseService';
import { useDebounce } from '../../hooks/useDebounce';
import { LoadingSpinner } from './LoadingSpinner';

interface SearchBarProps {
  onSearch?: (query: string) => void;
  onProductSelect?: (product: Product) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  showSuggestions?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  onProductSelect,
  placeholder = 'Search for products...',
  className = '',
  autoFocus = false,
  showSuggestions = true,
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(query, 300);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('kichofy_recent_searches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Save recent search
  const saveRecentSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) return;

    const updated = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('kichofy_recent_searches', JSON.stringify(updated));
  };

  // Search products when query changes
  useEffect(() => {
    const searchProducts = async () => {
      if (!debouncedQuery.trim()) {
        setSuggestions([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Use the productsService from your databaseService
        const products = await productsService.searchProducts(debouncedQuery, 20);
        setSuggestions(products || []);
      } catch (error) {
        console.error('Search error:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (showSuggestions) {
      searchProducts();
    }
  }, [debouncedQuery, showSuggestions]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setShowDropdown(true);
    setHasSearched(false);

    if (onSearch && value.trim()) {
      onSearch(value);
    }
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setShowDropdown(false);
    setHasSearched(false);
    inputRef.current?.focus();
    
    if (onSearch) {
      onSearch('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      saveRecentSearch(query.trim());
      setHasSearched(true);
      setShowDropdown(false);
      
      if (onSearch) {
        onSearch(query.trim());
      }
    }
  };

  const handleSuggestionClick = (product: Product) => {
    setQuery(product.name);
    setShowDropdown(false);
    setHasSearched(true);
    
    if (onProductSelect) {
      onProductSelect(product);
    }
    
    saveRecentSearch(product.name);
  };

  const handleRecentSearchClick = (searchTerm: string) => {
    setQuery(searchTerm);
    setShowDropdown(false);
    setHasSearched(true);
    
    if (onSearch) {
      onSearch(searchTerm);
    }
  };

  const removeRecentSearch = (searchTerm: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = recentSearches.filter(s => s !== searchTerm);
    setRecentSearches(updated);
    localStorage.setItem('kichofy_recent_searches', JSON.stringify(updated));
  };

  const showRecentSearches = showDropdown && !query.trim() && recentSearches.length > 0;
  const showProductSuggestions = showDropdown && query.trim() && (suggestions.length > 0 || isLoading);
  const showNoResults = showDropdown && query.trim() && !isLoading && suggestions.length === 0 && hasSearched;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => setShowDropdown(true)}
            placeholder={placeholder}
            autoFocus={autoFocus}
            className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-sans"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </form>

      {/* Dropdown */}
      {showDropdown && (showRecentSearches || showProductSuggestions || showNoResults) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl z-50 max-h-96 overflow-y-auto animate-fadeIn">
          
          {/* Recent Searches */}
          {showRecentSearches && (
            <div className="p-4">
              <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm font-semibold mb-3 font-sans">
                <Clock className="w-4 h-4 mr-2" />
                Recent Searches
              </div>
              <div className="space-y-2">
                {recentSearches.map((searchTerm, index) => (
                  <button
                    key={index}
                    onClick={() => handleRecentSearchClick(searchTerm)}
                    className="flex items-center justify-between w-full p-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors font-sans"
                  >
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-3 text-gray-400" />
                      {searchTerm}
                    </span>
                    <button
                      onClick={(e) => removeRecentSearch(searchTerm, e)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Product Suggestions */}
          {showProductSuggestions && (
            <div className="p-4">
              <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm font-semibold mb-3 font-sans">
                <TrendingUp className="w-4 h-4 mr-2" />
                Products
              </div>
              {isLoading ? (
                <div className="flex justify-center py-4">
                  <LoadingSpinner size="sm" color="primary" />
                </div>
              ) : (
                <div className="space-y-2">
                  {suggestions.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => handleSuggestionClick(product)}
                      className="flex items-center w-full p-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors font-sans"
                    >
                      <img
                        src={product.image_url || '/placeholder-image.jpg'}
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded-lg mr-3"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{product.name}</p>
                        <p className="text-sm text-primary font-bold">
                          ₹{product.price.toLocaleString()}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* No Results */}
          {showNoResults && (
            <div className="p-6 text-center">
              <div className="text-gray-400 mb-2">
                <Search className="w-8 h-8 mx-auto" />
              </div>
              <p className="text-gray-600 dark:text-gray-400 font-sans">
                No products found for "{query}"
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1 font-sans">
                Try different keywords or browse categories
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Compact Search Bar variant
interface CompactSearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export const CompactSearchBar: React.FC<CompactSearchBarProps> = ({
  onSearch,
  placeholder = 'Search...',
  className = '',
}) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-sans"
        />
      </div>
    </form>
  );
};

export default SearchBar;