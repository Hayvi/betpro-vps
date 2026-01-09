import React from 'react';
import { AlertCircle, RefreshCw } from '@/components/ui/BrandIcons';
import { StyledButton } from '@/components/ui/StyledButton';
import { cn } from '@/lib/utils';
import { I18nContext } from '@/contexts/I18nContext';
import { canReload, recordReload, showReloadLimitError } from '@/utils/reloadManager';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log to console in all environments for debugging
    console.error('⚠️ Error caught by boundary:', error);
    console.error('📍 Component stack:', errorInfo.componentStack);
    console.error('📊 Error details:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack,
    });
  }

  handleReset = () => {
    // For chunk loading errors, use coordinated reload protection
    const error = this.state.error;
    if (
      error?.message?.includes('Loading chunk') ||
      error?.message?.includes('Unexpected token') ||
      error?.message?.includes('Failed to fetch dynamically imported module')
    ) {
      // Check if reload is allowed
      if (canReload()) {
        const delay = recordReload();
        console.log(`ErrorBoundary: Chunk error detected, reloading in ${delay}ms...`);
        
        // Clear caches
        if ('caches' in window) {
          window.caches.keys().then((names) => {
            names.forEach((name) => window.caches.delete(name));
          });
        }
        
        // Reload with delay
        setTimeout(() => {
          window.location.reload();
        }, delay);
      } else {
        console.warn('ErrorBoundary: Reload limit reached, showing error page');
        showReloadLimitError();
      }
      return;
    }
    
    // For other errors, try resetting state first
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <I18nContext.Consumer>
          {({ t, isRtl }) => (
            <div
              className={cn(
                'min-h-screen flex items-center justify-center p-4',
                'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950'
              )}
              dir={isRtl ? 'rtl' : 'ltr'}
            >
              <div className="max-w-md w-full bg-slate-900/80 backdrop-blur-xl rounded-2xl p-8 border border-slate-700 text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">{t('error_defaultTitle')}</h1>
                <p className="text-gray-400 mb-6">{t('error_defaultMessage')}</p>
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-left">
                    <p className="text-red-400 text-sm font-mono break-all">
                      {this.state.error.toString()}
                    </p>
                  </div>
                )}
                <StyledButton
                  onClick={this.handleReset}
                  variant="cta"
                  size="md"
                  className="w-full"
                >
                  <RefreshCw className="w-4 h-4 ml-2" />
                  {t('error_retry')}
                </StyledButton>
              </div>
            </div>
          )}
        </I18nContext.Consumer>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

