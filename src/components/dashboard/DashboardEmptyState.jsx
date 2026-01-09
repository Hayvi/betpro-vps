import { cn } from '@/lib/utils';

export function DashboardEmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border p-6 md:p-8 text-center',
        'bg-white/70 border-slate-200/70',
        'dark:bg-slate-900/30 dark:border-slate-800/60',
        className
      )}
    >
      {Icon ? (
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl border border-slate-200 bg-white/70 text-slate-500 dark:border-slate-800/60 dark:bg-slate-950/30 dark:text-slate-300">
          <Icon aria-hidden="true" className="h-5 w-5" />
        </div>
      ) : null}

      {title ? (
        <h3 className="text-sm md:text-base font-black tracking-tight text-slate-900 dark:text-white">
          {title}
        </h3>
      ) : null}

      {description ? (
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {description}
        </p>
      ) : null}

      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}
