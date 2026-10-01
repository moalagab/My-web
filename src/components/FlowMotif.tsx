import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface FlowMotifProps {
  className?: string;
  label: string;
}

export const FlowMotif = ({ className, label }: FlowMotifProps) => {
  const { isRtl } = useLanguage();
  const transform = isRtl ? 'translate(640 0) scale(-1 1)' : undefined;
  return (
    <svg className={cn('h-auto w-full max-w-xl text-accent', className)} viewBox="0 0 640 220" role="img" aria-label={label}>
      <g transform={transform}>
        <circle cx="38" cy="110" r="9" className="fill-accent" />
        <path d="M47 110H140C190 110 190 45 248 45H370M47 110H370M47 110H140C190 110 190 175 248 175H370" className="fill-none stroke-accent" strokeWidth="4" />
        <circle cx="280" cy="45" r="11" className="fill-muted stroke-accent" strokeWidth="4" />
        <circle cx="280" cy="110" r="11" className="fill-muted stroke-accent" strokeWidth="4" />
        <circle cx="280" cy="175" r="11" className="fill-muted stroke-accent" strokeWidth="4" />
        <path d="M370 45C430 45 430 110 485 110M370 110H485M370 175C430 175 430 110 485 110" className="fill-none stroke-accent" strokeWidth="4" />
        <rect x="485" y="74" width="126" height="72" rx="6" className="fill-secondary stroke-accent" strokeWidth="4" />
      </g>
      <text x={isRtl ? 92 : 548} y="116" textAnchor="middle" className="fill-primary font-mono text-[18px] font-medium">{label}</text>
    </svg>
  );
};

export default FlowMotif;