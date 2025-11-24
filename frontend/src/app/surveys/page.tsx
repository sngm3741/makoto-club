import { Pagination } from '@/components/common/pagination';
import { SurveyFilterPanel } from '@/features/surveys/components/survey-filter-panel';
import { SurveyListSection } from '@/features/surveys/components/survey-list-section';
import { SurveySortBar } from '@/features/surveys/components/survey-sort-bar';
import { fetchSurveys } from '@/lib/surveys';

type SurveysSearchParams = {
  prefecture?: string;
  industry?: string;
  storeId?: string;
  keyword?: string;
  page?: string;
  sort?: string;
};

const SORT_OPTIONS = [
  { value: undefined, label: '新着順' },
  { value: 'helpful', label: '役に立った順' },
  { value: 'earning', label: '平均稼ぎが高い順' },
] as const;

export default async function SurveysPage({
  searchParams,
}: {
  searchParams: Promise<SurveysSearchParams>;
}) {
  const resolved = await searchParams;

  const page = parseNumber(resolved.page) || 1;
  const { items, total, limit } = await fetchSurveys({
    prefecture: resolved.prefecture,
    industry: resolved.industry,
    storeId: resolved.storeId,
    sort: resolved.sort,
    page,
  });

  return (
    <div className="space-y-8 pb-12">
      <SurveyFilterPanel
        initialPrefecture={resolved.prefecture}
        initialIndustry={resolved.industry}
        initialKeyword={resolved.keyword}
      />

      <SurveySortBar options={SORT_OPTIONS} searchParams={resolved} />

      <SurveyListSection surveys={items} />

      <Pagination
        currentPage={page}
        totalItems={total}
        pageSize={limit}
        basePath="/surveys"
        searchParams={{
          prefecture: resolved.prefecture,
          industry: resolved.industry,
          storeId: resolved.storeId,
          sort: resolved.sort,
        }}
      />
    </div>
  );
}

const parseNumber = (value?: string) => {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};
