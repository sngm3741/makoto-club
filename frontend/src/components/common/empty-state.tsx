import type { ReactNode } from 'react';

import { cn } from '@/utils/cn';

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export const EmptyState = ({ title, description, action, className }: EmptyStateProps) => (
  <section
    className={cn(
      'rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center shadow-sm',
      className,
    )}
  >
    <div className="space-y-2">
      <p className="text-sm font-semibold text-slate-800">{title}</p>
      {description && <p className="text-xs text-slate-500">{description}</p>}
    </div>
    {action && <div className="mt-4">{action}</div>}
  </section>
);
