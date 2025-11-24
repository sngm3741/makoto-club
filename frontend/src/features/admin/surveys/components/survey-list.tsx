import Link from 'next/link';

import { EmptyState } from '@/components/common/empty-state';
import { SectionCard } from '@/components/common/section';
import type { AdminSurveyListItem } from '../hooks/use-admin-survey-search';

const formatDate = (value?: string) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('ja-JP', { timeZone: 'Asia/Tokyo' });
};

type SurveyListProps = {
  surveys: AdminSurveyListItem[];
  loading: boolean;
};

export const SurveyList = ({ surveys, loading }: SurveyListProps) => (
  <SectionCard>
    {surveys.length === 0 && !loading ? (
      <EmptyState title="該当するアンケートはありません" />
    ) : (
      <ul className="divide-y divide-slate-100 text-sm">
        {surveys.map((item) => (
          <li key={item.id} className="space-y-3 px-2 py-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Link
                  href={`/admin/surveys/${item.id}`}
                  className="text-base font-semibold text-slate-900 hover:text-pink-600"
                >
                  {item.branchName ? `${item.storeName}（${item.branchName}）` : item.storeName}
                </Link>
                <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-500">
                  <span className="rounded-full bg-slate-100 px-2 py-1">{item.prefecture}</span>
                  <span className="rounded-full bg-slate-100 px-2 py-1">{item.industry}</span>
                  <span className="rounded-full bg-slate-100 px-2 py-1">
                    働いた時期: {item.visitedPeriod || '-'}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-1">
                    評価: {item.rating.toFixed(1)} / 5
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span>投稿: {formatDate(item.createdAt)}</span>
                {item.emailAddress ? <span>連絡先: {item.emailAddress}</span> : null}
                <Link href={`/surveys/${item.id}`} className="text-pink-600 underline hover:text-pink-500">
                  一般ページを開く
                </Link>
              </div>
            </div>
          </li>
        ))}
      </ul>
    )}
  </SectionCard>
);
