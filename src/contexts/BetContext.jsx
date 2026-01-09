import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { nanoid } from 'nanoid';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { safeSetItem, safeGetItem } from '@/services/localStorageService';
import { onWsMessage } from '@/services/wsClient';

const BetContext = createContext();
const BETS_STORAGE_KEY = 'betpro_betslip';
const STAKE_STORAGE_KEY = 'betpro_stake';

// Load bets from localStorage
function loadBetsFromStorage() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return [];
    const stored = safeGetItem(BETS_STORAGE_KEY);
    if (stored) {
      const bets = JSON.parse(stored);
      // Filter out expired bets (matches that started more than 3 hours ago)
      const now = Date.now();
      const validBets = bets.filter((bet) => {
        if (!bet.startTime) return true;
        const matchTime = new Date(bet.startTime).getTime();
        return matchTime > now - 3 * 60 * 60 * 1000;
      });
      return validBets;
    }
  } catch (e) {
    console.warn('Failed to load bets from storage:', e);
  }
  return [];
}

// Load stake from localStorage
function loadStakeFromStorage() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return 1;
    const stored = safeGetItem(STAKE_STORAGE_KEY);
    if (stored) {
      const stake = parseFloat(stored);
      if (!isNaN(stake) && stake >= 1) return stake;
    }
  } catch (e) {
    console.warn('Failed to load stake from storage:', e);
  }
  return 1;
}

export function BetProvider({ children }) {
  const [bets, setBets] = useState(loadBetsFromStorage);
  const [stake, setStake] = useState(loadStakeFromStorage);
  const [promoCode, setPromoCode] = useState('');
  const [userBalance, setUserBalance] = useState(0);
  const [betSlipPulse, setBetSlipPulse] = useState(0);
  const { userId, isAuthenticated } = useAuth();
  const { t } = useI18n();

  // Save bets to localStorage whenever they change
  useEffect(() => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      const success = safeSetItem(BETS_STORAGE_KEY, JSON.stringify(bets));
      if (!success) {
        console.warn('Failed to save bets to storage due to quota limits');
      }
    } catch (e) {
      console.warn('Failed to save bets to storage:', e);
    }
  }, [bets]);

  // Save stake to localStorage whenever it changes
  useEffect(() => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      const success = safeSetItem(STAKE_STORAGE_KEY, stake.toString());
      if (!success) {
        console.warn('Failed to save stake to storage due to quota limits');
      }
    } catch (e) {
      console.warn('Failed to save stake to storage:', e);
    }
  }, [stake]);

  useEffect(() => {
    if (!isAuthenticated || !userId) return;

    const unsub = onWsMessage('balance_update', (msg) => {
      if (msg.balance !== undefined) {
        setUserBalance(Number(msg.balance) || 0);
      }
    });

    return unsub;
  }, [isAuthenticated, userId]);

  const validateOdds = (odds) => {
    // Convert to number if it's a string
    const numOdds = typeof odds === 'string' ? parseFloat(odds.replace(',', '.')) : odds;

    // Check if it's a valid number
    if (isNaN(numOdds) || !isFinite(numOdds)) {
      throw new Error(t('betslip_validateOdds_invalidNumber'));
    }

    // Check minimum and maximum odds
    if (numOdds < 1.01) {
      throw new Error(t('betslip_validateOdds_minOdds'));
    }

    if (numOdds > 1000) {
      throw new Error(t('betslip_validateOdds_maxOdds'));
    }

    return numOdds.toFixed(2);
  };

  const normalizeMarketKeyForCompare = (key) => {
    if (!key) return 'h2h_main';
    const k = String(key);
    if (k === 'h2h' || k === 'h2h_3_way') return 'h2h_main';
    return k;
  };

  const addBet = useCallback((bet) => {
    // Validate odds before proceeding (may throw, handled by caller/UI)
    const validatedOdds = validateOdds(bet.odds);

    setBets((prevBets) => {
      // Check if bet on same match already exists
      const existingBet = prevBets.find((b) => {
        const sameMatch =
          String(b.matchId) === String(bet.matchId) &&
          String(b.matchType) === String(bet.matchType);

        if (!sameMatch) return false;

        const existingKey = normalizeMarketKeyForCompare(b.marketKey);
        const newKey = normalizeMarketKeyForCompare(bet.marketKey);

        return existingKey === newKey;
      });

      const betWithValidatedOdds = { ...bet, odds: validatedOdds };

      if (existingBet) {
        // Same selection (same match, market and bet type) -> toggle off (remove bet)
        if (existingBet.betType === bet.betType) {
          return prevBets.filter((b) => b.id !== existingBet.id);
        }

        // Different selection within the same match/market -> switch to the new bet
        return prevBets.map((b) =>
          b.id === existingBet.id ? { ...betWithValidatedOdds, id: existingBet.id } : b
        );
      }

      return [...prevBets, { ...betWithValidatedOdds, id: nanoid() }];
    });

    setBetSlipPulse((prev) => prev + 1);
  }, [t]);

  const removeBet = useCallback((betId) => {
    setBets((prevBets) => prevBets.filter((b) => b.id !== betId));
  }, []);

  const clearBets = useCallback(() => {
    setBets([]);
  }, []);

  const accumulatorOdds = bets.length > 0
    ? bets.reduce((acc, bet) => acc * parseFloat(bet.odds), 1)
    : 0;

  const potentialWin = accumulatorOdds > 0 ? (stake * accumulatorOdds).toFixed(2) : '0.00';
  const isValidStake = stake >= 1 && stake <= userBalance;

  const updateUserBalance = useCallback((newBalance) => {
    setUserBalance(newBalance);
  }, []);

  const value = useMemo(
    () => ({
      bets,
      stake,
      promoCode,
      userBalance,
      betSlipPulse,
      setStake,
      setPromoCode,
      addBet,
      removeBet,
      clearBets,
      accumulatorOdds,
      potentialWin,
      isValidStake,
      updateUserBalance,
    }),
    [
      bets,
      stake,
      promoCode,
      userBalance,
      betSlipPulse,
      addBet,
      removeBet,
      clearBets,
      accumulatorOdds,
      potentialWin,
      isValidStake,
      updateUserBalance,
    ]
  );

  return <BetContext.Provider value={value}>{children}</BetContext.Provider>;
}

export function useBet() {
  const context = useContext(BetContext);
  if (!context) {
    throw new Error('useBet must be used within BetProvider');
  }
  return context;
}

