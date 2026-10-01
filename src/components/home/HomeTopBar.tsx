import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { track } from '@/lib/analytics';

/** Transparent top bar: wordmark + language switch, sitting on the coloured surface. */
const HomeTopBar = () => {
  const { lang, dictionary } = useLanguage();
  const location = useLocation();
  const prefix = lang === 'en' ? '/en' : '';
  const switchPath = lang === 'ar'
    ? `/en${location.pathname === '/' ? '' : location.pathname}`
    : location.pathname.replace(/^\/en(?=\/|$)/, '') || '/';

  return (
    <>
      <a
        href="#main-content"
        className="fixed start-4 top-3 z-[70] -translate-y-20 rounded-md bg-primary px-4 py-3 text-primary-foreground focus:translate-y-0"
      >
        {dictionary.navigation.skip}
      </a>
      <div className="pointer-events-none fixed inset-x-0 top-0 z-40">
        <div className="container flex max-w-content items-center justify-between px-6 py-5">
          <Link
            to={prefix || '/'}
            className="pointer-events-auto font-display text-xl font-bold text-on-surface"
            aria-label={`${dictionary.brand.name} — ${dictionary.navigation.home}`}
          >
            {dictionary.brand.name}
          </Link>
          <div className="eyebrow pointer-events-auto flex items-center gap-2 text-xs" aria-label={dictionary.navigation.language}>
            <Link
              to={lang === 'ar' ? location.pathname : switchPath}
              onClick={() => lang !== 'ar' && track('lang_switch', { to: 'ar' })}
              aria-current={lang === 'ar' ? 'page' : undefined}
              className={lang === 'ar' ? 'text-on-surface' : 'text-on-surface-soft'}
            >
              {dictionary.navigation.arabic}
            </Link>
            <span aria-hidden="true" className="text-on-surface-soft">|</span>
            <Link
              to={lang === 'en' ? location.pathname : switchPath}
              onClick={() => lang !== 'en' && track('lang_switch', { to: 'en' })}
              aria-current={lang === 'en' ? 'page' : undefined}
              className={lang === 'en' ? 'text-on-surface' : 'text-on-surface-soft'}
            >
              {dictionary.navigation.english}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default HomeTopBar;
