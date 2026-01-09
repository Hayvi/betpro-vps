import { Award } from '@/components/ui/BrandIcons';
import { useI18n } from '@/contexts/I18nContext';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';

export function TopWinsTable({ wins = [] }) {
  const { t } = useI18n();
  const { isDark } = useTheme();
  
  return (
    <section className="mt-10 px-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 flex items-center justify-center">
          <Award className="w-4 h-4 text-emerald-400" />
        </div>
        <h2 className={cn(
          "text-xl md:text-2xl font-bold",
          isDark ? "text-white" : "text-slate-900"
        )}>
          {t('home_topWinsSectionTitle')}
        </h2>
      </div>
      
      <div className={cn(
        "rounded-xl overflow-hidden border backdrop-blur-xl",
        isDark 
          ? "bg-slate-900/60 border-slate-700/50" 
          : "bg-white/80 border-slate-200"
      )}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={cn(
                "border-b",
                isDark ? "border-slate-700/50 bg-slate-800/50" : "border-slate-200 bg-slate-50"
              )}>
                <th className={cn(
                  "text-left text-xs font-semibold p-4",
                  isDark ? "text-slate-400" : "text-slate-500"
                )}>
                  {t('home_topWins_col_user')}
                </th>
                <th className={cn(
                  "text-left text-xs font-semibold p-4",
                  isDark ? "text-slate-400" : "text-slate-500"
                )}>
                  {t('home_topWins_col_provider')}
                </th>
                <th className={cn(
                  "text-left text-xs font-semibold p-4 hidden md:table-cell",
                  isDark ? "text-slate-400" : "text-slate-500"
                )}>
                  {t('home_topWins_col_date')}
                </th>
                <th className={cn(
                  "text-left text-xs font-semibold p-4 hidden md:table-cell",
                  isDark ? "text-slate-400" : "text-slate-500"
                )}>
                  {t('home_topWins_col_stake')}
                </th>
                <th className={cn(
                  "text-left text-xs font-semibold p-4",
                  isDark ? "text-slate-400" : "text-slate-500"
                )}>
                  {t('home_topWins_col_multiplier')}
                </th>
                <th className={cn(
                  "text-right text-xs font-semibold p-4",
                  isDark ? "text-slate-400" : "text-slate-500"
                )}>
                  {t('home_topWins_col_total')}
                </th>
              </tr>
            </thead>
            <tbody>
              {(wins || []).map((win, idx) => (
                <tr 
                  key={idx} 
                  className={cn(
                    "border-b transition-colors",
                    isDark 
                      ? "border-slate-700/30 hover:bg-slate-800/50" 
                      : "border-slate-100 hover:bg-slate-50"
                  )}
                >
                  <td className={cn(
                    "p-4 text-sm font-medium",
                    isDark ? "text-white" : "text-slate-900"
                  )}>
                    {win.user}
                  </td>
                  <td className="p-4 text-cyan-400 text-sm">{win.provider}</td>
                  <td className={cn(
                    "p-4 text-sm hidden md:table-cell",
                    isDark ? "text-slate-400" : "text-slate-500"
                  )}>
                    {win.date}
                  </td>
                  <td className={cn(
                    "p-4 text-sm hidden md:table-cell",
                    isDark ? "text-slate-400" : "text-slate-500"
                  )}>
                    {win.rate}
                  </td>
                  <td className="p-4">
                    <span className="text-emerald-400 font-bold">{win.multiplier}x</span>
                  </td>
                  <td className="p-4 text-right">
                    <span className="font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 text-transparent bg-clip-text">
                      {win.total}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
