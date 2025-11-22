import { notFound } from 'next/navigation';

import { StoreDetailContent } from '@/components/stores/store-detail';
import { fetchStoreDetail } from '@/lib/stores';

type RouteParams = {
  id?: string;
};

type PageProps = {
  params: RouteParams | Promise<RouteParams>;
};

export const dynamic = 'force-dynamic';

export default async function StoreDetailPage({ params }: PageProps) {
  const resolved = params instanceof Promise ? await params : params;
  const id = resolved?.id;
  if (!id) {
    notFound();
  }

  const detail = await fetchStoreDetail(id);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8">
      <StoreDetailContent store={detail} />
    </div>
  );
}
