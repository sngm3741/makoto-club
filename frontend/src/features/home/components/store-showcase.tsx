import Link from 'next/link';

import { StoreCard } from '@/components/stores/store-card';
import type { StoreSummary } from '@/types/survey';

type StoreShowcaseProps = {
  title: string;
  linkHref: string;
  linkLabel?: string;
  stores: StoreSummary[];
};

export const StoreShowcase = ({ title, linkHref, linkLabel = 'もっと見る →', stores }: StoreShowcaseProps) => {
  return (
    <section className="space-y-6">
      <div className="flex items-baseline justify-between">
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
        <Link href={linkHref} className="text-sm font-semibold text-pink-600 hover:text-pink-500">
          {linkLabel}
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {stores.map((store) => (
          <StoreCard key={store.id} store={store} />
        ))}
      </div>
    </section>
  );
};
