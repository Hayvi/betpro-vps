const pendingRequests = new Map();

export const deduplicatedFetch = async (key, fetchFn) => {
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key);
  }
  
  const promise = fetchFn()
    .finally(() => {
      pendingRequests.delete(key);
    });
  
  pendingRequests.set(key, promise);
  return promise;
};

export const clearPendingRequests = () => {
  pendingRequests.clear();
};

export const getPendingRequestCount = () => {
  return pendingRequests.size;
};

export default deduplicatedFetch;
