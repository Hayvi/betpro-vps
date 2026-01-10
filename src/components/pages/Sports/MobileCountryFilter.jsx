import { useState } from 'react';
import { ChevronDown, ChevronUp } from '@/components/ui/BrandIcons';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useI18n } from '@/contexts/I18nContext';

function MobileLeagueButton({ league, isSelected, isDark, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect && onSelect(league)}
      className={cn(
        'w-full flex items-center justify-between rounded-lg px-2 py-1 text-xs',
        isSelected
          ? 'bg-emerald-600/20 text-emerald-400'
          : isDark
            ? 'text-gray-400 hover:text-white hover:bg-slate-900/80'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm">{league.icon}</span>
        <span className="truncate">{league.name}</span>
      </div>
      <Badge variant="secondary" className="bg-slate-700/50 text-[10px]">
        {league.count}
      </Badge>
    </button>
  );
}

export function MobileCountryFilter({
  countries = [],
  expandedCountry = null,
  onCountryToggle,
  selectedLeague = null,
  onLeagueSelect,
  isDark = true,
}) {
  const [open, setOpen] = useState(false);
  const { t } = useI18n();

  if (!countries || countries.length === 0) return null;

  return (
    <div className="md:hidden mb-3">
      <button
        type="button"
        className={cn(
          'w-full flex items-center justify-between rounded-xl px-3 py-2 border text-sm font-medium transition-colors',
          isDark
            ? 'bg-slate-900/80 border-slate-800 text-slate-100'
            : 'bg-white/80 border-slate-200 text-slate-900'
        )}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span>{t('sports_filterByCountryLeague')}</span>
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className={isDark ? 'bg-slate-700 text-gray-200' : 'bg-slate-200 text-slate-700'}
          >
            {countries.length}
          </Badge>
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {open && (
        <div
          className={cn(
            'mt-2 rounded-xl border overflow-hidden max-h-80 overflow-y-auto backdrop-blur',
            isDark ? 'bg-slate-950/90 border-slate-800' : 'bg-white/90 border-slate-200'
          )}
        >
          <div className="divide-y divide-slate-800/40">
            {countries.map((country) => (
              <div key={country.id} className="p-3">
                <button
                  type="button"
                  onClick={() => onCountryToggle && onCountryToggle(country.id)}
                  className={cn(
                    'w-full flex items-center justify-between rounded-lg px-2 py-1.5 text-sm',
                    expandedCountry === country.id
                      ? isDark
                        ? 'bg-slate-800 text-white'
                        : 'bg-slate-100 text-slate-900'
                      : isDark
                      ? 'text-slate-200 hover:bg-slate-900'
                      : 'text-slate-700 hover:bg-slate-50'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{country.flag}</span>
                    <span className="truncate">{country.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-slate-700/70 text-xs">
                      {country.count}
                    </Badge>
                    {expandedCountry === country.id ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </button>

                {expandedCountry === country.id && country.leagues && country.leagues.length > 0 && (
                  <div className="mt-2 space-y-1 pr-2">
                    {country.leagues.map((league) => (
                      <MobileLeagueButton
                        key={league.id}
                        league={league}
                        isSelected={selectedLeague === league.id}
                        isDark={isDark}
                        onSelect={onLeagueSelect}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
