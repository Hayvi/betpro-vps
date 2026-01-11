import { Grid3X3, LayoutGrid } from '@/components/ui/BrandIcons';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useI18n } from '@/contexts/I18nContext';


export function CasinoSearchFilters({
  searchQuery = '',
  onSearchChange,
  gridSize = 'normal',
  onGridSizeChange,
  categories = [],
  selectedCategory = 'all',
  onCategoryChange,
  isDark = true,
}) {
  const { t } = useI18n();

  return (
    <div className={cn(
      "sticky top-0 z-10 px-4 py-3 mt-4 transition-all duration-500 border-b backdrop-blur-2xl shadow-[0_18px_45px_rgba(15,23,42,0.75)]",
      isDark ? "bg-slate-950/80 border-slate-800/80" : "bg-white/80 border-slate-200/80"
    )}>
      {/* Search & Grid Toggle */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Input
            placeholder={t('casino_searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            showSearch
          />
        </div>
        <Button
          variant="secondary"
          size="icon"
          onClick={() => onGridSizeChange(gridSize === 'normal' ? 'small' : 'normal')}
          aria-label={gridSize === 'normal' ? t('casino_toggleGridToSmall') : t('casino_toggleGridToNormal')}
          className={cn(
            "border",
            isDark
              ? "bg-slate-900/60 border-slate-700/70 text-slate-100 hover:bg-slate-800/80"
              : "bg-white/80 border-slate-200/80 text-slate-800 hover:bg-slate-100"
          )}
        >
          {gridSize === 'normal' ? <Grid3X3 className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
        </Button>
      </div>

      {/* Categories */}
      <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={selectedCategory === cat.id ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => onCategoryChange(cat.id)}
            className={cn(
              "whitespace-nowrap rounded-full transition-all duration-300",
              selectedCategory === cat.id
                ? "shadow-[0_0_25px_rgba(34,211,238,0.6)] bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-white"
                : isDark
                  ? "bg-slate-900/60 border-slate-700/70 text-slate-100 hover:bg-slate-800/80"
                  : "bg-slate-100/80 border-slate-200/80 text-slate-800 hover:bg-slate-200"
            )}
          >
            <span className="ml-1">{cat.icon}</span>
            {cat.name}
          </Button>
        ))}
      </div>
    </div>
  );
}
