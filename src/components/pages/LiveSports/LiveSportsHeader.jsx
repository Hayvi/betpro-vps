import { InputWithPaste } from '@/components/ui/InputWithPaste';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { useI18n } from '@/contexts/I18nContext';


export function LiveSportsHeader({ matchCount = 0, searchQuery = '', onSearchChange }) {
  const { isDark } = useTheme();
  const { t } = useI18n();

  return (
    <div
      className={cn(
        "sticky top-0 z-10 backdrop-blur-sm px-4 py-3 transition-all duration-500",
        isDark ? "bg-slate-950/95 border-b border-slate-800" : "bg-white/95 border-b border-slate-200"
      )}
    >
      {/* Live Indicator & Match Count */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center gap-2 text-red-500">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
          <span className="font-bold">{t('liveSports_liveLabel')}</span>
        </div>
        <Badge variant="secondary" className="bg-red-600/20 text-red-400">
          {matchCount} {t('liveSports_matchCountLabel')}
        </Badge>
      </div>

      {/* Search Bar */}
      <InputWithPaste
        placeholder={t('liveSports_searchPlaceholder')}
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        showSearch
        className={cn(
          "rounded-lg shadow-sm",
          isDark
            ? "bg-slate-900 border-slate-700 text-slate-50 placeholder:text-slate-500"
            : "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400"
        )}
      />
    </div>
  );
}
