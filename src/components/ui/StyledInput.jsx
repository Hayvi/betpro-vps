import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const StyledInput = forwardRef(({ className, error, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "w-full px-4 py-2 rounded-lg border-2 transition-colors duration-200",
        "bg-white dark:bg-slate-800",
        "border-slate-200 dark:border-slate-700",
        "text-slate-900 dark:text-white",
        "placeholder:text-slate-400 dark:placeholder:text-slate-500",
        "focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20",
        error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
        className
      )}
      {...props}
    />
  );
});

StyledInput.displayName = 'StyledInput';

export { StyledInput };
export default StyledInput;