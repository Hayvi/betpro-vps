import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';
import { EmptyState } from './EmptyState';

/**
 * Handles async data states: loading, error, empty, and success.
 * Eliminates repetitive conditional rendering patterns.
 */
export function AsyncContent({
  isLoading,
  hasError,
  data,
  children,
  // Loading props
  loadingType = 'skeleton',
  loadingCount = 3,
  // Error props
  errorMessage,
  onRetry,
  // Empty props
  emptyIcon = 'default',
  emptyTitle,
  emptyDescription,
}) {
  const isEmpty = !data || (Array.isArray(data) && data.length === 0);

  if (isLoading && isEmpty) {
    return (
      <div className="px-4 py-12">
        <LoadingState type={loadingType} count={loadingCount} />
      </div>
    );
  }

  if (hasError && isEmpty) {
    return (
      <div className="px-4 py-12">
        <ErrorState message={errorMessage} onRetry={onRetry} />
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="px-4 py-12">
        <EmptyState 
          icon={emptyIcon} 
          title={emptyTitle} 
          description={emptyDescription} 
        />
      </div>
    );
  }

  return children;
}