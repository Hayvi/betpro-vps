import { useI18n } from '@/contexts/I18nContext';


export function CasinoHeroBanner() {
  const { t } = useI18n();
  return (
    <div className="relative h-48 md:h-64 mx-4 mt-4 rounded-2xl overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=1200&q=80)' }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/90 to-cyan-900/80" />
      <div className="absolute inset-0 flex flex-col justify-center px-8">
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">
          {t('casino_hero_title')}
        </h1>
        <h2 className="text-4xl md:text-6xl font-black tracking-tight">
          <span className="bg-gradient-to-r from-cyan-300 via-blue-300 to-emerald-300 text-transparent bg-clip-text">BET</span>
          <span className="text-emerald-400">.</span>
          <span className="bg-gradient-to-r from-emerald-300 to-cyan-300 text-transparent bg-clip-text">PRO</span>
        </h2>
        <p className="text-cyan-200/80 mt-2 text-sm md:text-base">{t('casino_hero_tagline')}</p>
      </div>
      {/* Decorative glow */}
      <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-1/4 w-24 h-24 bg-emerald-500/20 rounded-full blur-2xl" />
    </div>
  );
}
