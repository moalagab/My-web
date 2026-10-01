import { Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { track } from '@/lib/analytics';

const NotFound = () => {
  const { pathname } = useLocation();
  const { lang, dictionary } = useLanguage();
  const copy = dictionary.ui.notFound;
  const prefix = lang === 'en' ? '/en' : '';
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-6">
      <Helmet>
        <html lang={lang} dir={lang === 'en' ? 'ltr' : 'rtl'} />
        <title>{copy.metaTitle}</title>
        <meta name="robots" content="noindex, follow" />
        <link rel="canonical" href={`https://moalagab.art${pathname}`} />
      </Helmet>
      <div className="max-w-xl text-center">
        <p className="eyebrow mb-5 text-xs text-accent">{copy.eyebrow}</p>
        <h1 className="mb-5 font-display text-4xl sm:text-5xl">{copy.title}</h1>
        <p className="mb-8 text-muted-foreground">{copy.body}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild variant="outline"><Link to={prefix || '/'}>{copy.home}</Link></Button>
          <Button asChild variant="outline"><Link to={`${prefix}/work`}>{copy.work}</Link></Button>
          <Button asChild onClick={() => track('cta_start_click', { location: '404' })}>
            <Link to={`${prefix}/start`}>{copy.start}</Link>
          </Button>
        </div>
      </div>
    </main>
  );
};
export default NotFound;
