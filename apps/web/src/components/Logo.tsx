import { Link } from 'react-router-dom';

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className="group inline-flex items-center gap-2.5" aria-label="TripPilot home">
      <span className={`grid size-9 place-items-center rounded-[11px] ${light ? 'bg-white/15' : 'bg-pine-700'} transition group-hover:rotate-[-6deg]`}>
        <svg viewBox="0 0 32 32" className="size-5" aria-hidden>
          <path d="M5 19.5 26 7l-5 18.5-5.5-6.3-6.6 2.5 4-4.5z" fill="#F3EFE7" />
        </svg>
      </span>
      <span className={`display text-[21px] ${light ? 'text-white' : 'text-ink'}`}>TripPilot</span>
    </Link>
  );
}
