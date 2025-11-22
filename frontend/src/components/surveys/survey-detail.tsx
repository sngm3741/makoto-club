import type { SurveyDetail } from '@/types/survey';
import { formatDateTime } from '@/utils/date';

type SurveyDetailProps = {
  survey: SurveyDetail;
};

export const SurveyDetailContent = ({ survey }: SurveyDetailProps) => {
  return (
    <article className="space-y-6 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
      <header className="space-y-2">
        <span className="inline-block rounded-full bg-pink-50 px-3 py-1 text-xs font-semibold text-pink-600">
          {survey.storePrefecture} / {survey.storeIndustry}
        </span>
        <h1 className="text-2xl font-semibold text-slate-900">
          {survey.storeName}
          {survey.storeBranch ? (
            <span className="ml-2 text-base font-normal text-slate-500">（{survey.storeBranch}）</span>
          ) : null}
        </h1>
        <p className="text-sm text-slate-500">
          訪問時期: {survey.visitedPeriod} / 勤務形態: {survey.workType} / 年齢: {survey.age}歳 / スペック:{' '}
          {survey.specScore}
        </p>
        {survey.storeArea || survey.storeGenre ? (
          <p className="text-xs text-slate-500">
            {survey.storeArea ? `エリア: ${survey.storeArea}` : ''}
            {survey.storeGenre ? ` / ジャンル: ${survey.storeGenre}` : ''}
          </p>
        ) : null}
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <span className="font-semibold text-slate-700">満足度</span>
          <StarDisplay value={survey.rating} />
          <span>{survey.rating.toFixed(1)} / 5</span>
        </div>
      </header>

      <dl className="grid gap-4 rounded-2xl bg-slate-50 p-4 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-slate-500">平均稼ぎ</dt>
          <dd className="text-lg font-semibold text-pink-600">{survey.averageEarning}万円</dd>
        </div>
        <div>
          <dt className="text-slate-500">待機時間</dt>
          <dd className="text-lg font-semibold text-slate-800">{survey.waitTimeHours}時間</dd>
        </div>
        {typeof survey.helpfulCount === 'number' ? (
          <div>
            <dt className="text-slate-500">役に立った</dt>
            <dd className="text-lg font-semibold text-violet-600">
              {survey.helpfulCount}人が役立ったと回答
            </dd>
          </div>
        ) : null}
      </dl>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">アンケート本文</h2>
        {renderCommentSection('客層', survey.customerComment)}
        {renderCommentSection('スタッフ対応', survey.staffComment)}
        {renderCommentSection('待機環境・職場の雰囲気', survey.workEnvironmentComment)}
        {!survey.customerComment && !survey.staffComment && !survey.workEnvironmentComment && (
          <p className="text-sm text-slate-500">
            詳細な本文はこれから順次掲載します。更新をお待ちください。
          </p>
        )}
      </section>

      <footer className="flex flex-col gap-1 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <p>投稿日: {formatDateTime(survey.createdAt)}</p>
        {survey.emailAddress ? <p>連絡先: {survey.emailAddress}</p> : null}
      </footer>
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

const renderCommentSection = (title: string, body?: string) => {
  if (!body) return null;
  return (
    <div className="rounded-2xl bg-white/60 p-4 shadow-inner">
      <p className="text-xs font-semibold text-slate-500">{title}</p>
      <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{body}</p>
    </div>
  );
};
