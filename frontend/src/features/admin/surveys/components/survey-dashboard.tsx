'use client';

import { AdminAlert } from '@/features/admin/components/admin-alert';
import { AdminPageHeader } from '@/features/admin/components/admin-page-header';

import { SurveyFilterBar } from './survey-filter-bar';
import { SurveyList } from './survey-list';
import { useAdminSurveyList } from '../hooks/use-admin-survey-list';

export const AdminSurveyDashboard = () => {
  const { surveys, status, setStatus, loading, error, reload } = useAdminSurveyList();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="アンケート一覧"
        description="審査状況で絞り込み、詳細ページから内容の確認・編集を行ってください。"
      />

      <SurveyFilterBar
        status={status}
        onStatusChange={setStatus}
        onReload={reload}
        loading={loading}
      />

      {error && <AdminAlert>{error}</AdminAlert>}

      <SurveyList surveys={surveys} loading={loading} />
    </div>
  );
};
