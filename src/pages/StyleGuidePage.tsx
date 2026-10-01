import { Helmet } from 'react-helmet-async';
import { ArrowUpRight } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import FlowMotif from '@/components/FlowMotif';
import { Eyebrow } from '@/components/system/Eyebrow';
import { Pill } from '@/components/system/Pill';
import { Section, SectionInner } from '@/components/system/Section';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

const tokens = [
  { name: 'Navy', value: '#26374D', role: '60%', className: 'bg-primary' },
  { name: 'Door', value: '#536D82', role: '20%', className: 'bg-accent' },
  { name: 'Harper', value: '#9DB2BF', role: '10%', className: 'bg-muted' },
  { name: 'Alice', value: '#DDE6ED', role: '10%', className: 'bg-secondary' },
  { name: 'Ink', value: '#1A1A2E', role: 'Text', className: 'bg-foreground' },
  { name: 'Paper', value: '#F7F9FB', role: 'Canvas', className: 'bg-background' },
];

const StyleGuidePage = () => {
  const { dictionary } = useLanguage();
  const copy = dictionary.styleguide;
  return (
    <>
      <Helmet><title>{`${copy.title} — ${dictionary.brand.name}`}</title></Helmet>
      <Navigation />
      <main id="main-content" className="pt-20">
        <Section className="border-b border-border">
          <SectionInner>
            <Eyebrow className="mb-5">{copy.eyebrow}</Eyebrow>
            <h1 className="max-w-4xl font-display text-4xl font-bold leading-tight md:text-7xl">{copy.title}</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">{copy.intro}</p>
          </SectionInner>
        </Section>

        <Section>
          <SectionInner>
            <Eyebrow className="mb-3">01</Eyebrow><h2 className="mb-10 font-display text-3xl font-bold md:text-5xl">{copy.colors}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tokens.map((token) => <Card key={token.name} className="overflow-hidden"><div className={`h-28 border-b border-border ${token.className}`} /><CardContent className="grid grid-cols-2 gap-3 pt-6"><strong>{token.name}</strong><span className="eyebrow text-end text-xs text-muted-foreground">{token.value}</span><span className="text-sm text-muted-foreground">{copy.tokenRole}</span><span className="eyebrow text-end text-xs">{token.role}</span></CardContent></Card>)}
            </div>
            <div className="dark mt-8 rounded-md border border-border bg-background p-8 text-foreground"><Eyebrow>{copy.dark}</Eyebrow><p className="mt-4 text-muted-foreground">{copy.body}</p></div>
          </SectionInner>
        </Section>

        <Section className="bg-card">
          <SectionInner>
            <Eyebrow className="mb-3">02</Eyebrow><h2 className="mb-10 font-display text-3xl font-bold md:text-5xl">{copy.typography}</h2>
            <div className="divide-y divide-border border-y border-border">
              <div className="grid gap-4 py-8 md:grid-cols-[10rem_1fr]"><Eyebrow>{copy.label}</Eyebrow><p className="font-display text-5xl font-bold leading-tight">{copy.display}</p></div>
              <div className="grid gap-4 py-8 md:grid-cols-[10rem_1fr]"><Eyebrow>H2 / 40</Eyebrow><p className="font-display text-4xl font-bold">{copy.heading}</p></div>
              <div className="grid gap-4 py-8 md:grid-cols-[10rem_1fr]"><Eyebrow>BODY / 18</Eyebrow><p className="max-w-2xl text-lg leading-8">{copy.body}</p></div>
            </div>
          </SectionInner>
        </Section>

        <Section>
          <SectionInner>
            <Eyebrow className="mb-3">03</Eyebrow><h2 className="mb-10 font-display text-3xl font-bold md:text-5xl">{copy.components}</h2>
            <div className="mb-10 flex flex-wrap items-center gap-4"><Button>{copy.primary}</Button><Button variant="outline">{copy.secondary}</Button><Button variant="link">{copy.textLink}<ArrowUpRight aria-hidden="true" /></Button><Pill>{copy.pill}</Pill></div>
            <Card className="max-w-xl"><CardHeader><Eyebrow>{copy.label}</Eyebrow><CardTitle>{copy.cardTitle}</CardTitle><CardDescription>{copy.cardBody}</CardDescription></CardHeader></Card>
          </SectionInner>
        </Section>

        <Section className="border-t border-border bg-card">
          <SectionInner><Eyebrow className="mb-3">04</Eyebrow><h2 className="mb-8 font-display text-3xl font-bold md:text-5xl">{copy.motif}</h2><FlowMotif label={copy.system} /></SectionInner>
        </Section>
      </main>
      <Footer />
    </>
  );
};

export default StyleGuidePage;