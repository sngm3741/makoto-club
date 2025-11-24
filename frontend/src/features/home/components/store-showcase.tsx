import Link from 'next/link';

import { SectionPillTitle } from '@/components/common/section';
import { StoreCard } from '@/components/stores/store-card';
import type { StoreSummary } from '@/types/survey';

type StoreShowcaseProps = {
  title: string;
  linkHref: string;
  linkLabel?: string;
  stores: StoreSummary[];
};

export const StoreShowcase = ({ title, linkHref, linkLabel = 'もっと見る', stores }: StoreShowcaseProps) => {
  return (
    <section className="space-y-4">
      <SectionPillTitle label={title} linkHref={linkHref} />
      <div className="grid gap-4 md:grid-cols-3">
        {stores.map((store) => (
          <StoreCard key={store.id} store={store} />
        ))}
      </div>
      <div className="space-y-2">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
        <div className="flex justify-center">
        <Link
          href={linkHref}
          className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold text-pink-500 transition hover:text-pink-600"
        >
          {linkLabel}
        </Link>
        </div>
      </div>
    </section>
  );
};
