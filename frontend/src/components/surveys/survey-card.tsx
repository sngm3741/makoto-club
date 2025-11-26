'use client';

import Link from 'next/link';
import { KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';

import type { SurveySummary } from '@/types/survey';
import { formatDateTime, formatRelativeVisitedPeriod } from '@/utils/date';

type SurveyCardProps = {
  survey: SurveySummary;
};

const DESCRIPTION_MAX_LENGTH = 200;

const pickDescription = (survey: SurveySummary) => {
  const candidates = [survey.customerComment, survey.staffComment, survey.workEnvironmentComment];
  const text = candidates.find((value) => value && value.trim().length > 0)?.trim();
  if (!text) return '詳しいアンケートは詳細ページでチェック！';
  if (text.length <= DESCRIPTION_MAX_LENGTH) return text;
  return `${text.slice(0, DESCRIPTION_MAX_LENGTH)}...`;
};

export const SurveyCard = ({ survey }: SurveyCardProps) => {
  const router = useRouter();

  const handleNavigateDetail = () => {
    router.push(`/surveys/${survey.id}`);
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
      className="flex cursor-pointer flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-lg transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-pink-300"
      aria-label={`${survey.storeName}のアンケート詳細`}
    >
      <div className="flex items-center justify-between text-xs text-slate-500">
        <Link
          href={`/surveys?prefecture=${encodeURIComponent(survey.storePrefecture)}`}
          className="rounded-full bg-pink-50 px-3 py-1 text-pink-600 hover:bg-pink-100"
          onClick={(event) => event.stopPropagation()}
        >
          {survey.storePrefecture}
        </Link>
        <time dateTime={survey.createdAt}>{formatDateTime(survey.createdAt)}</time>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-slate-900">
          {survey.storeName}
          {survey.storeBranch ? (
            <span className="ml-2 text-sm font-normal text-slate-500">（{survey.storeBranch}）</span>
          ) : null}
        </h3>
        <p className="mt-1 flex flex-wrap items-center gap-1 text-sm text-slate-500">
          {formatRelativeVisitedPeriod(survey.visitedPeriod)} / {' '}
          <Link
            href={`/stores?industry=${encodeURIComponent(survey.storeIndustry)}`}
            className="font-semibold text-slate-500 hover:text-pink-600"
            onClick={(event) => event.stopPropagation()}
          >
            {survey.storeIndustry}
          </Link>
        </p>
        <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
          <StarDisplay value={survey.rating} />
          <span>{survey.rating.toFixed(1)} / 5</span>
        </div>
      </div>
      <p className="text-sm text-slate-600">{pickDescription(survey)}</p>
      <dl className="grid grid-cols-2 gap-3 text-xs text-slate-500">
        <div className="rounded-xl bg-slate-50 p-3">
          <dt className="font-medium text-slate-700">平均稼ぎ</dt>
          <dd className="mt-1 text-lg font-semibold text-pink-600">{survey.averageEarning}万円</dd>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <dt className="font-medium text-slate-700">平均待機時間</dt>
          <dd className="mt-1 text-lg font-semibold text-slate-800">{survey.waitTimeHours}時間</dd>
        </div>
      </dl>
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>年齢: {survey.age}歳 / スペック: {survey.specScore}</span>
        {typeof survey.helpfulCount === 'number' && (
          <span className="rounded-full bg-violet-50 px-3 py-1 text-violet-600">
            役に立った {survey.helpfulCount}
          </span>
        )}
      </div>
    </article>
  );
};

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
