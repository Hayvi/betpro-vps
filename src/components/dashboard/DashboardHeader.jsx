import { CopyIconButton } from '@/components/CopyIconButton';
import { useI18n } from '@/contexts/I18nContext';

export function DashboardHeader({ title, username, role }) {
  const { t } = useI18n();

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            {title}
          </h1>
          <div className="h-px w-24 bg-gradient-to-r from-amber-500/40 to-transparent mt-2" />
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="dash-meta-pill">
            <span className="opacity-70">{t('dash_usernameLabel')}:</span>
            <span className="capitalize">{username || '...'}</span>
            {username && <CopyIconButton value={username} className="md:hidden" />}
          </div>
          <div className="dash-meta-pill">
            <span className="opacity-70">{t('dash_roleLabel')}:</span>
            <span className="uppercase">{role}</span>
          </div>
        </div>
      </div>
    </div>
  );
}