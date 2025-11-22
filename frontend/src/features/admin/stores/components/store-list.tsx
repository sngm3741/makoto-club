import Link from 'next/link';

import { EmptyState } from '@/components/common/empty-state';
import { SectionCard } from '@/components/common/section';
import type { AdminStoreRecord } from '@/types/admin-store';

const formatDate = (value?: string) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
};

type StoreListProps = {
  stores: AdminStoreRecord[];
  loading: boolean;
};

export const StoreList = ({ stores, loading }: StoreListProps) => (
  <SectionCard>
    {stores.length === 0 && !loading ? (
      <EmptyState title="条件に一致する店舗がありません" />
    ) : (
      <ul className="divide-y divide-slate-100 text-sm">
        {stores.map((store) => (
          <li key={store.id} className="space-y-2 px-2 py-3">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Link
                  href={`/admin/stores/${store.id}`}
                  className="text-base font-semibold text-pink-600 hover:text-pink-500"
                >
                  {store.name}
                  {store.branchName ? (
                    <span className="text-sm font-normal text-slate-500">（{store.branchName}）</span>
                  ) : null}
                </Link>
                <p className="text-xs text-slate-500">
                  {store.prefecture}
                  {store.area ? ` / ${store.area}` : ''}
                  {' / '}
                  {store.industry}
                  {store.genre ? ` / ${store.genre}` : ''}
                </p>
              </div>
              <Link
                href={`/admin/surveys/new?storeId=${store.id}`}
                className="rounded-full bg-pink-50 px-3 py-1 text-xs font-semibold text-pink-600 hover:bg-pink-100"
              >
                アンケートを追加
              </Link>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-slate-500">
              <span>平均評価: {store.averageRating.toFixed(1)}</span>
              <span>作成: {formatDate(store.createdAt)}</span>
              <span>更新: {formatDate(store.updatedAt)}</span>
            </div>
          </li>
        ))}
      </ul>
    )}
  </SectionCard>
);
