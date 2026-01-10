import { Eye, EyeOff, ChevronDown, ChevronUp } from '@/components/ui/BrandIcons';
import { StyledButton } from '@/components/ui/StyledButton';
import { StyledCard } from '@/components/ui/StyledCard';
import { usePasswordChange } from '@/hooks/usePasswordChange';
import { useI18n } from '@/contexts/I18nContext';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export function PasswordChangeSection({ collapseKey }) {
    const {
        newPassword,
        confirmPassword,
        showPassword,
        changingPassword,
        setNewPassword,
        setConfirmPassword,
        toggleShowPassword,
        handleSubmit,
        canSubmit,
    } = usePasswordChange();
    const { t } = useI18n();

    const [collapsed, setCollapsed] = useLocalStorage(collapseKey || 'dash:collapsed:password_change', true, {
        context: 'PasswordChangeSection',
    });

    return (
        <StyledCard>
            <div className="dash-section-header">
                <h2 className="dash-section-title">{t('password_change_title')}</h2>
                <div className="dash-section-rule" />
                <div className="flex items-center gap-2 relative z-20">
                    <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                        <svg className="w-4 h-4 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
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
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* New Password */}
                    <div>
                        <label className="dash-label">{t('password_new_label')}</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="dash-control pe-12"
                                placeholder={t('password_new_placeholder')}
                                disabled={changingPassword}
                            />
                            <button
                                type="button"
                                onClick={toggleShowPassword}
                                className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40 rounded-md p-1"
                                aria-label={showPassword ? t('password_toggleVisibility_hide') : t('password_toggleVisibility_show')}
                                aria-pressed={showPassword}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="dash-label">{t('password_confirm_label')}</label>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="dash-control"
                            placeholder={t('password_confirm_placeholder')}
                            disabled={changingPassword}
                        />
                    </div>

                {/* Change Button */}
                <StyledButton
                    type="submit"
                    disabled={!canSubmit}
                    className="w-full h-11"
                    variant="cta"
                >
                    {changingPassword ? t('common_changingPassword') : t('password_change_button')}
                </StyledButton>
                </form>
            )}
        </StyledCard>
    );
}
