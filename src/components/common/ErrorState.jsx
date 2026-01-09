import { AlertCircle } from '@/components/ui/BrandIcons';
import { StyledButton } from '@/components/ui/StyledButton';
import { useI18n } from '@/contexts/I18nContext';

export function ErrorState({ message, onRetry, title }) {
  const { t } = useI18n();

  return (
    <div className="flex flex-col items-center justify-center py-12 md:py-20">
      <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-6">
        <AlertCircle className="w-8 h-8 text-red-400" />
      </div>

      <h3 className="text-lg font-bold text-white mb-3">
        {title || t('error_defaultTitle')}
      </h3>

      <p className="text-sm text-slate-400 text-center mb-6 max-w-sm">
        {message || t('error_defaultMessage')}
      </p>

      {onRetry && (
        <StyledButton onClick={onRetry} variant="primary" size="md">
          {t('error_retry')}
        </StyledButton>
      )}
    </div>
  );
}