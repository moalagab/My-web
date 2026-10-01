import { Link, useLocation } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { siteSettings } from '@/lib/site-content';
import { track } from '@/lib/analytics';

/** Bottom-centred pill navigation (replaces the fixed header on the home page). */
const FloatingNav = () => {
  const { lang, dictionary } = useLanguage();
  const location = useLocation();
  const prefix = lang === 'en' ? '/en' : '';
  const to = (path = '') => `${prefix}${path}` || '/';
  const items = [
    { label: dictionary.navigation.work, href: to('/work') },
    { label: dictionary.navigation.services, href: to('/services') },
    { label: dictionary.navigation.products, href: to('/products') },
    { label: dictionary.navigation.about, href: to('/about') },
  ];

  return (
    <>
      <nav
        aria-label={dictionary.navigation.label}
        className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4 md:bottom-6"
      >
        <div className="pointer-events-auto flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-border bg-card/95 p-1.5 shadow-sm backdrop-blur-none">
          {items.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className="whitespace-nowrap rounded-full px-3.5 py-2 text-sm text-card-foreground/75 transition-colors hover:bg-secondary hover:text-card-foreground md:px-4"
            >
              {item.label}
            </Link>
          ))}
          <Link
            to={to('/start')}
            onClick={() => track('cta_start_click', { location: 'floating_nav' })}
            className="whitespace-nowrap rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-accent"
          >
            {dictionary.navigation.start}
          </Link>
        </div>
      </nav>
      <a
        href={siteSettings.whatsappLink}
        target="_blank"
        rel="noreferrer"
        onClick={() => track('whatsapp_click', { location: 'home_floating' })}
        className="fixed bottom-20 z-50 hidden items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm text-card-foreground shadow-sm md:bottom-6 md:end-6 md:inline-flex"
        aria-label={dictionary.navigation.whatsapp}
      >
        <MessageCircle className="h-4 w-4" aria-hidden="true" />
        {dictionary.navigation.whatsapp}
      </a>
      <div className="fixed bottom-6 start-6 z-40 hidden lg:block">
        <span className="eyebrow text-xs uppercase text-on-surface-soft" aria-hidden="true">
          {dictionary.navigation.scrollHint}
        </span>
      </div>
      <span aria-hidden="true" className="sr-only">{location.pathname}</span>
    </>
  );
};

export default FloatingNav;
