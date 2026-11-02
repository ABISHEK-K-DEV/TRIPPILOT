import { useId } from 'react';
import type { SceneKind } from '@trippilot/shared';

/**
 * Generated destination artwork. Used until licensed photography is wired in
 * via `imageUrl`; deliberately illustrative so it never misrepresents a place.
 */
export function Postcard({
  scene, palette, imageUrl, alt, className = '',
}: { scene: SceneKind; palette: [string, string, string]; imageUrl?: string | null; alt: string; className?: string }) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  if (imageUrl) return <img src={imageUrl} alt={alt} loading="lazy" className={`object-cover ${className}`} />;
  const [a, b, c] = palette;
  return (
    <svg viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice" role="img" aria-label={alt} className={className}>
      <defs>
        <linearGradient id={`sky${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={a} stopOpacity="0.95" />
          <stop offset="1" stopColor="#FFF8EE" />
        </linearGradient>
        <linearGradient id={`deep${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={b} />
          <stop offset="1" stopColor={b} stopOpacity="0.75" />
        </linearGradient>
        <linearGradient id={`water${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={c} stopOpacity="0.9" />
          <stop offset="1" stopColor={b} stopOpacity="0.9" />
        </linearGradient>
      </defs>
      <rect width="400" height="260" fill={`url(#sky${id})`} />
      <circle cx="300" cy="78" r="34" fill="#FFF4DA" opacity="0.9" />
      <circle cx="300" cy="78" r="54" fill="#FFF4DA" opacity="0.25" />
      <Scene scene={scene} id={id} a={a} b={b} c={c} />
    </svg>
  );
}

function Scene({ scene, id, a, b, c }: { scene: SceneKind; id: string; a: string; b: string; c: string }) {
  const water = `url(#water${id})`;
  const deep = `url(#deep${id})`;
  switch (scene) {
    case 'beach':
      return (
        <g>
          <path d="M0 150 Q200 135 400 150 V260 H0Z" fill={water} />
          <path d="M0 162 Q200 150 400 166" stroke="#fff" strokeOpacity=".5" strokeWidth="2" fill="none" />
          <path d="M0 205 Q140 180 400 200 V260 H0Z" fill="#F6E3C1" />
          <Palm x={70} y={210} color={b} />
          <Palm x={110} y={214} color={b} scale={0.75} />
        </g>
      );
    case 'island':
      return (
        <g>
          <path d="M0 140 H400 V260 H0Z" fill={water} />
          <ellipse cx="210" cy="168" rx="120" ry="16" fill="#F6E3C1" />
          <path d="M140 166 Q210 120 280 166Z" fill={b} opacity=".85" />
          <Palm x={250} y={166} color={b} scale={0.8} />
          <path d="M0 205 Q100 198 200 205 T400 205" stroke="#fff" strokeOpacity=".45" strokeWidth="2" fill="none" />
          <path d="M30 230 Q130 222 230 230 T430 230" stroke="#fff" strokeOpacity=".3" strokeWidth="2" fill="none" />
        </g>
      );
    case 'mountain':
      return (
        <g>
          <path d="M0 175 L80 95 L150 160 L230 70 L320 150 L400 105 V260 H0Z" fill={c} opacity=".55" />
          <path d="M230 70 L255 95 L242 92 L230 102 L218 92 L205 96Z" fill="#fff" opacity=".9" />
          <path d="M0 210 L110 130 L190 190 L290 120 L400 190 V260 H0Z" fill={deep} />
          <path d="M290 120 L310 136 L298 134 L290 142 L282 134 L270 137Z" fill="#fff" opacity=".85" />
          <path d="M0 240 Q200 215 400 240 V260 H0Z" fill={b} />
        </g>
      );
    case 'forest':
      return (
        <g>
          <path d="M0 165 Q100 120 200 160 T400 150 V260 H0Z" fill={c} opacity=".7" />
          <path d="M0 200 Q120 160 240 195 T400 185 V260 H0Z" fill={deep} />
          {[30, 60, 95, 300, 335, 365].map((x, i) => (
            <path key={x} d={`M${x} ${215 - (i % 2) * 8} l14 -42 l14 42Z`} fill={b} opacity=".95" />
          ))}
          <path d="M0 238 Q200 222 400 238 V260 H0Z" fill={b} />
        </g>
      );
    case 'desert':
      return (
        <g>
          <path d="M0 175 Q120 140 230 172 T400 160 V260 H0Z" fill={a} opacity=".8" />
          <path d="M0 210 Q150 170 270 205 T400 200 V260 H0Z" fill={c} opacity=".55" />
          <path d="M0 235 Q200 205 400 238 V260 H0Z" fill={b} opacity=".8" />
          <rect x="300" y="110" width="10" height="70" fill={c} opacity=".8" />
          <rect x="316" y="85" width="12" height="95" fill={c} opacity=".9" />
          <rect x="334" y="120" width="9" height="60" fill={c} opacity=".75" />
        </g>
      );
    case 'city':
      return (
        <g>
          {[
            [20, 120, 34], [60, 90, 26], [92, 140, 40], [140, 60, 22], [168, 110, 36], [212, 75, 28],
            [246, 130, 44], [296, 95, 30], [332, 120, 36], [372, 105, 28],
          ].map(([x, y, w], i) => (
            <rect key={i} x={x} y={y} width={w} height={260 - y!} fill={i % 2 ? b : c} opacity={i % 3 === 0 ? 0.65 : 0.9} rx="2" />
          ))}
          <path d="M146 60 L151 30 L156 60Z" fill={c} />
          <path d="M0 225 H400 V260 H0Z" fill={b} opacity=".95" />
        </g>
      );
    case 'lake':
      return (
        <g>
          <path d="M0 150 Q100 110 200 140 T400 130 V170 H0Z" fill={c} opacity=".6" />
          <rect x="150" y="118" width="100" height="40" fill="#FFF8EE" />
          <path d="M165 118 Q175 98 185 118Z M190 118 Q200 92 210 118Z M215 118 Q225 98 235 118Z" fill="#FFF8EE" />
          <path d="M0 160 H400 V260 H0Z" fill={water} />
          <rect x="150" y="162" width="100" height="26" fill="#FFF8EE" opacity=".35" />
          <path d="M40 200 H160 M230 220 H360" stroke="#fff" strokeOpacity=".4" strokeWidth="2" />
        </g>
      );
    case 'heritage':
    default:
      return (
        <g>
          <path d="M0 200 Q200 180 400 200 V260 H0Z" fill={c} opacity=".5" />
          <path d="M70 200 V130 H330 V200Z" fill={b} />
          <path d="M70 130 l12 -14 l12 14 M306 130 l12 -14 l12 14" fill={b} />
          <path d="M170 130 Q200 80 230 130Z" fill={b} />
          <rect x="196" y="72" width="8" height="12" fill={b} />
          {[95, 135, 245, 285].map((x) => (
            <path key={x} d={`M${x} 200 v-30 q12 -18 24 0 v30Z`} fill="#FFF8EE" opacity=".85" />
          ))}
          <path d="M182 200 v-38 q18 -26 36 0 v38Z" fill="#FFF8EE" opacity=".9" />
          <path d="M0 230 H400 V260 H0Z" fill={b} opacity=".9" />
        </g>
      );
  }
}

function Palm({ x, y, color, scale = 1 }: { x: number; y: number; color: string; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} fill={color}>
      <path d="M0 0 Q6 -40 18 -78 L22 -77 Q12 -40 6 0Z" />
      <path d="M20 -78 Q-10 -90 -30 -70 Q-6 -80 20 -74Z" />
      <path d="M20 -78 Q50 -92 70 -68 Q46 -80 20 -73Z" />
      <path d="M20 -78 Q10 -104 -12 -106 Q8 -96 18 -76Z" />
      <path d="M20 -78 Q40 -106 60 -100 Q40 -96 22 -75Z" />
    </g>
  );
}
