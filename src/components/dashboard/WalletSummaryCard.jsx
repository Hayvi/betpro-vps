import { StyledCard } from '@/components/ui/StyledCard';
import { useI18n } from '@/contexts/I18nContext';
import { ChevronDown, ChevronUp } from '@/components/ui/BrandIcons';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export function WalletSummaryCard({ title, loading, balance, children, collapseKey }) {
  const { t } = useI18n();
  const [collapsed, setCollapsed] = useLocalStorage(collapseKey || 'dash:collapsed:wallet_summary', true, {
    context: 'WalletSummaryCard',
  });

  return (
    <StyledCard>
      <div className="dash-section-header">
        <div className="flex items-center min-w-0 flex-1">
          <h2 className="dash-section-title truncate">{title}</h2>
          <div className="dash-section-rule" />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 shrink-0">
            <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            aria-expanded={!collapsed}
            className="dash-collapse-btn"
          >
            {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </button>
        </div>
      </div>
      {collapsed ? null : (
        <>
          <p className="text-[10px] font-black tracking-widest text-slate-500 dark:text-slate-400 mb-1">
            {t('wallet_currentBalanceLabel')}
          </p>
          <div className="flex items-baseline gap-2 mb-4">
            <p className="text-4xl font-black tracking-tighter tabular-nums text-slate-900 dark:text-white drop-shadow-sm">
              {loading ? '...' : Number(balance || 0).toFixed(2)}
            </p>
            <span className="text-xs font-black text-amber-500/80">TND</span>
          </div>
          {children}
        </>
      )}
    </StyledCard>
  );
}