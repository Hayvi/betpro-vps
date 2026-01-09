import { cn } from '@/lib/utils';

export function DashboardMetricsStrip({ items = [], className }) {
  if (!items?.length) return null;

  return (
    <div className={cn('grid gap-3 sm:grid-cols-2 lg:grid-cols-4', className)}>
      {items.map((item) => (
        <div key={item.key || item.label}>
          {typeof item.onClick === 'function' ? (
            <button
              type="button"
              onClick={item.onClick}
              className={cn(
                'w-full text-left rounded-2xl border p-4 shadow-sm ui-trans-fast',
                'bg-white/70 border-slate-200/70 hover:bg-white',
                'dark:bg-slate-900/30 dark:border-slate-800/60 dark:hover:bg-slate-900/45 dark:shadow-black/30',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40',
                item.active && 'ring-2 ring-violet-500/25 dark:ring-violet-400/20'
              )}
              aria-pressed={item.active ? true : undefined}
            >
              <div className="text-[10px] font-black tracking-[0.24em] uppercase text-slate-500 dark:text-slate-400">
                {item.label}
              </div>
              <div className="mt-1 text-xl font-black tracking-tight tabular-nums text-slate-900 dark:text-white">
                {item.loading ? '...' : item.value}
              </div>
              {item.hint ? (
                <div className="mt-1 text-[10px] font-bold tracking-wide text-slate-500/80 dark:text-slate-400/80">
                  {item.hint}
                </div>
              ) : null}
            </button>
          ) : (
            <div
              className={cn(
                'rounded-2xl border p-4 shadow-sm',
                'bg-white/70 border-slate-200/70',
                'dark:bg-slate-900/30 dark:border-slate-800/60 dark:shadow-black/30'
              )}
            >
              <div className="text-[10px] font-black tracking-[0.24em] uppercase text-slate-500 dark:text-slate-400">
                {item.label}
              </div>
              <div className="mt-1 text-xl font-black tracking-tight tabular-nums text-slate-900 dark:text-white">
                {item.loading ? '...' : item.value}
              </div>
              {item.hint ? (
                <div className="mt-1 text-[10px] font-bold tracking-wide text-slate-500/80 dark:text-slate-400/80">
                  {item.hint}
                </div>
              ) : null}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
