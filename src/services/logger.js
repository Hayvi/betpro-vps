const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

const LOG_COLORS = {
  DEBUG: '\x1b[36m', // Cyan
  INFO: '\x1b[32m',  // Green
  WARN: '\x1b[33m',  // Yellow
  ERROR: '\x1b[31m', // Red
  RESET: '\x1b[0m',
};


const getCurrentLogLevel = () => {
  if (import.meta.env.DEV) return LOG_LEVELS.DEBUG;
  if (import.meta.env.PROD) return LOG_LEVELS.WARN;
  return LOG_LEVELS.INFO;
};


const formatLog = (level, message, context = {}) => {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    context,
    url: typeof window !== 'undefined' ? window.location.href : 'server',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
  };
};


const outputLog = (level, logData) => {
  const color = LOG_COLORS[level];
  const reset = LOG_COLORS.RESET;
  const prefix = `${color}[${logData.timestamp}] ${level}${reset}`;

  if (import.meta.env.DEV) {
    console.log(`${prefix} ${logData.message}`, logData.context);
  } else {
    // In production, log to external service (Sentry, LogRocket, etc.)
    if (window.__LOG_SERVICE__) {
      window.__LOG_SERVICE__.log(logData);
    }
  }
};


export const logger = {
  
  debug: (message, context = {}) => {
    if (getCurrentLogLevel() <= LOG_LEVELS.DEBUG) {
      const logData = formatLog('DEBUG', message, context);
      outputLog('DEBUG', logData);
    }
  },

  
  info: (message, context = {}) => {
    if (getCurrentLogLevel() <= LOG_LEVELS.INFO) {
      const logData = formatLog('INFO', message, context);
      outputLog('INFO', logData);
    }
  },

  
  warn: (message, context = {}) => {
    if (getCurrentLogLevel() <= LOG_LEVELS.WARN) {
      const logData = formatLog('WARN', message, context);
      outputLog('WARN', logData);
    }
  },

  
  error: (message, error, additionalContext = {}) => {
    if (getCurrentLogLevel() <= LOG_LEVELS.ERROR) {
      const context = {
        ...additionalContext,
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : error,
      };
      const logData = formatLog('ERROR', message, context);
      outputLog('ERROR', logData);
    }
  },

  
  apiRequest: (method, endpoint, data = {}) => {
    logger.debug(`API Request: ${method} ${endpoint}`, { data });
  },

  
  apiResponse: (method, endpoint, status, data = {}) => {
    logger.debug(`API Response: ${method} ${endpoint} [${status}]`, { data });
  },

  
  apiError: (method, endpoint, error) => {
    logger.error(`API Error: ${method} ${endpoint}`, error, { endpoint, method });
  },

  
  performance: (label, duration) => {
    logger.debug(`Performance: ${label}`, { duration: `${duration}ms` });
  },
};

export default logger;
