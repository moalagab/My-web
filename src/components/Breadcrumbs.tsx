import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Helmet } from 'react-helmet-async';

interface BreadcrumbsProps {
  /** Optional trail overriding the path-derived one. `key` maps to dictionary.ui.breadcrumb. */
  customItems?: { key?: string; label?: string; path: string }[];
}

const Breadcrumbs = ({ customItems }: BreadcrumbsProps) => {
  const { lang, isRtl, dictionary } = useLanguage();
  const labels = dictionary.ui.breadcrumb as Record<string, string>;
  const location = useLocation();
  const prefix = lang === 'en' ? '/en' : '';
  const pathWithoutLang = location.pathname.replace(/^\/(en|ar)/, '');
  const pathSegments = pathWithoutLang.split('/').filter(Boolean);

  const items: { label: string; path: string; isLast: boolean }[] = [
    { label: labels.home, path: prefix || '/', isLast: pathSegments.length === 0 },
  ];

  if (customItems && customItems.length > 0) {
    customItems.forEach((item, index) => {
      items.push({
        label: (item.key && labels[item.key]) || item.label || '',
        path: `${prefix}${item.path}`,
        isLast: index === customItems.length - 1,
      });
    });
  } else {
    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      if (labels[segment]) {
        items.push({
          label: labels[segment],
          path: `${prefix}${currentPath}`,
          isLast: index === pathSegments.length - 1,
        });
      }
    });
  }

  if (items.length <= 1) return null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: `https://moalagab.art${item.path}`,
    })),
  };

  return (
    <>
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <nav aria-label={labels.label} className="py-4">
        <ol className="flex flex-wrap items-center gap-2 text-sm">
          {items.map((item, index) => (
            <li key={item.path} className="flex items-center gap-2">
              {index > 0 && (
                <ChevronRight className={`h-4 w-4 text-muted-foreground ${isRtl ? 'rotate-180' : ''}`} aria-hidden="true" />
              )}
              {item.isLast ? (
                <span className="flex items-center gap-1.5 font-medium text-foreground" aria-current="page">
                  {index === 0 && <Home className="h-4 w-4" aria-hidden="true" />}
                  {item.label}
                </span>
              ) : (
                <Link to={item.path} className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground">
                  {index === 0 && <Home className="h-4 w-4" aria-hidden="true" />}
                  <span>{item.label}</span>
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
};

export default Breadcrumbs;
