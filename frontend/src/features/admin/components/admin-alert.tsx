import type { ReactNode } from 'react';

export const AdminAlert = ({
  children,
  tone = 'error',
}: {
  children: ReactNode;
  tone?: 'error' | 'info';
}) => {
  const base = 'rounded-2xl px-4 py-3 text-sm';
  const toneClass =
    tone === 'error'
      ? 'bg-red-50 text-red-700'
      : 'bg-slate-100 text-slate-700';

  return <div className={`${base} ${toneClass}`}>{children}</div>;
};
