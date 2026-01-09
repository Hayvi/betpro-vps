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
        {hasUsers && !loading && <div className="dash-section-rule" />}
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          aria-expanded={!collapsed}
          className="dash-collapse-btn"
        >
          {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </button>
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
