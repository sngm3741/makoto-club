import Link from 'next/link';

import { MetricCard, StarDisplay } from '@/components/common/metrics';
import type { SurveyDetail } from '@/types/survey';
import { formatDateTime, formatRelativeVisitedPeriod } from '@/utils/date';

type SurveyDetailProps = {
  survey: SurveyDetail;
};

export const SurveyDetailContent = ({ survey }: SurveyDetailProps) => {
  return (
    <article className="space-y-6 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-pink-600">
          <Link
            href={`/stores?prefecture=${encodeURIComponent(survey.storePrefecture)}`}
            className="rounded-full bg-pink-50 px-3 py-1 hover:bg-pink-100"
          >
            {survey.storePrefecture}
          </Link>
          <Link
            href={`/stores?industry=${encodeURIComponent(survey.storeIndustry)}`}
            className="rounded-full bg-pink-50 px-3 py-1 hover:bg-pink-100"
          >
            {survey.storeIndustry}
          </Link>
        </div>
        <h1 className="text-2xl font-semibold text-slate-900">
          <Link
            href={`/stores/${survey.storeId}`}
            className="underline decoration-pink-200/60 underline-offset-4 hover:text-pink-600 hover:decoration-pink-500"
          >
            {survey.storeName}
          </Link>
          {survey.storeBranch ? (
            <span className="ml-2 text-base font-normal text-slate-500">（{survey.storeBranch}）</span>
          ) : null}
        </h1>
        <p className="flex flex-wrap items-center gap-1 text-sm text-slate-500">
          <span>{formatRelativeVisitedPeriod(survey.visitedPeriod)}</span>
          <span>/</span>
          <Link
            href={`/surveys?workType=${encodeURIComponent(survey.workType)}`}
            className="font-semibold text-slate-600 underline-offset-2 hover:text-pink-600 hover:underline"
          >
            {survey.workType}
          </Link>
          <span>/ {survey.age}歳 / スペ{survey.specScore}</span>
        </p>
        {survey.storeArea || survey.storeGenre ? (
          <p className="text-xs text-slate-500">
            {survey.storeArea ? `エリア: ${survey.storeArea}` : ''}
            {survey.storeGenre ? ` / ジャンル: ${survey.storeGenre}` : ''}
          </p>
        ) : null}
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl bg-slate-50 px-4 py-3 shadow-inner">
          <p className="text-xs font-semibold text-slate-500">満足度</p>
          <div className="mt-2 flex items-center gap-2">
            <StarDisplay value={survey.rating} size="lg" />
            <span className="text-2xl font-semibold text-slate-900">{survey.rating.toFixed(1)} / 5</span>
          </div>
        </div>
        <MetricCard label="平均稼ぎ" value={`${survey.averageEarning}万円`} tone="pink" />
        <MetricCard label="平均待機時間" value={`${survey.waitTimeHours}時間`} />
        {typeof survey.helpfulCount === 'number' ? (
          <MetricCard label="役に立った" value={`${survey.helpfulCount}人`} tone="violet" />
        ) : null}
      </div>

      <section className="space-y-4">
        {renderCommentSection('客層', survey.customerComment)}
        {renderCommentSection('スタッフ対応', survey.staffComment)}
        {renderCommentSection('待機環境・職場の雰囲気', survey.workEnvironmentComment)}
        {!survey.customerComment && !survey.staffComment && !survey.workEnvironmentComment && (
          <p className="text-sm text-slate-500">
            詳細な本文はこれから順次掲載します。更新をお待ちください。
          </p>
        )}
      </section>

      {survey.imageUrls && survey.imageUrls.length > 0 ? (
        <section className="space-y-3">
          <div className="flex items-baseline justify-between">
          </div>
          <div className="hide-scrollbar rounded-2xl border border-slate-100 bg-white/70 p-4 shadow-inner">
            <div className="flex gap-4 overflow-x-auto scroll-smooth">
              {survey.imageUrls.map((url, index) => (
                <figure
                  key={`${url}-${index}`}
                  className="group relative aspect-[4/3] min-w-[260px] max-w-md flex-1 snap-center overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white shadow-sm ring-1 ring-white/60 transition hover:-translate-y-1 hover:shadow-md"
                >
                  <img src={url} alt={`アンケート写真 ${index + 1}`} className="h-full w-full object-cover" loading="lazy" />
                  <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-3 py-2 text-xs text-white opacity-90">
                    {survey.storeName} の投稿写真 #{index + 1}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <footer className="flex flex-col gap-1 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <p>投稿日: {formatDateTime(survey.createdAt)}</p>
        {survey.emailAddress ? <p>連絡先: {survey.emailAddress}</p> : null}
      </footer>
    </article>
  );
};

const renderCommentSection = (title: string, body?: string) => {
  if (!body) return null;
  return (
    <div className="rounded-2xl bg-white/60 p-4 shadow-inner">
      <p className="text-xs font-semibold text-slate-500">{title}</p>
      <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{body}</p>
    </div>
  );
};
