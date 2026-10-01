import { useLanguage } from '@/contexts/LanguageContext';

const approvedClientLogos: ReadonlyArray<{ name: string; source: string }> = [];

const ClientLogoRow = () => {
  const { dictionary } = useLanguage();
  // Mo adds approved client logos only.
  const logos = approvedClientLogos;

  if (logos.length === 0) return null;

  return (
    <div className="mt-10 border-t border-border pt-8">
      <p className="eyebrow mb-6 text-xs text-muted-foreground">{dictionary.home.proof.logosLabel}</p>
      <div className="grid grid-cols-2 items-center gap-8 sm:grid-cols-3 lg:grid-cols-6">
        {logos.map((logo) => <img key={logo.source} src={logo.source} alt={logo.name} className="mx-auto max-h-12 max-w-32 object-contain grayscale" loading="lazy" />)}
      </div>
    </div>
  );
};

export default ClientLogoRow;