import { logger } from './logger';


export const ERROR_TYPES = {
  NETWORK: 'NETWORK_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  AUTHENTICATION: 'AUTH_ERROR',
  AUTHORIZATION: 'AUTHZ_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  SERVER: 'SERVER_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR',
};


const ERROR_MESSAGE_KEYS = {
  [ERROR_TYPES.NETWORK]: 'error_network',
  [ERROR_TYPES.VALIDATION]: 'error_validation',
  [ERROR_TYPES.AUTHENTICATION]: 'error_authentication',
  [ERROR_TYPES.AUTHORIZATION]: 'error_authorization',
  [ERROR_TYPES.NOT_FOUND]: 'error_notFound',
  [ERROR_TYPES.CONFLICT]: 'error_conflict',
  [ERROR_TYPES.SERVER]: 'error_server',
  [ERROR_TYPES.UNKNOWN]: 'error_unknown',
};


export const normalizeError = (error, context = '') => {
  let type = ERROR_TYPES.UNKNOWN;
  let message = 'Unknown error';
  let originalError = error;
  let statusCode = null;

  // Handle string errors as validation issues with the raw string as message
  if (typeof error === 'string') {
    return {
      type: ERROR_TYPES.VALIDATION,
      message: error,
      userMessageKey: ERROR_MESSAGE_KEYS[ERROR_TYPES.VALIDATION],
      statusCode: null,
      context,
      originalError: null,
    };
  }

  // Handle Error objects
  if (error instanceof Error) {
    originalError = error;
    message = error.message || message;

    // Detect error type from message or status
    if (error.message.includes('network') || error.message.includes('fetch')) {
      type = ERROR_TYPES.NETWORK;
    } else if (error.message.includes('401') || error.message.includes('unauthorized')) {
      type = ERROR_TYPES.AUTHENTICATION;
    } else if (error.message.includes('403') || error.message.includes('forbidden')) {
      type = ERROR_TYPES.AUTHORIZATION;
    } else if (error.message.includes('404') || error.message.includes('not found')) {
      type = ERROR_TYPES.NOT_FOUND;
    } else if (error.message.includes('409') || error.message.includes('conflict')) {
      type = ERROR_TYPES.CONFLICT;
    } else if (error.message.includes('500') || error.message.includes('server')) {
      type = ERROR_TYPES.SERVER;
    }
  }

  // Handle Supabase errors
  if (error?.status) {
    statusCode = error.status;
    if (error.status === 401) {
      type = ERROR_TYPES.AUTHENTICATION;
    } else if (error.status === 403) {
      type = ERROR_TYPES.AUTHORIZATION;
    } else if (error.status === 404) {
      type = ERROR_TYPES.NOT_FOUND;
    } else if (error.status === 409) {
      type = ERROR_TYPES.CONFLICT;
    } else if (error.status >= 500) {
      type = ERROR_TYPES.SERVER;
    }
  }

  // Handle object errors
  if (error?.message) {
    originalError = error;
  }

  const userMessageKey = ERROR_MESSAGE_KEYS[type] || ERROR_MESSAGE_KEYS[ERROR_TYPES.UNKNOWN];

  return {
    type,
    message,
    userMessageKey,
    statusCode,
    context,
    originalError,
  };
};


export const handleError = (error, context = '', additionalData = {}) => {
  const normalized = normalizeError(error, context);

  // Log the error with full context
  logger.error(
    `Error in ${context}`,
    normalized.originalError || error,
    {
      errorType: normalized.type,
      statusCode: normalized.statusCode,
      context,
      ...additionalData,
    }
  );

  return normalized;
};


export const handleApiError = (error, endpoint, method = 'GET') => {
  const normalized = normalizeError(error, `API: ${method} ${endpoint}`);

  logger.apiError(method, endpoint, normalized.originalError || error);

  return normalized;
};


export const createError = (message, type = ERROR_TYPES.UNKNOWN, context = {}) => {
  const error = new Error(message);
  error.type = type;
  error.context = context;
  return error;
};


export const retryOperation = async (fn, maxRetries = 3, delayMs = 1000) => {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logger.debug(`Attempt ${attempt}/${maxRetries}`);
      return await fn();
    } catch (error) {
      lastError = error;
      logger.warn(`Attempt ${attempt} failed, retrying...`, { error: error.message });

      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
      }
    }
  }

  throw lastError;
};

export default {
  normalizeError,
  handleError,
  handleApiError,
  createError,
  retryOperation,
  ERROR_TYPES,
};
