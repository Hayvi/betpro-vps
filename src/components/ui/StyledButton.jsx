import { forwardRef } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';

const StyledButton = forwardRef(({
  className,
  variant = 'primary',
  size = 'md',
  asChild = false,
  disabled,
  children,
  ...props
}, ref) => {
  const { isDark } = useTheme();
  const Comp = asChild ? Slot : 'button';

  const mergedOnClick = asChild && disabled
    ? (e) => {
        e.preventDefault();
      }
    : props.onClick;

  return (
    <Comp
      ref={ref}
      {...props}
      disabled={!asChild ? disabled : undefined}
      aria-disabled={asChild && disabled ? true : undefined}
      tabIndex={asChild && disabled ? -1 : props.tabIndex}
      className={cn(
        // Base
        "inline-flex items-center justify-center gap-2 font-black tracking-tight rounded-xl ui-trans-fast",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed active:scale-95",

        // Variants
        variant === 'primary' && (
          isDark
            ? "bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 text-white font-black shadow-[0_4px_15px_rgba(245,158,11,0.4)] hover:shadow-[0_0_25px_rgba(245,158,11,0.6)] border border-amber-300/20"
            : "bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 text-white font-black shadow-[0_4px_15px_rgba(245,158,11,0.3)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] border border-amber-300/20"
        ),
        variant === 'cta' && "bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 text-white font-black shadow-[0_4px_15px_rgba(245,158,11,0.4)] hover:shadow-[0_0_25px_rgba(245,158,11,0.6)] border border-amber-300/20",
        variant === 'secondary' && (
          isDark
            ? "bg-slate-800/80 text-slate-100 hover:bg-slate-700 border border-slate-700/50"
            : "bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200"
        ),
        variant === 'outline' && "border-2 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800",
        variant === 'ghost' && "hover:bg-slate-100 dark:hover:bg-white/5",
        variant === 'danger' && "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white",

        // Sizes
        size === 'sm' && "h-8 px-3 text-sm",
        size === 'md' && "h-10 px-4 text-sm",
        size === 'lg' && "h-12 px-6 text-base",

        className
      )}
      onClick={mergedOnClick}
    >
      {children}
    </Comp>
  );
});

StyledButton.displayName = 'StyledButton';

export { StyledButton };
export default StyledButton;