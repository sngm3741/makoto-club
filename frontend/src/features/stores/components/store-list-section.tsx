import { EmptyState } from '@/components/common/empty-state';
import { StoreCard } from '@/components/stores/store-card';
import type { StoreSummary } from '@/types/survey';

type StoreListSectionProps = {
  stores: StoreSummary[];
};

export const StoreListSection = ({ stores }: StoreListSectionProps) => {
  if (stores.length === 0) {
    return (
      <EmptyState
        title="該当する店舗がありません"
        description="条件を緩めるか、別エリアを試してみてください。"
      />
    );
  }

  return (
    <section className="grid gap-4 md:grid-cols-2">
      {stores.map((store) => (
        <StoreCard key={store.id} store={store} />
      ))}
    </section>
  );
};
