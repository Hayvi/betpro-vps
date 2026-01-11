import { Ticket } from 'lucide-react';
import { X, Trash2, Plus, Minus } from '@/components/ui/BrandIcons';
import { useBetSlip } from '@/hooks/useBetSlip';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useI18n } from '@/contexts/I18nContext';

export default function BetSlipContent({ onRequestClose } = {}) {
  const {
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
  } = useBetSlip();

  const { t, isRtl } = useI18n();

  const handleHeaderClick = (event) => {
    if (!onRequestClose) return;
    if (event.target.closest && event.target.closest('[data-betslip-header-ignore-close="true"]')) {
      return;
    }
    onRequestClose();
  };

  if (bets.length === 0) {
    return (
      <div className="flex flex-col w-full h-full" dir={isRtl ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div
          className={cn(
            'p-4 border-b border-slate-800/80 bg-slate-950/95 backdrop-blur-xl sticky top-0',
            onRequestClose && 'cursor-pointer select-none active:translate-y-0.5'
          )}
          onClick={handleHeaderClick}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 flex items-center justify-center">
                <Ticket className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">{t('betslip_title')}</h2>
                <p className="text-[10px] text-slate-500">{t('betslip_headerSubtitle')}</p>
              </div>
            </div>
            {onRequestClose && (
              <button
                type="button"
                data-betslip-header-ignore-close="true"
                onClick={(e) => {
                  e.stopPropagation();
                  onRequestClose();
                }}
                aria-label={t('betslip_closeAria')}
                className="w-8 h-8 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700/80 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Empty state - Pass 2 Revamp */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20 relative overflow-hidden">
          <div className="relative group mb-8">
            {/* Background Halo */}
            <div className="absolute -inset-10 bg-cyan-500/5 blur-3xl rounded-full opacity-50 transition-opacity duration-1000" />

            {/* Ticket Illustration composition */}
            <div className="relative w-24 h-24 flex items-center justify-center">
              <div className="absolute inset-0 bg-slate-800/80 border border-slate-700/50 rounded-2xl rotate-12 group-hover:rotate-[20deg] transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-2xl rounded-2xl transition-transform duration-500 flex items-center justify-center">
                <Ticket className="w-10 h-10 text-slate-700 group-hover:text-slate-600 transition-colors" />

                {/* Subtle 'no' indicator */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-0.5 bg-rose-500/20 rotate-45" />
              </div>
            </div>

            {/* Small floating deco */}
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center animate-bounce duration-[3000ms]">
              <Ticket className="w-3 h-3 text-emerald-400/60" />
            </div>
          </div>

          <div className="text-center relative z-10">
            <h3 className="text-base font-black text-white tracking-wide">
              {t('betslip_emptyTitle')}
            </h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed max-w-[200px] mx-auto">
              {t('betslip_emptyDescription')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div
        className={cn(
          'p-4 border-b border-slate-800/80 sticky top-0 bg-slate-950/95 backdrop-blur-xl',
          onRequestClose && 'cursor-pointer select-none active:translate-y-0.5'
        )}
        onClick={handleHeaderClick}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 flex items-center justify-center">
              <Ticket className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">{t('betslip_title')}</h2>
              <p className="text-[10px] text-emerald-400">{bets.length} {t('betslip_betCountLabel')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onRequestClose && (
              <button
                type="button"
                data-betslip-header-ignore-close="true"
                onClick={(e) => {
                  e.stopPropagation();
                  onRequestClose();
                }}
                aria-label={t('betslip_closeAria')}
                className="w-8 h-8 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700/80 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              data-betslip-header-ignore-close="true"
              onClick={(e) => {
                e.stopPropagation();
                clearBets();
              }}
              aria-label={t('betslip_clearAllAria')}
              className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bets list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0 max-h-[40vh] lg:max-h-none">
        {bets.map((bet) => (
          <div
            key={bet.id}
            className="bg-slate-800/40 rounded-xl p-3 border border-slate-700/60 hover:border-slate-600/60 transition-all"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-slate-500 truncate mb-0.5">{bet.league}</p>
                <p className="text-xs font-medium text-white truncate">
                  {bet.homeTeam} - {bet.awayTeam}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-700/50 text-slate-300">{bet.betType}</span>
                  <span className="text-xs font-bold text-emerald-400">{bet.odds}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeBet(bet.id)}
                aria-label={t('betslip_removeBetAria')}
                className="w-6 h-6 rounded-lg bg-slate-700/50 flex items-center justify-center text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all flex-shrink-0"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/80 space-y-3">
        {/* Odds & Win */}
        <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-700/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">{t('betslip_totalOddsLabel')}</span>
            <span className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 text-transparent bg-clip-text">
              {accumulatorOdds.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">{t('betslip_potentialWinLabel')}</span>
            <span className="text-lg font-bold text-white">
              {potentialWin} <span className="text-xs text-slate-400">{t('wallet_currencyCode')}</span>
            </span>
          </div>
        </div>

        {/* Stake input */}
        <div>
          <label className="block text-xs text-slate-400 mb-1.5">{t('betslip_stakeLabel')}</label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => incrementStake(-0.5)}
              aria-label={t('betslip_decreaseStakeAria')}
              className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700/80 transition-all"
            >
              <Minus className="w-4 h-4" />
            </button>
            <Input
              type="number"
              min="1"
              max={userBalance}
              step="0.5"
              value={stake}
              onChange={(e) => handleStakeChange(e.target.value)}
              className={cn(
                "flex-1 text-center text-sm h-10 rounded-xl",
                !isValidStake && "border-rose-500/50 focus:border-rose-500"
              )}
            />
            <button
              type="button"
              onClick={() => incrementStake(0.5)}
              aria-label={t('betslip_increaseStakeAria')}
              className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700/80 transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Quick stake buttons */}
          <div className="flex gap-2 mt-2">
            {[0.5, 20, 50].map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => incrementStake(amount)}
                className="flex-1 h-8 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-700/60 hover:border-cyan-500/30 transition-all"
              >
                +{amount}
              </button>
            ))}
          </div>

          {!isValidStake && (
            <p className="text-[10px] text-rose-400 mt-1.5">
              {stake < 1
                ? t('betslip_minStakeError')
                : t('betslip_insufficientBalanceError').replace('{balance}', userBalance.toFixed(2))}
            </p>
          )}
        </div>

        {/* Promo code */}
        <div>
          <label className="block text-xs text-slate-400 mb-1.5">{t('betslip_promoLabel')}</label>
          <Input
            type="text"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            placeholder={t('betslip_promoPlaceholder')}
            className="text-sm h-10 rounded-xl"
          />
        </div>

        {/* Place bet button */}
        <button
          type="button"
          onClick={handlePlaceBet}
          disabled={!isValidStake || bets.length === 0 || isPlacingBet}
          className={cn(
            "w-full h-12 rounded-xl text-sm font-bold transition-all duration-300",
            isValidStake && bets.length > 0 && !isPlacingBet
              ? "bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white shadow-[0_4px_20px_rgba(16,185,129,0.3)] hover:shadow-[0_4px_25px_rgba(16,185,129,0.4)] hover:scale-[1.02] active:scale-[0.98]"
              : "bg-slate-800 text-slate-500 cursor-not-allowed"
          )}
        >
          {isPlacingBet ? t('betslip_placingBetButton') : t('betslip_placeBetButton')}
        </button>
      </div>
    </div>
  );
}
