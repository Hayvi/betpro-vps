import { cn } from '@/lib/utils';
import { useI18n } from '@/contexts/I18nContext';


export function OddsHeader({ isDark = true }) {
  const { t } = useI18n();

  return (
    <div className="hidden md:block mb-4">
      <div
        className={cn(
          'grid grid-cols-12 gap-3 items-center relative overflow-hidden rounded-xl border px-4 py-3 backdrop-blur-2xl',
          'shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]',
          'ring-1 ring-white/10',
          isDark
            ? 'bg-slate-950/70 border-white/20 text-slate-200'
            : 'bg-white/90 border-slate-200/90 text-slate-700'
        )}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.08] via-white/[0.02] to-black/[0.2] opacity-100"
        />

        <div className="relative col-span-5 text-xs font-bold tracking-wide uppercase">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gradient-to-br from-cyan-400 to-emerald-500"></div>
            <span className={cn(isDark ? 'text-slate-100 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]' : 'text-slate-800')}>
              {t('sports_col_matchHeader')}
            </span>
          </div>
        </div>

        <div className="relative col-span-7 grid grid-cols-3 text-center">
          <div className="flex flex-col items-center gap-1">
            <span className={cn('text-xs font-bold', isDark ? 'text-emerald-300' : 'text-emerald-600')}>1</span>
            <div className="w-6 h-0.5 bg-gradient-to-r from-emerald-500/50 to-transparent rounded-full"></div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className={cn('text-xs font-bold', isDark ? 'text-slate-300' : 'text-slate-600')}>X</span>
            <div className="w-6 h-0.5 bg-gradient-to-r from-slate-500/50 to-transparent rounded-full"></div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className={cn('text-xs font-bold', isDark ? 'text-rose-300' : 'text-rose-600')}>2</span>
            <div className="w-6 h-0.5 bg-gradient-to-r from-rose-500/50 to-transparent rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
