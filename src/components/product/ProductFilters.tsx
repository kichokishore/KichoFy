import React, { useState } from 'react';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { ProductFilters as ProductFiltersType } from '../../types';
import { PRICE_RANGES, PRODUCT_SIZES, PRODUCT_COLORS, RATING_OPTIONS } from '../../utils/constants';
import { IconButton } from '../UI/Button';

interface ProductFiltersProps {
  filters: ProductFiltersType;
  onFiltersChange: (filters: ProductFiltersType) => void;
  availableCategories: Array<{ id: string; name: string }>;
  className?: string;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  filters,
  onFiltersChange,
  availableCategories,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const updateFilter = (key: keyof ProductFiltersType, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg ${className}`}>
      {/* Mobile Header */}
      <div className="lg:hidden p-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full text-left"
        >
          <div className="flex items-center">
            <Filter className="w-5 h-5 mr-2 text-primary" />
            <span className="font-heading font-semibold text-gray-900 dark:text-white">
              Filters
            </span>
            {hasActiveFilters && (
              <span className="ml-2 bg-primary text-white text-xs px-2 py-1 rounded-full">
                Active
              </span>
            )}
          </div>
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-heading font-semibold text-gray-900 dark:text-white">
          Filters
        </h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-primary hover:text-primary-light text-sm font-sans font-semibold"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Filter Content */}
      <div className={`${isOpen ? 'block' : 'hidden'} lg:block`}>
        <div className="p-6 space-y-6">
          {/* Categories */}
          {availableCategories.length > 0 && (
            <div>
              <h4 className="font-heading font-semibold text-gray-900 dark:text-white mb-3">
                Categories
              </h4>
              <div className="space-y-2">
                {availableCategories.map((category) => (
                  <label key={category.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.categories?.includes(category.id) || false}
                      onChange={(e) => {
                        const current = filters.categories || [];
                        const updated = e.target.checked
                          ? [...current, category.id]
                          : current.filter(id => id !== category.id);
                        updateFilter('categories', updated.length > 0 ? updated : undefined);
                      }}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="ml-2 text-gray-700 dark:text-gray-300 font-sans">
                      {category.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Price Range */}
          <div>
            <h4 className="font-heading font-semibold text-gray-900 dark:text-white mb-3">
              Price Range
            </h4>
            <div className="space-y-2">
              {PRICE_RANGES.map((range) => (
                <label key={range.label} className="flex items-center">
                  <input
                    type="radio"
                    name="price-range"
                    checked={filters.price_range?.min === range.min && filters.price_range?.max === range.max}
                    onChange={() => updateFilter('price_range', range)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="ml-2 text-gray-700 dark:text-gray-300 font-sans">
                    {range.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Sizes */}
          <div>
            <h4 className="font-heading font-semibold text-gray-900 dark:text-white mb-3">
              Sizes
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {PRODUCT_SIZES.map((size) => (
                <label key={size} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.sizes?.includes(size) || false}
                    onChange={(e) => {
                      const current = filters.sizes || [];
                      const updated = e.target.checked
                        ? [...current, size]
                        : current.filter(s => s !== size);
                      updateFilter('sizes', updated.length > 0 ? updated : undefined);
                    }}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="ml-1 text-gray-700 dark:text-gray-300 font-sans text-sm">
                    {size}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div>
            <h4 className="font-heading font-semibold text-gray-900 dark:text-white mb-3">
              Colors
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {PRODUCT_COLORS.map((color) => (
                <label key={color} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.colors?.includes(color) || false}
                    onChange={(e) => {
                      const current = filters.colors || [];
                      const updated = e.target.checked
                        ? [...current, color]
                        : current.filter(c => c !== color);
                      updateFilter('colors', updated.length > 0 ? updated : undefined);
                    }}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="ml-2 text-gray-700 dark:text-gray-300 font-sans text-sm">
                    {color}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Ratings */}
          <div>
            <h4 className="font-heading font-semibold text-gray-900 dark:text-white mb-3">
              Customer Rating
            </h4>
            <div className="space-y-2">
              {RATING_OPTIONS.map((option) => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.ratings?.includes(parseFloat(option.value)) || false}
                    onChange={(e) => {
                      const current = filters.ratings || [];
                      const ratingValue = parseFloat(option.value);
                      const updated = e.target.checked
                        ? [...current, ratingValue]
                        : current.filter(r => r !== ratingValue);
                      updateFilter('ratings', updated.length > 0 ? updated : undefined);
                    }}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="ml-2 text-gray-700 dark:text-gray-300 font-sans">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Additional Filters */}
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.in_stock || false}
                onChange={(e) => updateFilter('in_stock', e.target.checked || undefined)}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="ml-2 text-gray-700 dark:text-gray-300 font-sans">
                In Stock Only
              </span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.on_sale || false}
                onChange={(e) => updateFilter('on_sale', e.target.checked || undefined)}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="ml-2 text-gray-700 dark:text-gray-300 font-sans">
                On Sale
              </span>
            </label>
          </div>
        </div>

        {/* Mobile Actions */}
        <div className="lg:hidden p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-3">
            <button
              onClick={clearFilters}
              className="flex-1 py-2 border-2 border-gray-300 text-gray-700 rounded-full font-semibold hover:bg-gray-50 transition-colors font-sans"
            >
              Clear
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="flex-1 py-2 bg-primary text-white rounded-full font-semibold hover:bg-primary-light transition-colors font-sans"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Quick filter chips for active filters
interface FilterChipsProps {
  filters: ProductFiltersType;
  onFiltersChange: (filters: ProductFiltersType) => void;
  className?: string;
}

export const FilterChips: React.FC<FilterChipsProps> = ({
  filters,
  onFiltersChange,
  className = '',
}) => {
  const removeFilter = (key: keyof ProductFiltersType, value?: any) => {
    const newFilters = { ...filters };
    
    if (value && Array.isArray(newFilters[key])) {
      const array = newFilters[key] as any[];
      const updated = array.filter(item => item !== value);
      newFilters[key] = updated.length > 0 ? updated : undefined;
    } else {
      delete newFilters[key];
    }
    
    onFiltersChange(newFilters);
  };

  const getFilterLabel = (key: string, value: any): string => {
    switch (key) {
      case 'categories':
        return `Category: ${value}`;
      case 'price_range':
        return `Price: ₹${value.min} - ₹${value.max}`;
      case 'sizes':
        return `Size: ${value}`;
      case 'colors':
        return `Color: ${value}`;
      case 'ratings':
        return `Rating: ${value}★ & above`;
      case 'in_stock':
        return 'In Stock';
      case 'on_sale':
        return 'On Sale';
      default:
        return `${key}: ${value}`;
    }
  };

  const activeFilters: Array<{ key: string; value: any; label: string }> = [];

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== false) {
      if (Array.isArray(value)) {
        value.forEach(item => {
          activeFilters.push({
            key,
            value: item,
            label: getFilterLabel(key, item),
          });
        });
      } else if (typeof value === 'object') {
        activeFilters.push({
          key,
          value,
          label: getFilterLabel(key, value),
        });
      } else {
        activeFilters.push({
          key,
          value,
          label: getFilterLabel(key, value),
        });
      }
    }
  });

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {activeFilters.map((filter, index) => (
        <span
          key={`${filter.key}-${filter.value}-${index}`}
          className="inline-flex items-center bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-sans"
        >
          {filter.label}
          <button
            onClick={() => removeFilter(filter.key as keyof ProductFiltersType, filter.value)}
            className="ml-2 hover:text-primary-light transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      
      <button
        onClick={() => onFiltersChange({})}
        className="text-primary hover:text-primary-light text-sm font-sans font-semibold"
      >
        Clear All
      </button>
    </div>
  );
};

export default ProductFilters;