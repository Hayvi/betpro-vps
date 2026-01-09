import { useEffect } from 'react';
import { useBet } from '@/contexts/BetContext';
import { useAuth } from '@/contexts/AuthContext';
import { navItems } from '@/constants/navigation';
import { BPWalletIcon } from '@/components/ui/BrandIcons';
import { fetchMyBalance } from '@/services/rbacWalletService';
import { useI18n } from '@/contexts/I18nContext';


export function useHeaderShell() {
  const { userBalance, updateUserBalance } = useBet();
  const { isAuthenticated, role, logout } = useAuth();
  const { t } = useI18n();

  const dashboardPath =
    role === 'super_admin'
      ? '/dashboard/super'
      : role === 'admin'
        ? '/dashboard/admin'
        : role === 'sub_admin'
          ? '/dashboard/sub'
          : '/dashboard/user';

  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;

    const loadBalance = async () => {
      const { balance: b, error } = await fetchMyBalance();
      if (!error && !cancelled) {
        const safeBalance = b || 0;
        updateUserBalance(safeBalance);
      }
    };

    loadBalance();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, updateUserBalance]);

  const mainNavItems = isAuthenticated
    ? [
        ...navItems,
        {
          id: 'wallet',
          name: t('header_wallet'),
          icon: BPWalletIcon,
          path: 'home',
          showBalance: true,
        },
      ]
    : navItems;

  return {
    isAuthenticated,
    userBalance,
    dashboardPath,
    logout,
    mainNavItems,
  };
}
