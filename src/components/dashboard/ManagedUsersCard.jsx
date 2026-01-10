import { StyledCard } from '@/components/ui/StyledCard';
import { Pagination } from '@/components/ui/Pagination';
import { useI18n } from '@/contexts/I18nContext';
import { ChevronDown, ChevronUp } from '@/components/ui/BrandIcons';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export function ManagedUsersCard({
  title,
  loading,
  hasUsers,
  filters,
  emptyState,
  mobileRows,
  desktopHead,
  desktopRows,
  showPagination,
  currentPage,
  totalPages,
  onPageChange,
}) {
  const { t } = useI18n();
  const resolvedTitle = title || t('dash_managedUsersTitle');
  const [collapsed, setCollapsed] = useLocalStorage('dash:collapsed:managed_users', true, {
    context: 'ManagedUsersCard',
  });

  return (
    <StyledCard>
      <div className="dash-section-header">
        <h2 className="dash-section-title">{resolvedTitle}</h2>
        <div className="dash-section-rule" />
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20">
            <svg className="w-4 h-4 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
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
      ) : !hasUsers ? (
        emptyState || <p className="text-sm text-slate-500">{t('dash_noUsers')}</p>
      ) : (
        <>
          {filters ? (
            <>
              <div className="hidden md:block">{filters}</div>
              <div className="md:hidden">
                <div className="mb-3">{filters}</div>
                <div className="space-y-3">{mobileRows}</div>
              </div>
            </>
          ) : (
            <div className="md:hidden space-y-3">{mobileRows}</div>
          )}

          <div className="dash-table-shell">
            <table className="min-w-full text-sm">
              <thead className="dash-table-thead">
                {desktopHead}
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
