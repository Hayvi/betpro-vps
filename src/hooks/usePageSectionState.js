
export function usePageSectionState({
  isLoading,
  error,
  hasBaseItems,
  hasFilteredItems,
}) {
  const hasError = !!error;
  const showLoading = isLoading && !hasBaseItems;
  const showError = hasError && !hasBaseItems;
  const showEmpty = !isLoading && !hasError && !hasFilteredItems;
  const showContent = hasFilteredItems && !showLoading && !showError;

  return {
    showLoading,
    showError,
    showEmpty,
    showContent,
  };
}
