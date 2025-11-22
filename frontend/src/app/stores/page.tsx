import { Pagination } from '@/components/common/pagination';
import { StoreFilterPanel } from '@/features/stores/components/store-filter-panel';
import { StoreHero } from '@/features/stores/components/store-hero';
import { StoreListSection } from '@/features/stores/components/store-list-section';
import { StoreSortBar } from '@/features/stores/components/store-sort-bar';
import { fetchStores } from '@/lib/stores';

type StoresSearchParams = {
  prefecture?: string;
  area?: string;
  industry?: string;
  genre?: string;
  page?: string;
  sort?: string;
};

const SORT_OPTIONS = [
  { value: undefined, label: '新着順' },
  { value: 'helpful', label: '役に立った順' },
  { value: 'earning', label: '平均稼ぎが高い順' },
] as const;

export default async function StoresPage({
  searchParams,
}: {
  searchParams: Promise<StoresSearchParams>;
}) {
  const resolved = await searchParams;

  const page = parseNumber(resolved.page) || 1;
  const { items, total, limit } = await fetchStores({
    prefecture: resolved.prefecture,
    area: resolved.area,
    industry: resolved.industry,
    genre: resolved.genre,
    sort: resolved.sort,
    page,
  });

  return (
    <div className="space-y-8 pb-12">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <StoreHero />
        <StoreFilterPanel
          initialPrefecture={resolved.prefecture}
          initialIndustry={resolved.industry}
        />
      </div>

      <StoreSortBar options={SORT_OPTIONS} searchParams={resolved} />

      <StoreListSection stores={items} />

      <Pagination
        currentPage={page}
        totalItems={total}
        pageSize={limit}
        basePath="/stores"
        searchParams={{
          prefecture: resolved.prefecture,
          area: resolved.area,
          industry: resolved.industry,
          genre: resolved.genre,
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
