'use client';

import Link from 'next/link';

import { AdminAlert } from '@/features/admin/components/admin-alert';
import { AdminPageHeader } from '@/features/admin/components/admin-page-header';
import { AdminPagination } from '@/features/admin/components/admin-pagination';

import { StoreFilterPanel } from './store-filter-panel';
import { StoreList } from './store-list';
import { useAdminStoreSearch } from '../hooks/use-admin-store-search';

export const AdminStoreDashboard = () => {
  const {
    stores,
    total,
    page,
    totalPages,
    loading,
    error,
    filters,
    setPrefecture,
    setIndustry,
    setKeyword,
    reload,
    nextPage,
    prevPage,
  } = useAdminStoreSearch();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="店舗管理"
        description="条件で絞り込み、詳細ページから編集・削除を行ってください。"
        action={
          <Link
            href="/admin/stores/new"
            className="rounded-full bg-pink-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-pink-500"
          >
            新規店舗を追加
          </Link>
        }
      />

      <StoreFilterPanel
        prefecture={filters.prefecture}
        industry={filters.industry}
        keyword={filters.keyword}
        page={page}
        totalPages={totalPages}
        onPrefectureChange={setPrefecture}
        onIndustryChange={setIndustry}
        onKeywordChange={setKeyword}
        onReload={reload}
        loading={loading}
        total={total}
      />

      {error && <AdminAlert>{error}</AdminAlert>}

      <StoreList stores={stores} loading={loading} />
      <AdminPagination
        page={page}
        totalPages={totalPages}
        onPrev={prevPage}
        onNext={nextPage}
        loading={loading}
      />
    </div>
  );
};
