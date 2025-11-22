import Link from 'next/link';

import { EmptyState } from '@/components/common/empty-state';
import { SectionCard } from '@/components/common/section';

import { REWARD_STATUS_LABEL, STATUS_LABEL } from '../constants';
import type { AdminSurveyListItem } from '../hooks/use-admin-survey-list';

const formatDate = (value?: string) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
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
          <li key={item.id} className="space-y-2 px-2 py-3">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <Link
                href={`/admin/surveys/${item.id}`}
                className="text-base font-semibold text-slate-900 hover:text-pink-600"
              >
                {item.branchName ? `${item.storeName}（${item.branchName}）` : item.storeName}
              </Link>
              <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                <span className="rounded-full bg-slate-100 px-3 py-1 font-medium">
                  {STATUS_LABEL[item.status] ?? item.status}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 font-medium">
                  報酬: {REWARD_STATUS_LABEL[item.rewardStatus] ?? item.rewardStatus}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-slate-500">
              <span>{item.prefecture}</span>
              <span>投稿: {formatDate(item.createdAt)}</span>
              <span>評価: {item.rating.toFixed(1)} / 5</span>
              {item.surveyerHandle ? <span>@{item.surveyerHandle}</span> : null}
            </div>
          </li>
        ))}
      </ul>
    )}
  </SectionCard>
);
