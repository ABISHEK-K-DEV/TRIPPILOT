import type { ReactNode } from 'react';
import { ApiRequestError } from '../../lib/api';
import { Button } from './Button';

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-sand-deep/70 ${className}`} />;
}

export function EmptyState({ title, body, action, icon = '🧭' }: { title: string; body?: ReactNode; action?: ReactNode; icon?: string }) {
  return (
    <div className="card flex flex-col items-center px-6 py-14 text-center">
      <div className="mb-4 grid size-14 place-items-center rounded-full bg-sand text-2xl" aria-hidden>{icon}</div>
      <h3 className="display text-xl">{title}</h3>
      {body && <p className="mt-2 max-w-md text-[15px] text-muted">{body}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function ErrorState({ error, onRetry, title = 'Something went wrong' }: { error: unknown; onRetry?: () => void; title?: string }) {
  const message = error instanceof Error ? error.message : 'Unexpected error';
  const isDb = error instanceof ApiRequestError && error.code === 'DATABASE_UNAVAILABLE';
  return (
    <div role="alert" className="card flex flex-col items-center border-coral/30 px-6 py-12 text-center">
      <div className="mb-4 grid size-14 place-items-center rounded-full bg-coral/10 text-2xl" aria-hidden>⚠️</div>
      <h3 className="display text-xl">{title}</h3>
      <p className="mt-2 max-w-md text-[15px] text-muted">{message}</p>
      {isDb && <p className="mt-2 text-sm text-muted">Is PostgreSQL running? See README → “Run locally”.</p>}
      {onRetry && (
        <Button variant="secondary" className="mt-6" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
