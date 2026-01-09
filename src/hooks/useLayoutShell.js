import { useState, useCallback } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useBet } from '@/contexts/BetContext';


export function useLayoutShell() {
  const { isDark } = useTheme();
  useBet(); // Initialize BetContext

  const [betSheetOpen, setBetSheetOpen] = useState(false);

  const toggleBetSheet = useCallback(() => {
    setBetSheetOpen((prev) => !prev);
  }, []);

  return {
    isDark,
    betSheetOpen,
    setBetSheetOpen,
    toggleBetSheet,
  };
}
