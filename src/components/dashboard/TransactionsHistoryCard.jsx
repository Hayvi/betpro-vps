import { StyledCard } from '@/components/ui/StyledCard';
import { Pagination } from '@/components/ui/Pagination';
import { useI18n } from '@/contexts/I18nContext';
import { ChevronDown, ChevronUp } from '@/components/ui/BrandIcons';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export function TransactionsHistoryCard({
  title,
  loading,
  hasTransactions,
  emptyState,
  mobileRows,
  desktopRows,
  showPagination,
  currentPage,
  totalPages,
  onPageChange,
}) {
  const { t } = useI18n();
  const resolvedTitle = title || t('dash_transactionsHistoryTitle');
  const [collapsed, setCollapsed] = useLocalStorage('dash:collapsed:transactions_history', true, {
    context: 'TransactionsHistoryCard',
  });

  return (
    <StyledCard>
      <div className="dash-section-header">
        <h2 className="dash-section-title">{resolvedTitle}</h2>
        <div className="dash-section-rule" />
        <div className="flex items-center gap-2 relative z-20">
          <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
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
      {collapsed ? null : loading ? (
        <p className="text-sm text-slate-500">{t('loading_defaultMessage')}</p>
      ) : !hasTransactions ? (
        emptyState || <p className="text-sm text-slate-500">{t('dash_noTransactions')}</p>
      ) : (
        <>
          <div className="md:hidden space-y-3">{mobileRows}</div>

          <div className="dash-table-shell">
            <table className="min-w-full text-sm">
              <thead className="dash-table-thead">
                <tr
                  className="dash-table-head-row"
                >
                  <th className="py-3 px-4 text-right border-r border-slate-800/60 whitespace-nowrap">{t('dash_txCol_type')}</th>
                  <th className="py-3 px-4 text-right border-r border-slate-800/60 whitespace-nowrap">{t('dash_txCol_amount')}</th>
                  <th className="py-3 px-4 text-right border-r border-slate-800/60 whitespace-nowrap">{t('dash_txCol_direction')}</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">{t('dash_txCol_date')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800/40">{desktopRows}</tbody>
            </table>
          </div>

          {showPagination && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />
          )}
        </>
      )}
    </StyledCard>
  );
}
