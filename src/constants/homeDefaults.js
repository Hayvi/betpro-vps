
export const heroSlides = [
  {
    id: 1,
    titleKey: 'home_hero_slide1_title',
    subtitleKey: 'home_hero_slide1_subtitle',
    gradient: 'from-emerald-600/40 via-transparent to-transparent',
    image: '/images/home/hero-football.jpg',
  },
  {
    id: 2,
    titleKey: 'home_hero_slide2_title',
    subtitleKey: 'home_hero_slide2_subtitle',
    gradient: 'from-amber-600/40 via-transparent to-transparent',
    image: '/images/home/hero-casino.jpg',
  },
  {
    id: 3,
    titleKey: 'home_hero_slide3_title',
    subtitleKey: 'home_hero_slide3_subtitle',
    gradient: 'from-purple-600/40 via-transparent to-transparent',
    image: '/images/home/hero-slots.jpg',
  },
];

export const categories = [
  {
    id: 'sport',
    titleKey: 'home_category_sport_title',
    subtitleKey: 'home_category_sport_subtitle',
    iconName: 'Trophy',
    gradient: 'from-emerald-900/80 to-emerald-950/90',
    image: '/images/home/cat-sports.jpg',
    link: '/prematch',
  },
  {
    id: 'live',
    titleKey: 'home_category_live_title',
    subtitleKey: 'home_category_live_subtitle',
    iconName: 'Radio',
    isLive: true,
    gradient: 'from-red-900/80 to-red-950/90',
    image: '/images/home/cat-live.jpg',
    link: '/live-sports',
  },
  {
    id: 'casino',
    titleKey: 'home_category_casino_title',
    subtitleKey: 'home_category_casino_subtitle',
    iconName: 'Gem',
    gradient: 'from-amber-900/80 to-amber-950/90',
    image: '/images/home/cat-casino.jpg',
    link: '/casino',
  },
];

export const CAROUSEL_INTERVAL = 5000;
