import { useState, useEffect, useMemo } from 'react';

// Debounced search to prevent excessive filtering
export function useDebouncedSearch(items, searchTerm, searchFields, delay = 300) {
  const [debouncedTerm, setDebouncedTerm] = useState(searchTerm);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, delay);

    return () => clearTimeout(timer);
  }, [searchTerm, delay]);

  const filteredItems = useMemo(() => {
    if (!debouncedTerm.trim()) return items;

    const term = debouncedTerm.toLowerCase();
    return items.filter(item => 
      searchFields.some(field => {
        const value = field.split('.').reduce((obj, key) => obj?.[key], item);
        return String(value || '').toLowerCase().includes(term);
      })
    );
  }, [items, debouncedTerm, searchFields]);

  return {
    filteredItems,
    isSearching: searchTerm !== debouncedTerm
  };
}

// Memoized filter function for role-based filtering
export function useRoleFilter(items, roleFilter) {
  return useMemo(() => {
    if (roleFilter === 'all') return items;
    return items.filter(item => item.role === roleFilter);
  }, [items, roleFilter]);
}
