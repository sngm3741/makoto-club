import Link from 'next/link';

import type { StoreDetail } from '@/types/survey';
import { SectionCard, SectionHeader } from '@/components/common/section';
import { SurveyCard } from '@/components/surveys/survey-card';
import { formatDateTime } from '@/utils/date';

type StoreDetailProps = {
  store: StoreDetail;
};

export function StoreDetailContent({ store }: StoreDetailProps) {
  return (
    <div className="space-y-6">
      <SectionCard>
        <header className="space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600">
            <Link
              href={`/stores?prefecture=${encodeURIComponent(store.prefecture)}`}
              className="rounded-full bg-pink-50 px-3 py-1 text-pink-600 hover:bg-pink-100"
            >
              {store.prefecture}
            </Link>
            {store.area ? (
              <Link
                href={`/stores?prefecture=${encodeURIComponent(store.prefecture)}&area=${encodeURIComponent(store.area)}`}
                className="rounded-full bg-slate-100 px-3 py-1 hover:bg-pink-50"
              >
                {store.area}
              </Link>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold text-slate-900">{store.storeName}</h1>
            {store.branchName ? <p className="text-base text-slate-500">（{store.branchName}）</p> : null}
          </div>
          <p className="text-sm text-slate-500">
            業種:{' '}
            <Link
              href={`/stores?industry=${encodeURIComponent(store.category)}`}
              className="font-semibold text-slate-600 underline-offset-2 hover:text-pink-600 hover:underline"
            >
              {store.category}
            </Link>
            {store.genre ? (
              <>
                {' '}
                / ジャンル:{' '}
                <Link
                  href={`/stores?genre=${encodeURIComponent(store.genre)}`}
                  className="font-semibold text-slate-600 underline-offset-2 hover:text-pink-600 hover:underline"
                >
                  {store.genre}
                </Link>
              </>
            ) : null}
          </p>
          {store.businessHours ? (
            <p className="text-xs text-slate-500">
              営業時間: {store.businessHours.open} - {store.businessHours.close}
            </p>
          ) : null}
        </header>
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <span className="font-semibold text-slate-700">平均評価</span>
            <StarDisplay value={store.averageRating} />
            <span>{store.averageRating.toFixed(1)} / 5</span>
          </div>
          <dl className="grid gap-4 rounded-2xl bg-slate-50 p-4 text-xs sm:grid-cols-3">
            <div>
              <dt className="text-slate-500">平均稼ぎ</dt>
              <dd className="text-lg font-semibold text-pink-600">{store.averageEarningLabel ?? '-'}</dd>
            </div>
            <div>
              <dt className="text-slate-500">平均待機時間</dt>
              <dd className="text-lg font-semibold text-slate-800">{store.waitTimeLabel ?? '-'}</dd>
            </div>
            <div>
              <dt className="text-slate-500">アンケート件数</dt>
              <dd className="text-lg font-semibold text-slate-800">{store.surveyCount}</dd>
            </div>
          </dl>
          <p className="text-xs text-slate-400">
            最終更新: {store.updatedAt ? formatDateTime(store.updatedAt) : '---'}
          </p>
        </div>
      </SectionCard>

      <SectionCard>
        <SectionHeader title="アンケート一覧" description="直近の投稿から抜粋しています。" size="lg" />
        <div className="mt-4">
          {store.surveys.length === 0 ? (
            <p className="rounded-2xl bg-slate-100 px-4 py-6 text-sm text-slate-500">
              まだアンケートが登録されていません。
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {store.surveys.map((survey) => (
                <SurveyCard key={survey.id} survey={survey} />
              ))}
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  );
}

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
