import { cn } from '@/lib/utils';
import { useI18n } from '@/contexts/I18nContext';

export function LoadingState({ type = 'skeleton', count = 3, message }) {
  const { t } = useI18n();

  if (type === 'spinner') {
    return (
      <div className="flex flex-col items-center justify-center py-12 md:py-20">
        <div className="w-12 h-12 rounded-full border-4 border-slate-700 border-t-emerald-500 animate-spin" />
        <p className="mt-4 text-sm text-slate-400">
          {message || t('loading_defaultMessage')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-3 md:p-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-lg p-4 bg-slate-800 animate-pulse">
          <div className="h-4 rounded bg-slate-700 mb-3 w-4/5" />
          <div className="h-3 rounded bg-slate-700/60 w-3/5" />
        </div>
      ))}
    </div>
  );
}