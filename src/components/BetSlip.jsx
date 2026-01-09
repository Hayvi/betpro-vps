import { useEffect, useRef, useState } from 'react';
import BetSlipContent from './BetSlipContent';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { useI18n } from '@/contexts/I18nContext';
import { useBet } from '@/contexts/BetContext';

export default function BetSlip() {
  const { isDark } = useTheme();
  const { isRtl } = useI18n();
  const { betSlipPulse } = useBet();
  const [isPulsing, setIsPulsing] = useState(false);
  const pulseTimeoutRef = useRef(null);

  useEffect(() => {
    if (betSlipPulse === 0) return;

    setIsPulsing(true);
    if (pulseTimeoutRef.current) {
      clearTimeout(pulseTimeoutRef.current);
    }
    pulseTimeoutRef.current = setTimeout(() => {
      setIsPulsing(false);
      pulseTimeoutRef.current = null;
    }, 450);

    return () => {
      if (pulseTimeoutRef.current) {
        clearTimeout(pulseTimeoutRef.current);
        pulseTimeoutRef.current = null;
      }
    };
  }, [betSlipPulse]);

  return (
    <div
      className={cn(
        'hidden lg:flex fixed end-0 top-16 bottom-0 w-80 border-s transition-all duration-500 z-40 overflow-y-auto transform-gpu',
        isDark
          ? 'bg-slate-950/95 border-slate-800/80 backdrop-blur-xl'
          : 'bg-white/95 border-slate-200 backdrop-blur-xl',
        isPulsing && 'ring-2 ring-emerald-500/30 ring-offset-0'
      )}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <BetSlipContent />
    </div>
  );
}
