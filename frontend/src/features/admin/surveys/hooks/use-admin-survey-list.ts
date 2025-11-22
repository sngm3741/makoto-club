'use client';

import { useCallback, useEffect, useState } from 'react';

import { API_BASE_URL } from '@/lib/api-base';

export type StatusFilter = 'pending' | 'approved' | 'rejected' | 'all';

export type AdminSurveyListItem = {
  id: string;
  storeId: string;
  storeName: string;
  branchName?: string;
  prefecture: string;
  category: string;
  status: string;
  rewardStatus: string;
  createdAt: string;
  surveyerHandle?: string;
  rating: number;
};

type SurveyListResponse = {
  items: AdminSurveyListItem[];
};

const DEFAULT_STATUS: StatusFilter = 'pending';

export const useAdminSurveyList = () => {
  const [status, setStatus] = useState<StatusFilter>(DEFAULT_STATUS);
  const [surveys, setSurveys] = useState<AdminSurveyListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSurveys = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query = status === 'all' ? '' : `?status=${status}`;
      const response = await fetch(`${API_BASE_URL}/api/admin/surveys${query}`, {
        cache: 'no-store',
      });
      if (!response.ok) {
        throw new Error(`アンケート一覧の取得に失敗しました (${response.status})`);
      }
      const payload = (await response.json()) as SurveyListResponse;
      setSurveys(payload.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'アンケート一覧の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    void fetchSurveys();
  }, [fetchSurveys]);

  return {
    surveys,
    status,
    setStatus,
    loading,
    error,
    reload: () => void fetchSurveys(),
  };
};
