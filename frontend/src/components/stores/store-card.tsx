'use client';

import Link from 'next/link';
import { KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';

import type { StoreSummary } from '@/types/survey';

type StoreCardProps = {
  store: StoreSummary;
};

export const StoreCard = ({ store }: StoreCardProps) => {
  const router = useRouter();
	const surveyCount = store.surveyCount ?? store.reviewCount ?? 0;
	const hasSurveys = surveyCount > 0;
  const averageDisplay = hasSurveys
    ? store.averageEarningLabel && store.averageEarningLabel !== '-'
      ? store.averageEarningLabel
      : `${store.averageEarning}万円`
    : '-';
  const waitDisplay = hasSurveys
    ? store.waitTimeLabel && store.waitTimeLabel !== '-'
      ? store.waitTimeLabel
      : `${store.waitTimeHours}時間`
    : '-';
  const ratingDisplay = store.averageRating.toFixed(1);

  const handleNavigateDetail = () => {
    router.push(`/stores/${encodeURIComponent(store.id)}`);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleNavigateDetail();
    }
  };

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={handleNavigateDetail}
      onKeyDown={handleKeyDown}
      className="flex cursor-pointer flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-pink-300"
      aria-label={`${store.storeName}${store.branchName ? `（${store.branchName}）` : ''}の店舗詳細`}
    >
      <div className="flex items-center justify-between text-xs text-slate-500">
        <Link
          href={`/stores?prefecture=${encodeURIComponent(store.prefecture)}`}
          className="rounded-full bg-pink-50 px-3 py-1 text-pink-600 hover:bg-pink-100"
          onClick={(event) => event.stopPropagation()}
        >
          {store.prefecture}
        </Link>
        <Link
          href={`/stores?industry=${encodeURIComponent(store.category)}`}
          className="font-semibold text-slate-500 hover:text-pink-600"
          onClick={(event) => event.stopPropagation()}
        >
          {translateCategory(store.category)}
        </Link>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-slate-900">
          {store.storeName}
          {store.branchName ? <span className="ml-2 text-sm font-normal text-slate-500">（{store.branchName}）</span> : null}
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          アンケート件数: <strong className="font-semibold text-slate-700">{surveyCount}</strong>
        </p>
        <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
          <StarDisplay value={store.averageRating} />
          <span>{ratingDisplay} / 5</span>
        </div>
      </div>
      <dl className="grid grid-cols-2 gap-3 text-xs text-slate-500">
        <div className="rounded-xl bg-slate-50 p-3">
          <dt className="font-medium text-slate-700">平均稼ぎ</dt>
          <dd className="mt-1 text-lg font-semibold text-pink-600">
            {averageDisplay}
          </dd>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <dt className="font-medium text-slate-700">平均待機時間</dt>
          <dd className="mt-1 text-lg font-semibold text-slate-800">
            {waitDisplay}
          </dd>
        </div>
      </dl>
    </article>
  );
};

const CATEGORY_LABEL_MAP: Record<string, string> = {
  deriheru: 'デリヘル',
  hoteheru: 'ホテヘル',
  hakoheru: '箱ヘル',
  sopu: 'ソープ',
  dc: 'DC',
  huesu: '風エス',
  menesu: 'メンエス',
};

export const translateCategory = (category: string) =>
  CATEGORY_LABEL_MAP[category] ?? category;

const StarDisplay = ({ value }: { value: number }) => {
  const clamped = Math.max(0, Math.min(5, value));
  return (
    <span className="relative inline-block text-base leading-none">
      <span className="text-slate-300">★★★★★</span>
      <span
        className="absolute left-0 top-0 overflow-hidden text-yellow-400"
        style={{ width: `${(clamped / 5) * 100}%` }}
      >
        ★★★★★
      </span>
    </span>
  );
};
