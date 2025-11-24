import Link from 'next/link';
import type { StoreDetail, SurveySummary } from '@/types/survey';
import { SectionCard, SectionPillTitle } from '@/components/common/section';
import { MetricCard, StarDisplay } from '@/components/common/metrics';
import { StoreSurveyList } from './store-survey-list';
import { formatDateTime } from '@/utils/date';
import { StorePhotoGallery } from './store-photo-gallery';

type StoreDetailProps = {
  store: StoreDetail;
};

export function StoreDetailContent({ store }: StoreDetailProps) {
  const galleryImages = collectGalleryImages(store);

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <SectionPillTitle label="店舗情報" />
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
            <p className="text-sm text-slate-500 flex flex-wrap items-center gap-2">
              <span>
                
                <Link
                  href={`/stores?industry=${encodeURIComponent(store.category)}`}
                  className="font-semibold text-slate-600 underline-offset-2 hover:text-pink-600 hover:underline"
                >
                  {store.category}
                </Link>
              </span>
              {store.genre ? (
                <span>
                  / {' '}
                  <Link
                    href={`/stores?genre=${encodeURIComponent(store.genre)}`}
                    className="font-semibold text-slate-600 underline-offset-2 hover:text-pink-600 hover:underline"
                  >
                    {store.genre}
                  </Link>
                </span>
              ) : null}
              {store.unitPrice !== undefined && store.unitPrice !== null ? (
                <span className="text-slate-600">
                  / 単価(60分): <span className="font-semibold text-pink-600">{store.unitPrice.toLocaleString()}円</span>
                </span>
              ) : null}
            </p>
            {store.businessHours ? (
              <p className="text-xs text-slate-500">
                営業時間: {store.businessHours.open} - {store.businessHours.close}
              </p>
            ) : null}
          </header>
          <div className="mt-4 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 px-4 py-3 shadow-inner">
                <p className="text-xs font-semibold text-slate-500">平均評価</p>
                <div className="mt-2 flex items-center gap-2">
                  <StarDisplay value={store.averageRating} size="lg" />
                  <span className="text-2xl font-semibold text-slate-900">{store.averageRating.toFixed(1)} / 5</span>
                </div>
              </div>
              <MetricCard label="平均稼ぎ" value={store.averageEarningLabel ?? '-'} tone="pink" />
              <MetricCard label="平均待機時間" value={store.waitTimeLabel ?? '-'} />
            </div>
            <p className="text-xs text-slate-400">
              最終更新: {store.updatedAt ? formatDateTime(store.updatedAt) : '---'}
            </p>
          </div>
        </SectionCard>
      </section>

      <section className="space-y-3">
        <SectionPillTitle label="アンケート" />
        
          <div className="mt-4">
            <StoreSurveyList surveys={store.surveys} />
          </div>
        
      </section>

      {galleryImages.length > 0 && (
        <section className="space-y-3">
          <SectionPillTitle label="投稿写真" />
          <SectionCard>
            <StorePhotoGallery images={galleryImages} storeName={store.storeName} />
          </SectionCard>
        </section>
      )}
    </div>
  );
}

const collectGalleryImages = (store: StoreDetail) => {
  const seen = new Set<string>();
  const result: Array<{ url: string; surveyId?: string; snippet?: string }> = [];

  const pickSnippet = (survey: SurveySummary) => {
    const candidates = [survey.customerComment, survey.staffComment, survey.workEnvironmentComment];
    const text = candidates.find((v) => v && v.trim().length > 0)?.trim();
    if (!text) return undefined;
    return text.length > 100 ? `${text.slice(0, 100)}...` : text;
  };

  store.surveys.forEach((survey) => {
    survey.imageUrls?.forEach((url) => {
      if (!url) return;
      const key = `${url}|${survey.id}`;
      if (seen.has(key)) return;
      seen.add(key);
      result.push({ url, surveyId: survey.id, snippet: pickSnippet(survey) });
    });
  });
  return result;
};
