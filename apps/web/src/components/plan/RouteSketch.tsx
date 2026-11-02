import type { Coordinates, ItineraryDay } from '@trippilot/shared';

/**
 * Schematic route map: projects the day's stops relative to the stay location.
 * Provider-backed interactive maps replace this in Milestone 2.
 */
export function RouteSketch({ day, base, baseLabel }: { day: ItineraryDay; base: Coordinates; baseLabel: string }) {
  const stops = day.stops.filter((s) => s.location);
  const pts: (Coordinates & { label: string; n: number | null })[] = [
    { ...base, label: baseLabel, n: null },
    ...stops.map((s, i) => ({ lat: s.location!.lat, lng: s.location!.lng, label: s.title, n: i + 1 })),
  ];
  const W = 360, H = 240, PAD = 34;
  const k = Math.cos((base.lat * Math.PI) / 180);
  const xs = pts.map((p) => p.lng * k);
  const ys = pts.map((p) => p.lat);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  const span = Math.max(maxX - minX, maxY - minY, 0.02);
  const scale = Math.min((W - PAD * 2) / span, (H - PAD * 2) / span);
  const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
  const proj = (p: Coordinates) => ({ x: W / 2 + (p.lng * k - cx) * scale, y: H / 2 - (p.lat - cy) * scale });
  const projected = pts.map((p) => ({ ...p, ...proj(p) }));
  const path = projected.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const kmAcross = Math.round(span * 111);

  return (
    <figure className="overflow-hidden rounded-2xl border border-line bg-[#F7F4EC]">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`Route sketch for day ${day.dayNumber}`}>
        <defs>
          <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M24 0H0V24" fill="none" stroke="#E6E0D2" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width={W} height={H} fill="url(#grid)" />
        {projected.length > 1 && <path d={path} fill="none" stroke="#1F6650" strokeWidth="2.5" strokeDasharray="6 5" strokeLinecap="round" />}
        {projected.map((p, i) =>
          p.n === null ? (
            <g key={i}>
              <rect x={p.x - 11} y={p.y - 11} width="22" height="22" rx="6" fill="#0F1D18" />
              <path d={`M${p.x - 5} ${p.y + 4} V${p.y - 1} L${p.x} ${p.y - 5} L${p.x + 5} ${p.y - 1} V${p.y + 4}Z`} fill="#fff" />
            </g>
          ) : (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="12" fill="#fff" stroke="#1F6650" strokeWidth="2.5" />
              <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="#174A3B">{p.n}</text>
            </g>
          ),
        )}
      </svg>
      <figcaption className="flex items-center justify-between border-t border-line bg-white/70 px-4 py-2 text-[11px] text-muted">
        <span>Schematic · not to scale for roads</span>
        <span>~{kmAcross} km across</span>
      </figcaption>
    </figure>
  );
}
