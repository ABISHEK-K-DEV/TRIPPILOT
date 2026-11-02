import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Logo } from '../Logo';
import { SearchBox } from '../SearchBox';
import { ButtonLink } from '../ui/Button';
import { useAuthMutations, useMe } from '../../lib/queries';

const nav = [
  { to: '/discover', label: 'Discover' },
  { to: '/plan', label: 'Plan a trip' },
  { to: '/trips', label: 'My trips' },
];

function UserMenu() {
  const { data: me, isLoading } = useMe();
  const { logout } = useAuthMutations();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  if (isLoading) return <div className="h-9 w-20 animate-pulse rounded-full bg-sand" />;
  if (!me)
    return (
      <div className="flex items-center gap-1">
        <ButtonLink to="/login" variant="ghost" size="sm">Sign in</ButtonLink>
        <span className="hidden sm:block"><ButtonLink to="/register" size="sm">Get started</ButtonLink></span>
      </div>
    );
  const initials = me.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-haspopup="menu" className="grid size-9 place-items-center rounded-full bg-pine-100 text-sm font-semibold text-pine-700 ring-2 ring-white transition hover:ring-pine-200">
        {initials}
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-11 z-50 w-56 overflow-hidden rounded-2xl border border-line bg-white py-2 shadow-[var(--shadow-lift)]" onMouseLeave={() => setOpen(false)}>
          <div className="border-b border-line px-4 pb-2.5 pt-1">
            <div className="text-sm font-semibold">{me.name}</div>
            <div className="truncate text-xs text-muted">{me.email}</div>
          </div>
          <button role="menuitem" className="block w-full px-4 py-2 text-left text-sm hover:bg-sand" onClick={() => { setOpen(false); navigate('/trips'); }}>My trips</button>
          <button role="menuitem" className="block w-full px-4 py-2 text-left text-sm hover:bg-sand" onClick={() => logout.mutate(undefined, { onSuccess: () => { setOpen(false); navigate('/'); } })}>Sign out</button>
        </div>
      )}
    </div>
  );
}

export function Layout() {
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    setMobileOpen(false);
    window.scrollTo({ top: 0 });
  }, [pathname]);
  const isHome = pathname === '/';

  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-white focus:px-4 focus:py-2">Skip to content</a>
      <header className="sticky top-0 z-40 border-b border-line/80 bg-paper/85 backdrop-blur-xl">
        <div className="container-page flex h-16 items-center gap-3 sm:gap-6">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            {nav.map((n) => (
              <NavLink key={n.to} to={n.to} className={({ isActive }) => `rounded-full px-3.5 py-2 text-sm font-medium transition ${isActive ? 'bg-pine-50 text-pine-700' : 'text-ink-soft hover:text-ink'}`}>
                {n.label}
              </NavLink>
            ))}
          </nav>
          {!isHome && <SearchBox className="ml-auto hidden w-72 lg:block" />}
          <div className={`flex items-center gap-2 ${isHome ? 'ml-auto' : 'ml-auto lg:ml-0'}`}>
            <UserMenu />
            <button className="grid size-9 place-items-center rounded-full hover:bg-sand md:hidden" aria-label="Menu" aria-expanded={mobileOpen} onClick={() => setMobileOpen((o) => !o)}>
              <svg viewBox="0 0 20 20" className="size-5" aria-hidden><path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
            </button>
          </div>
        </div>
        {mobileOpen && (
          <div className="border-t border-line bg-paper md:hidden">
            <div className="container-page space-y-3 py-4">
              <SearchBox />
              <nav className="grid gap-1" aria-label="Mobile">
                {nav.map((n) => (
                  <NavLink key={n.to} to={n.to} className="rounded-xl px-3 py-2.5 font-medium hover:bg-sand">{n.label}</NavLink>
                ))}
              </nav>
            </div>
          </div>
        )}
      </header>
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-sand/50">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1.4fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-muted">Plan better trips, understand the real cost of travelling and decide with confidence.</p>
        </div>
        <div>
          <div className="text-sm font-semibold">Product</div>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li><NavLink to="/discover" className="hover:text-ink">Discover</NavLink></li>
            <li><NavLink to="/plan" className="hover:text-ink">Trip planner</NavLink></li>
            <li><NavLink to="/trips" className="hover:text-ink">My trips</NavLink></li>
          </ul>
        </div>
        <div>
          <div className="text-sm font-semibold">Coming soon</div>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>AI travel assistant</li><li>Live flight & hotel comparison</li><li>Group trips & split expenses</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-line bg-white p-5">
          <div className="text-sm font-semibold">Our pricing promise</div>
          <p className="mt-2 text-sm text-muted">
            We label every price as <b className="text-pine-700">verified</b>, <b className="text-amber-ink">estimate</b> or <b className="text-violet-ink">sample</b>. Sponsored results are always marked and never change organic rankings. Nothing is “booked” until a provider confirms it.
          </p>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-muted sm:flex-row sm:justify-between">
          <span>© {new Date().getFullYear()} TripPilot. Milestone 1 preview — uses sample data.</span>
          <span>Made for travellers in India 🇮🇳 · going global</span>
        </div>
      </div>
    </footer>
  );
}
