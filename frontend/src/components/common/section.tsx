import Link from 'next/link';
import type { ReactNode } from 'react';

import { cn } from '@/utils/cn';

type SectionCardProps = {
  children: ReactNode;
  className?: string;
  padding?: 'md' | 'lg';
  withBorder?: boolean;
};

export const SectionCard = ({
  children,
  className,
  padding = 'md',
  withBorder = true,
}: SectionCardProps) => (
  <section
    className={cn(
      'space-y-4 rounded-3xl bg-white shadow-sm',
      padding === 'lg' ? 'p-8' : 'p-6',
      withBorder && 'border border-slate-100',
      className,
    )}
  >
    {children}
  </section>
);

type SectionHeaderProps = {
  title: string;
  description?: string;
  badge?: string;
  size?: 'sm' | 'md' | 'lg';
  align?: 'left' | 'center';
};

export const SectionHeader = ({
  title,
  description,
  badge,
  size = 'md',
  align = 'left',
}: SectionHeaderProps) => (
  <div className={cn('space-y-1', align === 'center' && 'text-center')}>
    {badge && (
      <p className="inline-flex rounded-full bg-pink-50 px-3 py-1 text-xs font-semibold text-pink-600">
        {badge}
      </p>
    )}
    <h2
      className={cn(
        'font-semibold text-slate-900',
        size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-base' : 'text-lg',
      )}
    >
      {title}
    </h2>
    {description && (
      <p className="text-xs text-slate-500">{description}</p>
    )}
  </div>
);

type SectionPillTitleProps = {
  label: string;
  description?: string;
  align?: 'left' | 'center';
  linkHref?: string;
};

export const SectionPillTitle = ({ label, description, align = 'center', linkHref }: SectionPillTitleProps) => (
  <div className={cn('space-y-2', align === 'center' && 'text-center')}>
    <div className="flex w-full items-center gap-3">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-pink-200/70 to-transparent" />
      {linkHref ? (
        <Link
          href={linkHref}
          className="rounded-full bg-pink-50 px-3 py-2 text-ms font-semibold tracking-wide text-pink-600 ring-1 ring-pink-100 transition hover:text-pink-700"
        >
          {label}
        </Link>
      ) : (
        <span className="rounded-full bg-pink-50 px-3 py-2 text-ms font-semibold tracking-wide text-pink-600 ring-1 ring-pink-100">
          {label}
        </span>
      )}
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-pink-200/70 to-transparent" />
    </div>
    {description && <p className="text-xs text-slate-500">{description}</p>}
  </div>
);

type HeroCardProps = {
  badge?: string;
  title: string;
  description: string;
  children?: ReactNode;
  tone?: 'pink' | 'slate';
  className?: string;
};

export const HeroCard = ({
  badge,
  title,
  description,
  children,
  tone = 'pink',
  className,
}: HeroCardProps) => {
  const gradient =
    tone === 'pink' ? 'from-white via-pink-50 to-white' : 'from-white to-slate-50';
  const badgeStyle =
    tone === 'pink' ? 'bg-pink-50 text-pink-600' : 'bg-slate-100 text-slate-700';

  return (
    <section
      className={cn(
        'space-y-4 rounded-3xl bg-gradient-to-br p-6 shadow-sm',
        `bg-gradient-to-br ${gradient}`,
        className,
      )}
    >
      {badge && (
        <p className={cn('inline-flex rounded-full px-3 py-1 text-xs font-semibold', badgeStyle)}>
          {badge}
        </p>
      )}
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        <p className="text-sm text-slate-600">{description}</p>
      </div>
      {children}
    </section>
  );
};
