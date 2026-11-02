import type { ButtonHTMLAttributes } from 'react';

export function Chip({ active, className = '', ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={`inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 text-sm font-medium transition ${
        active ? 'border-pine-700 bg-pine-700 text-white' : 'border-line bg-white text-ink-soft hover:border-pine-200 hover:text-ink'
      } ${className}`}
      {...rest}
    />
  );
}
