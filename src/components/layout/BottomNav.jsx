import { useState, useRef, useEffect, useMemo, useCallback, memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils/index';
import { Ticket } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContentWithoutClose as SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { useBet } from '@/contexts/BetContext';
import { useI18n } from '@/contexts/I18nContext';
import { navItems } from '@/constants/navigation';
import { History } from 'lucide-react';
import BetSlipContent from '../BetSlipContent';

// PERFORMANCE FIX #15: Memoize component to prevent unnecessary re-renders
function BottomNav({ betSheetOpen, setBetSheetOpen }) {
  const { bets, betSlipPulse } = useBet();
  const { isDark } = useTheme();
  const { t } = useI18n();
  const location = useLocation();
  const [sportsMenuOpen, setSportsMenuOpen] = useState(false);
  const [isBetSlipPulsing, setIsBetSlipPulsing] = useState(false);
  const betSlipPulseTimeoutRef = useRef(null);
  const sportsButtonRef = useRef(null);
  const sportsDropdownRef = useRef(null);
  const [sportsDropdownLeft, setSportsDropdownLeft] = useState(null);

  const [isDraggingBetSheet, setIsDraggingBetSheet] = useState(false);
  const [dragStartY, setDragStartY] = useState(null);
  const [dragOffsetY, setDragOffsetY] = useState(0);

  // Close dropdowns on route change
  useEffect(() => {
    setSportsMenuOpen(false);
    setSportsDropdownLeft(null);
  }, [location.pathname]);

  useEffect(() => {
    if (betSlipPulse === 0) return;

    setIsBetSlipPulsing(true);
    if (betSlipPulseTimeoutRef.current) {
      clearTimeout(betSlipPulseTimeoutRef.current);
    }
    betSlipPulseTimeoutRef.current = setTimeout(() => {
      setIsBetSlipPulsing(false);
      betSlipPulseTimeoutRef.current = null;
    }, 450);

    return () => {
      if (betSlipPulseTimeoutRef.current) {
        clearTimeout(betSlipPulseTimeoutRef.current);
        betSlipPulseTimeoutRef.current = null;
      }
    };
  }, [betSlipPulse]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sportsMenuOpen &&
        sportsDropdownRef.current &&
        !sportsDropdownRef.current.contains(event.target) &&
        sportsButtonRef.current &&
        !sportsButtonRef.current.contains(event.target)
      ) {
        setSportsMenuOpen(false);
      }
    };

    document.addEventListener('pointerdown', handleClickOutside);
    return () => {
      document.removeEventListener('pointerdown', handleClickOutside);
    };
  }, [sportsMenuOpen]);

  useEffect(() => {
    if (!sportsMenuOpen) return;

    const updatePosition = () => {
      if (!sportsButtonRef.current || !sportsDropdownRef.current) return;

      const buttonRect = sportsButtonRef.current.getBoundingClientRect();
      const dropdownRect = sportsDropdownRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
      const margin = 12;

      let left = buttonRect.left + buttonRect.width / 2 - dropdownRect.width / 2;

      if (left < margin) left = margin;
      if (left + dropdownRect.width > viewportWidth - margin) {
        left = viewportWidth - margin - dropdownRect.width;
      }

      setSportsDropdownLeft(left);
    };

    const rafId = window.requestAnimationFrame(updatePosition);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', updatePosition);
    };
  }, [sportsMenuOpen]);

  // PERFORMANCE FIX #15: Memoize expensive computations to prevent unnecessary re-renders
  const getCurrentPage = useCallback(() => {
    const path = location.pathname.replace('/', '');
    return path || 'home';
  }, [location.pathname]);

  const historyItem = useMemo(() => ({
    id: 'history',
    icon: History,
    path: '', // Non-functional placeholder
    name: 'History'
  }), []);

  const navItemsMobile = useMemo(() => [
    historyItem,
    ...navItems.filter(item => item.id !== 'home' && item.id !== 'live')
  ], [historyItem]);

  const sportsSubItems = useMemo(() => 
    navItems.filter((item) => item.id === 'sports' || item.id === 'live'),
    []
  );

  const items = navItemsMobile;

  const getItemClasses = useCallback((isActive) => cn(
    "flex flex-col items-center gap-1 p-2 rounded-xl transform ui-trans-fast active:scale-95 active:-translate-y-0.5",
    isActive
      ? isDark
        ? 'text-cyan-200 scale-110 bg-cyan-500/15 border border-cyan-400/40 shadow-[0_0_22px_rgba(34,211,238,0.75)] hover:-translate-y-0.5'
        : 'text-cyan-600 scale-110 bg-cyan-500/10 border border-cyan-400/40 shadow-[0_0_18px_rgba(34,211,238,0.6)] hover:-translate-y-0.5'
      : cn(isDark ? 'text-gray-300' : 'text-slate-600', "hover:scale-105 hover:-translate-y-0.5")
  ), [isDark]);

  const handleBetSheetPointerDown = useCallback((event) => {
    if (!betSheetOpen) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    const contentElement = event.currentTarget;
    const rect = contentElement.getBoundingClientRect();
    const distanceFromTop = event.clientY - rect.top;

    if (distanceFromTop > 80) return;

    setIsDraggingBetSheet(true);
    setDragStartY(event.clientY);
    setDragOffsetY(0);

    if (contentElement.setPointerCapture) {
      try {
        contentElement.setPointerCapture(event.pointerId);
      } catch {
        // ignore
      }
    }
  }, [betSheetOpen, dragStartY]);

  const handleBetSheetPointerMove = useCallback((event) => {
    if (!isDraggingBetSheet || dragStartY === null) return;

    const deltaY = event.clientY - dragStartY;
    if (deltaY <= 0) {
      setDragOffsetY(0);
    } else {
      setDragOffsetY(deltaY);
    }
  }, [isDraggingBetSheet, dragStartY]);

  const finishBetSheetDrag = useCallback(() => {
    if (!isDraggingBetSheet) return;

    const threshold = 80;
    if (dragOffsetY > threshold) {
      setBetSheetOpen(false);
    }

    setIsDraggingBetSheet(false);
    setDragStartY(null);
    setDragOffsetY(0);
  }, [isDraggingBetSheet, dragOffsetY, setBetSheetOpen]);

  const handleBetSheetPointerEnd = useCallback(() => {
    finishBetSheetDrag();
  }, [finishBetSheetDrag]);

  const getLabelForItem = useCallback((item) => {
    switch (item.id) {
      case 'home':
      case 'history':
        return t('nav_history') || 'Historique'; // Fallback if translation missing
      case 'sports':
        return t('nav_prematch');
      case 'live':
        return t('nav_live');
      case 'casino':
        return t('nav_casino');
      default:
        return item.name;
    }
  }, [t]);

  const renderNavItem = useCallback((item) => {
    const isActive = getCurrentPage() === item.path;
    const isSports = item.id === 'sports';
    const isHistory = item.id === 'history';

    if (isSports) {
      return (
        <button
          key={item.id}
          ref={sportsButtonRef}
          type="button"
          onClick={() => {
            setSportsMenuOpen((open) => !open);
          }}
          className={getItemClasses(isActive)}
        >
          <div className="relative">
            <item.icon
              className={cn(
                "w-5 h-5 transition-shadow",
                isActive && "drop-shadow-[0_0_12px_rgba(34,211,238,0.9)]"
              )}
            />
            {item.badge && (
              <span className={cn(
                "absolute -top-1 -left-1 w-2 h-2 rounded-full live-pulse border",
                isDark ? "bg-red-500 border-white" : "bg-red-500 border-slate-200"
              )} />
            )}
          </div>
          <span className="text-[10px] font-semibold">{t(`nav_${item.id}`)}</span>
        </button>
      );
    }

    if (isHistory) {
      return (
        <button
          key={item.id}
          type="button"
          className={getItemClasses(false)} // Never active
        >
          <div className="relative">
            <item.icon
              className="w-5 h-5 transition-shadow"
            />
          </div>
          <span className="text-[10px] font-semibold">{t(`nav_${item.id}`)}</span>
        </button>
      );
    }

    return (
      <Link
        key={item.id}
        to={createPageUrl(item.path)}
        onClick={() => {
          setSportsMenuOpen(false);
        }}
        className={getItemClasses(isActive)}
      >
        <div className="relative">
          <item.icon
            className={cn(
              "w-5 h-5 transition-shadow",
              isActive && "drop-shadow-[0_0_12px_rgba(34,211,238,0.9)]"
            )}
          />
          {item.badge && (
            <span className={cn(
              "absolute -top-1 -left-1 w-2 h-2 rounded-full live-pulse border",
              isDark ? "bg-red-500 border-white" : "bg-red-500 border-slate-200"
            )} />
          )}
        </div>
        <span className="text-[10px] font-semibold">{t(`nav_${item.id}`)}</span>
      </Link>
    );
  }, [getCurrentPage, getItemClasses, setSportsMenuOpen, t, isDark]);

  const betSlipButton = useMemo(() => (
    <Sheet key="betslip" open={betSheetOpen} onOpenChange={setBetSheetOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="View bet slip"
          className={cn(
            "flex flex-col items-center gap-1 p-2 rounded-xl h-auto relative transform ui-trans-fast hover:scale-105 active:scale-95 normal-case",
            isDark
              ? "text-cyan-300 bg-cyan-500/10 border border-cyan-400/30 shadow-[0_0_15px_rgba(34,211,238,0.2)]"
              : "text-cyan-600 bg-cyan-500/5 border border-cyan-400/20 shadow-[0_0_15px_rgba(34,211,238,0.12)]",
            isBetSlipPulsing && "scale-110 shadow-[0_0_25px_rgba(34,211,238,0.35)]"
          )}
        >
          <div className="relative">
            <Ticket className="w-5 h-5" />
            {bets.length > 0 && (
              <span className={cn(
                "absolute -top-2 -right-2 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center",
                "bg-red-500 text-white"
              )}>
                {bets.length}
              </span>
            )}
          </div>
          <span className="text-[10px] font-semibold">{t('nav_coupon') || 'Coupon'}</span>
        </Button>
      </SheetTrigger>

      <SheetContent
        side="bottom"
        className={cn(
          "p-0 rounded-t-3xl border-t",
          isDark ? "bg-slate-900/95 border-slate-800/80" : "bg-white/95 border-slate-200"
        )}
        style={{
          transform: dragOffsetY ? `translateY(${dragOffsetY}px)` : undefined,
          transition: isDraggingBetSheet ? 'none' : undefined,
        }}
        onPointerDown={handleBetSheetPointerDown}
        onPointerMove={handleBetSheetPointerMove}
        onPointerUp={handleBetSheetPointerEnd}
        onPointerCancel={handleBetSheetPointerEnd}
      >
        <div className="h-[85vh] overflow-hidden">
          <BetSlipContent onRequestClose={() => setBetSheetOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  ), [betSheetOpen, setBetSheetOpen, isDark, isBetSlipPulsing, bets.length, dragOffsetY, isDraggingBetSheet, handleBetSheetPointerDown, handleBetSheetPointerMove, handleBetSheetPointerEnd]);


  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 ui-trans-slow pb-[env(safe-area-inset-bottom)]">
      {/* Sports Dropdown - Clean popup above nav */}
      {sportsMenuOpen && (
        <div
          ref={sportsDropdownRef}
          style={sportsDropdownLeft !== null ? { left: sportsDropdownLeft } : undefined}
          className={cn(
            "fixed bottom-24 w-max max-w-[calc(100vw-1.5rem)] rounded-2xl shadow-[0_18px_45px_rgba(15,23,42,0.85)] overflow-hidden z-50 border ui-blur-overlay",
            isDark
              ? "bg-slate-950/80 border-slate-700/70 text-slate-50"
              : "bg-white/80 border-slate-200/80 text-slate-900"
          )}
        >
          {sportsSubItems.map((sub, index) => (
            <Link
              key={sub.id}
              to={createPageUrl(sub.path)}
              onClick={() => setSportsMenuOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 text-sm ui-trans-fast",
                isDark ? "hover:bg-white/10" : "hover:bg-black/5",
                index !== sportsSubItems.length - 1 && (isDark ? "border-b border-slate-700/50" : "border-b border-slate-100/50")
              )}
            >
              <sub.icon className={cn(
                "w-5 h-5 ui-trans-fast",
                isDark ? "text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]" : "text-cyan-600"
              )} />
              <span className="font-medium">{getLabelForItem(sub)}</span>
              {sub.id === 'live' && (
                <span className="flex items-center gap-1 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full animate-pulse">
                  <span className="w-1.5 h-1.5 bg-white rounded-full" />
                  {t('nav_liveBadge')}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}

      <div className={cn(
        "flex items-center justify-around h-16 px-2 border-t ui-blur-surface",
        isDark
          ? "bg-slate-950/95 border-slate-800/80"
          : "bg-white/95 border-slate-200"
      )}>
        {items.map(renderNavItem)}
        {betSlipButton}
      </div>
    </nav>
  );
}

// PERFORMANCE FIX #15: Export memoized component with custom comparison
export default memo(BottomNav, (prevProps, nextProps) => {
  // Only re-render if betSheetOpen changes or if setBetSheetOpen reference changes
  return prevProps.betSheetOpen === nextProps.betSheetOpen &&
         prevProps.setBetSheetOpen === nextProps.setBetSheetOpen;
});
