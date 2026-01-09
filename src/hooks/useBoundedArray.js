/**
 * Bounded Array Hook - Prevents Memory Leaks from Unbounded Growth
 * Used for transaction lists, user lists, and other growing arrays
 */

import { useState, useCallback } from 'react';

export function useBoundedArray(maxSize = 50, deduplicateBy = 'id') {
  const [items, setItems] = useState([]);

  const addItem = useCallback((newItem) => {
    setItems(prev => {
      // Deduplicate - prevent adding existing items
      if (deduplicateBy && prev.find(p => p[deduplicateBy] === newItem[deduplicateBy])) {
        return prev;
      }

      // Add new item and enforce size limit
      const updated = [newItem, ...prev];
      return updated.slice(0, maxSize);
    });
  }, [maxSize, deduplicateBy]);

  const addItems = useCallback((newItems) => {
    setItems(prev => {
      let updated = [...prev];
      
      // Add each new item with deduplication
      newItems.forEach(newItem => {
        if (!deduplicateBy || !updated.find(p => p[deduplicateBy] === newItem[deduplicateBy])) {
          updated.unshift(newItem);
        }
      });

      // Enforce size limit
      return updated.slice(0, maxSize);
    });
  }, [maxSize, deduplicateBy]);

  const updateItem = useCallback((updatedItem) => {
    setItems(prev => {
      const index = prev.findIndex(p => p[deduplicateBy] === updatedItem[deduplicateBy]);
      if (index === -1) return prev;

      const updated = [...prev];
      updated[index] = updatedItem;
      return updated;
    });
  }, [deduplicateBy]);

  const removeItem = useCallback((itemId) => {
    setItems(prev => prev.filter(p => p[deduplicateBy] !== itemId));
  }, [deduplicateBy]);

  const clear = useCallback(() => {
    setItems([]);
  }, []);

  // Get array statistics for monitoring
  const getStats = useCallback(() => {
    return {
      size: items.length,
      maxSize,
      utilizationPercent: Math.round((items.length / maxSize) * 100),
      isFull: items.length >= maxSize
    };
  }, [items.length, maxSize]);

  return {
    items,
    addItem,
    addItems,
    updateItem,
    removeItem,
    clear,
    setItems,
    getStats
  };
}

export default useBoundedArray;