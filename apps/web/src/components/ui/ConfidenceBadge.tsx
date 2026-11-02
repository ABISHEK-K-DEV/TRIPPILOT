import { PRICE_CONFIDENCE_LABELS, type PriceConfidence } from '@trippilot/shared';

const styles: Record<PriceConfidence, string> = {
  verified: 'bg-pine-50 text-pine-700 ring-pine-200',
  estimate: 'bg-amber-soft text-amber-ink ring-amber-ink/20',
  sample: 'bg-violet-soft text-violet-ink ring-violet-ink/20',
};
const dots: Record<PriceConfidence, string> = { verified: 'bg-pine-500', estimate: 'bg-amber-ink', sample: 'bg-violet-ink' };

export function ConfidenceBadge({ confidence, compact = false }: { confidence: PriceConfidence; compact?: boolean }) {
  const meta = PRICE_CONFIDENCE_LABELS[confidence];
  return (
    <span
      title={meta.description}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${styles[confidence]}`}
    >
      <span className={`size-1.5 rounded-full ${dots[confidence]}`} aria-hidden />
      {compact ? meta.label.split(' ')[0] : meta.label}
    </span>
  );
}

export function ConfidenceLegend() {
  return (
    <ul className="space-y-2.5 text-sm">
      {(Object.keys(PRICE_CONFIDENCE_LABELS) as PriceConfidence[]).map((c) => (
        <li key={c} className="flex items-start gap-3">
          <ConfidenceBadge confidence={c} />
          <span className="text-muted">{PRICE_CONFIDENCE_LABELS[c].description}</span>
        </li>
      ))}
    </ul>
  );
}
