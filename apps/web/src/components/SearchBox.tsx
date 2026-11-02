import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '../lib/queries';

function useDebounced<T>(value: T, ms = 200) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

type Option = { key: string; label: string; sub: string; to: string; icon: string };

export function SearchBox({ className = '', placeholder = 'Search destinations, countries, sights…' }: { className?: string; placeholder?: string }) {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const debounced = useDebounced(q);
  const { data, isFetching } = useSearch(debounced);
  const navigate = useNavigate();
  const listId = useId();
  const wrap = useRef<HTMLDivElement>(null);

  const options: Option[] = useMemo(() => {
    if (!data) return [];
    return [
      ...data.destinations.map((d) => ({ key: `d-${d.slug}`, label: d.name, sub: `${d.region}, ${d.country.name}`, to: `/destinations/${d.slug}`, icon: d.country.flag })),
      ...data.countries.map((c) => ({ key: `c-${c.code}`, label: c.name, sub: `${c.destinationCount} destination${c.destinationCount > 1 ? 's' : ''}`, to: `/discover?q=${encodeURIComponent(c.name)}`, icon: c.flag })),
      ...data.attractions.map((a) => ({ key: `a-${a.id}`, label: a.name, sub: `Sight in ${a.destinationName}`, to: `/destinations/${a.destinationSlug}#sights`, icon: '📍' })),
    ];
  }, [data]);

  useEffect(() => setActive(0), [options.length]);
  useEffect(() => {
    const onDoc = (e: MouseEvent) => !wrap.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const go = (to: string) => {
    setOpen(false);
    setQ('');
    navigate(to);
  };

  const showPanel = open && debounced.trim().length >= 2;

  return (
    <div ref={wrap} className={`relative ${className}`}>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          const pick = options[active];
          if (pick) go(pick.to);
          else if (q.trim()) go(`/discover?q=${encodeURIComponent(q.trim())}`);
        }}
      >
        <svg className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" viewBox="0 0 20 20" fill="none" aria-hidden>
          <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.8" />
          <path d="m14 14 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => Math.min(i + 1, options.length - 1)); }
            if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)); }
            if (e.key === 'Escape') setOpen(false);
          }}
          placeholder={placeholder}
          aria-label="Search"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={listId}
          aria-autocomplete="list"
          className="h-10 w-full rounded-full border border-line bg-sand/60 pl-10 pr-4 text-sm outline-none transition placeholder:text-muted focus:border-pine-200 focus:bg-white focus:ring-4 focus:ring-pine-100"
        />
      </form>
      {showPanel && (
        <div className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-2xl border border-line bg-white shadow-[var(--shadow-lift)]">
          <ul id={listId} role="listbox" className="max-h-96 overflow-auto py-2">
            {options.map((o, i) => (
              <li key={o.key} role="option" aria-selected={i === active}>
                <button
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onClick={() => go(o.to)}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 text-left ${i === active ? 'bg-pine-50' : ''}`}
                >
                  <span className="text-lg" aria-hidden>{o.icon}</span>
                  <span>
                    <span className="block text-sm font-medium">{o.label}</span>
                    <span className="block text-xs text-muted">{o.sub}</span>
                  </span>
                </button>
              </li>
            ))}
            {!isFetching && options.length === 0 && (
              <li className="px-4 py-6 text-center text-sm text-muted">No matches for “{debounced}” yet. Try a city, country or interest like “beach”.</li>
            )}
            {isFetching && options.length === 0 && <li className="px-4 py-6 text-center text-sm text-muted">Searching…</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
