import { useEffect } from 'react';

export function useDashboardShortcuts({ enabled = true, onFocusSearch, onClear }) {
  useEffect(() => {
    if (!enabled) return;

    const handler = (e) => {
      if (e.defaultPrevented) return;

      const target = e.target;
      const tag = target?.tagName;
      const isEditable =
        target?.isContentEditable ||
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT';

      const isDashboardSearch =
        tag === 'INPUT' && target?.dataset?.dashboardSearch === 'true';

      if (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        if (isEditable) return;
        e.preventDefault();
        onFocusSearch?.();
        return;
      }

      if (e.key === 'Escape') {
        if (isEditable && !isDashboardSearch) return;
        onClear?.();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [enabled, onClear, onFocusSearch]);
}
