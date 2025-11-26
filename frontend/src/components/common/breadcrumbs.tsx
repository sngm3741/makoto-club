'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

import { useBreadcrumbOverride } from './breadcrumb-context';

type Crumb = {
  label: string;
  href?: string;
};

const LABEL_MAP: Record<string, string> = {
  '': 'ホーム',
  stores: '店舗一覧',
  surveys: 'アンケート一覧',
  new: '新規作成',
  admin: '管理',
  search: '検索',
  login: 'ログイン',
  reviews: 'レビュー',
};

const isHexId = (segment: string) => /^[0-9a-fA-F]{8,}$/.test(segment);

export const Breadcrumbs = () => {
  const pathname = usePathname();
  const { lastLabel } = useBreadcrumbOverride();

  const crumbs = useMemo<Crumb[]>(() => {
    if (!pathname) return [{ label: 'ホーム', href: '/' }];
    const segments = pathname.split('/').filter(Boolean);
    const items: Crumb[] = [];
    let currentPath = '';

    // ルート
    items.push({ label: 'ホーム', href: '/' });

    segments.forEach((seg, idx) => {
      currentPath += `/${seg}`;
      const isLast = idx === segments.length - 1;
      let label = LABEL_MAP[seg] ?? seg;

      if (isHexId(seg)) {
        const parent = segments[idx - 1] ?? '';
        if (lastLabel) {
          label = lastLabel;
        } else if (parent === 'stores') {
          label = '店舗詳細';
        } else if (parent === 'surveys') {
          label = 'アンケート詳細';
        } else {
          label = '詳細';
        }
      }
      if (seg === 'new') {
        label = '新規作成';
      }

      items.push({
        label,
        href: isLast ? undefined : currentPath,
      });
    });

    return items;
  }, [pathname, lastLabel]);

  if (!crumbs.length) return null;

  return (
    <nav aria-label="パンくずリスト" className="mb-4 overflow-x-auto text-xs text-slate-500">
      <ol className="flex items-center gap-2 whitespace-nowrap">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <li key={`${crumb.href ?? crumb.label}-${index}`} className="flex items-center gap-2">
              {crumb.href && !isLast ? (
                <Link href={crumb.href} className="text-pink-600 hover:text-pink-500">
                  {crumb.label}
                </Link>
              ) : (
                <span className={isLast ? 'font-semibold text-slate-700' : ''}>{crumb.label}</span>
              )}
              {!isLast && <span className="text-slate-400">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
