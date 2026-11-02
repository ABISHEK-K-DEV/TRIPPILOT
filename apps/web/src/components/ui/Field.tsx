import type { ReactNode } from 'react';

export function Field({ label, htmlFor, error, hint, children, className = '' }: { label: string; htmlFor?: string; error?: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-[13px] font-semibold text-ink-soft">
        {label}
      </label>
      {children}
      {error ? (
        <p className="mt-1.5 text-[13px] text-coral" role="alert">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-[13px] text-muted">{hint}</p>
      ) : null}
    </div>
  );
}
