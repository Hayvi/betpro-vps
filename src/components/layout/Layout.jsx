  import { cn } from '@/lib/utils';
import { useLayoutShell } from '@/hooks/useLayoutShell';
import { useI18n } from '@/contexts/I18nContext';
import AppHeader from './AppHeader';
import Sidebar from './Sidebar';
import BetSlip from '../BetSlip';
import BottomNav from './BottomNav';
import MainContent from './MainContent';

export default function Layout({ children }) {
  const { isDark, betSheetOpen, setBetSheetOpen } = useLayoutShell();
  const { isRtl } = useI18n();

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-300",
      isDark ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900"
    )} dir={isRtl ? "rtl" : "ltr"}>
      <AppHeader />
      
      <Sidebar />
      
      <BetSlip />
      
      <MainContent isDark={isDark}>
        {children}
      </MainContent>
      
      <BottomNav 
        betSheetOpen={betSheetOpen} 
        setBetSheetOpen={setBetSheetOpen} 
      />
    </div>
  );
}