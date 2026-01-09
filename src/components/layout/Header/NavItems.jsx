import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils/index';
import { BPCoinIcon } from '@/components/ui/BrandIcons';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { useAnimatedNumber } from '@/hooks/useAnimatedNumber';
import { useI18n } from '@/contexts/I18nContext';


export function NavItems({ items = [], userBalance = 0 }) {
  const { isDark } = useTheme();
  const location = useLocation();
  const animatedBalance = useAnimatedNumber(userBalance);
  const { t } = useI18n();

  const getCurrentPage = () => {
    const path = location.pathname.replace('/', '');
    return path || 'home';
  };

  const getLabelForItem = (item) => {
    switch (item.id) {
      case 'home':
        return t('nav_home');
      case 'sports':
        return t('nav_sports');
      case 'live':
        return t('nav_live');
      case 'casino':
        return t('nav_casino');
      case 'wallet':
        return t('header_wallet');
      default:
        return item.name;
    }
  };

  return (
    <nav className="flex items-center gap-2">
      {items.map((item) => (
        item.showBalance ? (
          <div
            key={item.id}
            className={cn(
              'flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 animate-slide-in select-none',
              getCurrentPage() === item.path
                ? isDark
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 shadow-lg'
                  : 'bg-cyan-500/10 text-cyan-600 border border-cyan-400/30 shadow-lg'
                : cn(
                  'border border-transparent',
                  isDark ? 'text-gray-300' : 'text-slate-600'
                )
            )}
          >
            <item.icon className="w-4 h-4" />
            <span className="font-semibold">{getLabelForItem(item)}</span>

            <div className={cn(
              'flex items-center gap-1 mr-2 px-3 py-1 rounded-full text-xs font-black',
              isDark
                ? 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 text-cyan-300 border border-cyan-400/30'
                : 'bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 text-cyan-600 border border-cyan-400/30'
            )}>
              <BPCoinIcon className="w-3 h-3" />
              <span>{Number(animatedBalance || 0).toFixed(2)} {t('wallet_currencyCode')}</span>
            </div>
          </div>
        ) : (
          <Link
            key={item.id}
            to={createPageUrl(item.path)}
            className={cn(
              'flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 animate-slide-in',
              getCurrentPage() === item.path
                ? isDark
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 shadow-lg'
                  : 'bg-cyan-500/10 text-cyan-600 border border-cyan-400/30 shadow-lg'
                : cn(
                  'hover:scale-105 border border-transparent hover:shadow-md',
                  isDark
                    ? 'text-gray-300 hover:text-white hover:bg-white/10'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-black/5'
                )
            )}
          >
            <item.icon className="w-4 h-4" />
            <span className="font-semibold">{getLabelForItem(item)}</span>

            {/* Live Badge */}
            {item.badge && (
              <span className={cn(
                'flex items-center gap-1 text-[10px] px-2 py-1 rounded-full font-black',
                isDark ? 'bg-red-500 text-white shadow-lg' : 'bg-red-500 text-white shadow-lg'
              )}>
                <span className={cn('w-1.5 h-1.5 rounded-full live-pulse', isDark ? 'bg-white' : 'bg-white')} />
                {t('nav_liveBadge')}
              </span>
            )}
          </Link>
        )
      ))}
    </nav>
  );
}
