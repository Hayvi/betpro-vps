import { Trophy, Gem, Gamepad2, Award, Radio, Search, Sparkles } from '@/components/ui/BrandIcons';
import { useI18n } from '@/contexts/I18nContext';
import { cn } from '@/lib/utils';

const icons = {
  sports: Trophy,
  casino: Gem,
  games: Gamepad2,
  wins: Award,
  live: Radio,
  default: Search,
};

export function EmptyState({ icon = 'default', title, description, action, className }) {
  const { t } = useI18n();
  const Icon = icons[icon] || icons.default;

  return (
    <div className={cn("flex flex-col items-center justify-center py-12 md:py-24 px-4 relative overflow-hidden", className)}>
      {/* Decorative background flourishes */}
      <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-cyan-500/10 blur-[100px] rounded-full" />
      </div>

      <div className="relative mb-8 group">
        {/* Dynamic Halo Layer */}
        <div className="absolute -inset-4 bg-gradient-to-tr from-cyan-500/20 via-emerald-500/10 to-transparent blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

        {/* Multi-layered Icon Container */}
        <div className="relative w-24 h-24 md:w-28 md:h-28 flex items-center justify-center">
          {/* Back plate with custom pattern */}
          <div className="absolute inset-0 rounded-[2rem] bg-slate-900 border border-slate-800 rotate-6 group-hover:rotate-12 transition-transform duration-500" />
          <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 shadow-2xl transition-transform duration-500">
            <div className="absolute inset-0 opacity-[0.05]" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '12px 12px'
            }} />
          </div>

          {/* Main Icon with Glow */}
          <div className="relative z-10 p-5 rounded-2xl bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
            <Icon className="w-10 h-10 md:w-12 md:h-12 text-cyan-400/80 group-hover:text-cyan-400 transition-colors drop-shadow-[0_0_12px_rgba(34,211,238,0.4)]" />
            <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </div>

      <div className="relative z-10 text-center space-y-3">
        <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">
          {title || t('empty_defaultTitle')}
        </h3>

        <div className="flex flex-col items-center gap-4">
          <p className="text-sm md:text-base text-slate-400 text-center max-w-[280px] leading-relaxed">
            {description || t('empty_defaultDescription')}
          </p>

          {action}

          {/* Illustrative separator line */}
          <div className="w-12 h-1 rounded-full bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
        </div>
      </div>
    </div>
  );
}