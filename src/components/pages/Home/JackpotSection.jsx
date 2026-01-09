import { Gem, Trophy, Sparkles } from '@/components/ui/BrandIcons';
import { useI18n } from '@/contexts/I18nContext';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';

export function JackpotSection({ winners = [] }) {
  const { t } = useI18n();
  const { isDark } = useTheme();
  
  return (
    <section className="mt-10 px-4 pb-24">
      <div className={cn(
        "rounded-2xl p-6 border backdrop-blur-xl overflow-hidden relative",
        isDark 
          ? "bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-emerald-950/40 border-slate-700/50" 
          : "bg-gradient-to-br from-white via-slate-50 to-emerald-50 border-slate-200"
      )}>
        {/* Background glow effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
        
        <div className="flex flex-col md:flex-row md:items-center gap-6 relative z-10">
          {/* Jackpot Info */}
          <div className="flex-1">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <p className="text-cyan-400 text-sm font-medium">{t('home_jackpot_label')}</p>
              </div>
              <h3 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-cyan-400 via-emerald-400 to-cyan-400 text-transparent bg-clip-text">
                DIAMOND
              </h3>
              <div className={cn(
                "mt-4 rounded-xl py-3 px-6 inline-block border",
                isDark 
                  ? "bg-slate-800/60 border-slate-700/50" 
                  : "bg-white border-slate-200"
              )}>
                <span className="text-3xl md:text-4xl font-black bg-gradient-to-r from-cyan-400 to-emerald-400 text-transparent bg-clip-text">
                  XXXXX.XX
                </span>
              </div>
              <p className={cn(
                "mt-3 text-sm",
                isDark ? "text-slate-400" : "text-slate-500"
              )}>
                {t('home_jackpot_tryLuck')}
              </p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">80,000.00 TND</p>
            </div>
          </div>

          {/* Recent Winners */}
          <div className="flex-1">
            <h4 className={cn(
              "font-bold mb-3 flex items-center gap-2",
              isDark ? "text-white" : "text-slate-900"
            )}>
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 flex items-center justify-center">
                <Gem className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              {t('home_jackpot_recentWinnersTitle')}
            </h4>
            <div className="space-y-2">
              {(winners || []).slice(0, 5).map((winner, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "flex items-center justify-between rounded-xl p-3 border transition-colors",
                    isDark 
                      ? "bg-slate-800/40 border-slate-700/40 hover:bg-slate-800/60" 
                      : "bg-white/60 border-slate-200 hover:bg-white"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                      <Trophy className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className={cn(
                        "text-sm font-medium",
                        isDark ? "text-white" : "text-slate-900"
                      )}>
                        {winner.user}
                      </p>
                      <p className={cn(
                        "text-xs",
                        isDark ? "text-slate-500" : "text-slate-400"
                      )}>
                        {winner.type}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-400 font-bold text-sm">{winner.amount}</p>
                    <p className={cn(
                      "text-xs",
                      isDark ? "text-slate-500" : "text-slate-400"
                    )}>
                      {winner.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
