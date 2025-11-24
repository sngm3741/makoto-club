'use client';

import { AdminAlert } from '@/features/admin/components/admin-alert';
import { AdminPageHeader } from '@/features/admin/components/admin-page-header';
import { AdminPagination } from '@/features/admin/components/admin-pagination';
import Link from 'next/link';

import { SurveyFilterPanel } from './survey-filter-panel';
import { SurveyList } from './survey-list';
import { useAdminSurveySearch } from '../hooks/use-admin-survey-search';

export const AdminSurveyDashboard = () => {
  const {
    surveys,
    total,
    page,
    totalPages,
    filters,
    loading,
    error,
    setPrefecture,
    setIndustry,
    setKeyword,
    reload,
    nextPage,
    prevPage,
  } = useAdminSurveySearch();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="アンケート一覧"
        description="条件で絞り込み、詳細ページから内容の確認・編集を行ってください。"
        action={
          <Link
            href="/admin/stores"
            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-slate-800"
          >
            店舗一覧
          </Link>
        }
      />

      <SurveyFilterPanel
        prefecture={filters.prefecture}
        industry={filters.industry}
        keyword={filters.keyword}
        page={page}
        totalPages={totalPages}
        total={total}
        onPrefectureChange={setPrefecture}
        onIndustryChange={setIndustry}
        onKeywordChange={setKeyword}
        onReload={reload}
        loading={loading}
      />

      {error && <AdminAlert>{error}</AdminAlert>}

      <SurveyList surveys={surveys} loading={loading} />
      <AdminPagination page={page} totalPages={totalPages} onPrev={prevPage} onNext={nextPage} loading={loading} />
    </div>
  );
};
