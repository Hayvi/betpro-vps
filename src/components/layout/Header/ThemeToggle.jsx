import { Sun, Moon } from '@/components/ui/BrandIcons';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';


export function ThemeToggle({ onToggle }) {
  const { isDark, toggleTheme } = useTheme();
  const handleToggle = onToggle || toggleTheme;

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        'relative flex items-center justify-center w-10 h-10 rounded-xl ui-trans-fast',
        'hover:scale-105 active:scale-95',
        'overflow-hidden group',
        isDark
          ? 'bg-slate-800/80 border border-slate-700/60'
          : 'bg-slate-100 border border-slate-200'
      )}
    >
      {/* Glow effect */}
      <div className={cn(
        'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300',
        isDark
          ? 'bg-gradient-to-br from-cyan-500/20 to-emerald-500/20'
          : 'bg-gradient-to-br from-amber-500/20 to-orange-500/20'
      )} />
      
      {/* Icon container with rotation animation */}
      <div className={cn(
        'relative z-10 transition-transform duration-500',
        isDark ? 'rotate-0' : 'rotate-180'
      )}>
        {isDark ? (
          <Sun className={cn(
            'w-5 h-5 ui-trans-fast',
            'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]'
          )} />
        ) : (
          <Moon className={cn(
            'w-5 h-5 ui-trans-fast rotate-180',
            'text-slate-600'
          )} />
        )}
      </div>

      {/* Subtle ring on hover */}
      <div className={cn(
        'absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300',
        isDark
          ? 'ring-1 ring-cyan-400/30'
          : 'ring-1 ring-amber-400/30'
      )} />
    </button>
  );
}
