import Link from 'next/link';
import { notFound } from 'next/navigation';

import { AdminStoreEditor } from '@/components/admin/admin-store-editor';
import { API_BASE_URL } from '@/lib/api-base';
import type { AdminStoreRecord } from '@/types/admin-store';

type RouteParams = {
  id?: string;
};

type PageProps = {
  params: RouteParams | Promise<RouteParams>;
};

async function fetchStoreDetail(id: string): Promise<AdminStoreRecord> {
  const response = await fetch(`${API_BASE_URL}/api/admin/stores/${id}`, {
    cache: 'no-store',
  });
  if (response.status === 404) {
    notFound();
  }
  if (!response.ok) {
    throw new Error('店舗情報の取得に失敗しました');
  }
  return (await response.json()) as AdminStoreRecord;
}

export const dynamic = 'force-dynamic';

export default async function AdminStoreDetailPage({ params }: PageProps) {
  const resolved = params instanceof Promise ? await params : params;
  const id = resolved?.id;
  if (!id) {
    notFound();
  }
  const store = await fetchStoreDetail(id);
  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-slate-900">店舗詳細 / 編集</h1>
        <Link
          href={`/admin/surveys/new?storeId=${encodeURIComponent(id)}`}
          className="rounded-full bg-pink-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-pink-500"
        >
          アンケートを追加
        </Link>
      </div>
      <AdminStoreEditor initialStore={store} />
    </div>
  );
}
