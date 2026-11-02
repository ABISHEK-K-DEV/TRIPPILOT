import { ButtonLink } from '../components/ui/Button';

export function NotFoundPage({ what = 'page' }: { what?: string }) {
  return (
    <div className="container-page grid min-h-[60vh] place-items-center text-center">
      <div>
        <div className="display text-7xl text-pine-200">404</div>
        <h1 className="display mt-4 text-3xl">We couldn’t find that {what}</h1>
        <p className="mt-2 text-muted">It may have moved, or the link might be incomplete.</p>
        <div className="mt-6 flex justify-center gap-3">
          <ButtonLink to="/">Go home</ButtonLink>
          <ButtonLink to="/discover" variant="secondary">Explore destinations</ButtonLink>
        </div>
      </div>
    </div>
  );
}
