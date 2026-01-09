import { createContext, useContext, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { TOAST_STYLES, TOAST_DURATION } from '@/constants/ui';
import { logger } from '@/services/logger';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const showSuccess = useCallback((message) => {
    logger.info('Toast: Success', { message });
    toast.success(message, {
      style: TOAST_STYLES.SUCCESS,
      duration: TOAST_DURATION.NORMAL,
    });
  }, []);

  const showError = useCallback((message) => {
    logger.warn('Toast: Error', { message });
    toast.error(message, {
      style: TOAST_STYLES.ERROR,
      duration: TOAST_DURATION.LONG,
    });
  }, []);

  const showWarning = useCallback((message) => {
    logger.warn('Toast: Warning', { message });
    toast.warning(message, {
      style: TOAST_STYLES.WARNING,
      duration: TOAST_DURATION.NORMAL,
    });
  }, []);

  const value = useMemo(
    () => ({ showSuccess, showError, showWarning }),
    [showSuccess, showError, showWarning]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div dir="rtl" />
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastContext;
