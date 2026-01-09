import { useState } from 'react';
import { sideMenuItems } from '@/constants/navigation';
import { HeaderDesktop, HeaderMobile, LoginDialog } from '@/components/layout/Header';
import { useHeaderShell } from '@/hooks/useHeaderShell';

export default function Header() {
  const {
    isAuthenticated,
    userBalance,
    dashboardPath,
    logout,
    mainNavItems,
  } = useHeaderShell();
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);

  return (
    <>
      {/* Desktop Header */}
      <HeaderDesktop
        navItems={mainNavItems}
        userBalance={userBalance}
        onLoginClick={() => setLoginDialogOpen(true)}
        isAuthenticated={isAuthenticated}
        dashboardPath={dashboardPath}
        onLogout={logout}
      />

      {/* Mobile Header */}
      <HeaderMobile
        sideMenuItems={sideMenuItems}
        onLoginClick={() => setLoginDialogOpen(true)}
        isAuthenticated={isAuthenticated}
        dashboardPath={dashboardPath}
        onLogout={logout}
      />

      {/* Login Dialog (shared) */}
      <LoginDialog
        open={loginDialogOpen}
        onOpenChange={setLoginDialogOpen}
      />
    </>
  );
}
