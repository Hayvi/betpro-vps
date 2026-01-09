import { useCallback, useState } from 'react';
import { useBet } from '@/contexts/BetContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { apiService } from '@/services/apiClient';
import { useI18n } from '@/contexts/I18nContext';

export function useBetSlip() {
  const {
    bets,
    stake,
    promoCode,
    userBalance,
    setStake,
    setPromoCode,
    removeBet,
    clearBets,
    accumulatorOdds,
    potentialWin,
    isValidStake,
    updateUserBalance,
  } = useBet();

  const { isAuthenticated } = useAuth();
  const { showError, showSuccess } = useToast();
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const { t } = useI18n();

  const handleStakeChange = useCallback(
    (value) => {
      const numValue = parseFloat(value) || 0;
      if (numValue >= 0) {
        setStake(Math.min(numValue, userBalance));
      }
    },
    [setStake, userBalance]
  );

  const incrementStake = useCallback(
    (amount) => {
      setStake((prev) => {
        const newValue = prev + amount;
        return Math.max(1, Math.min(newValue, userBalance));
      });
    },
    [setStake, userBalance]
  );

  const handlePlaceBet = useCallback(async () => {
    if (!isAuthenticated) {
      showError(t('betslip_loginRequired'));
      return;
    }
    if (stake < 1) {
      showError(t('betslip_minStakeError'));
      return;
    }
    if (stake > userBalance) {
      showError(
        t('betslip_insufficientBalanceError').replace(
          '{balance}',
          userBalance.toFixed(2)
        )
      );
      return;
    }
    if (bets.length === 0) {
      showError(t('betslip_noBetsSelected'));
      return;
    }

    setIsPlacingBet(true);

    try {
      const betData = {
        bets,
        stake,
        accumulatorOdds,
        potentialWin: parseFloat(potentialWin),
        promoCode: promoCode || null,
      };

      const result = await apiService.bets.place(betData);

      // Update balance with the server-confirmed value
      if (result?.newBalance !== undefined) {
        updateUserBalance(result.newBalance);
      }

      showSuccess(t('betslip_placeBetSuccess'));
      clearBets();
      setStake(1);
      setPromoCode('');
    } catch (error) {
      const rawMessage = error?.message || '';

      if (rawMessage.includes('insufficient') || rawMessage.includes('balance')) {
        showError(t('betslip_insufficientBalanceToast'));
      } else if (rawMessage.includes('authenticated')) {
        showError(t('betslip_loginRequired'));
      } else if (rawMessage) {
        // If backend already returned a localized message, surface it as-is
        showError(rawMessage);
      } else {
        showError(t('betslip_placeBetError'));
      }
    } finally {
      setIsPlacingBet(false);
    }
  }, [
    isAuthenticated,
    bets,
    stake,
    userBalance,
    accumulatorOdds,
    potentialWin,
    promoCode,
    showError,
    showSuccess,
    clearBets,
    setStake,
    setPromoCode,
    updateUserBalance,
    t,
  ]);

  return {
    bets,
    stake,
    promoCode,
    userBalance,
    setPromoCode,
    removeBet,
    clearBets,
    accumulatorOdds,
    potentialWin,
    isValidStake,
    isPlacingBet,
    handleStakeChange,
    incrementStake,
    handlePlaceBet,
  };
}
