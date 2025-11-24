'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { API_BASE_URL } from '@/lib/api-base';

export type AdminSurveyListItem = {
  id: string;
  storeId: string;
  storeName: string;
  branchName?: string;
  prefecture: string;
  industry: string;
  visitedPeriod: string;
  rating: number;
  emailAddress?: string;
  createdAt: string;
};

type SurveyListResponse = {
  items: AdminSurveyListItem[];
  page: number;
  limit: number;
  total: number;
};

export type SurveyFilters = {
  prefecture: string;
  industry: string;
  keyword: string;
};

const PAGE_SIZE = 20;

export const useAdminSurveySearch = () => {
  const [surveys, setSurveys] = useState<AdminSurveyListItem[]>([]);
  const [filters, setFilters] = useState<SurveyFilters>({ prefecture: '', industry: '', keyword: '' });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / PAGE_SIZE)), [total]);

  const fetchSurveys = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(PAGE_SIZE));
      if (filters.prefecture) params.set('prefecture', filters.prefecture);
      if (filters.industry) params.set('industry', filters.industry);
      if (filters.keyword) params.set('keyword', filters.keyword);

      const response = await fetch(`${API_BASE_URL}/api/admin/surveys?${params.toString()}`, {
        cache: 'no-store',
      });
      if (!response.ok) {
        throw new Error(`アンケート一覧の取得に失敗しました (${response.status})`);
      }
      const payload = (await response.json()) as SurveyListResponse;
      setSurveys(payload.items);
      setTotal(payload.total ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'アンケート一覧の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [filters.industry, filters.keyword, filters.prefecture, page]);

  useEffect(() => {
    void fetchSurveys();
  }, [fetchSurveys]);

  const setPrefecture = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, prefecture: value }));
    setPage(1);
  }, []);

  const setIndustry = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, industry: value }));
    setPage(1);
  }, []);

  const setKeyword = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, keyword: value }));
    setPage(1);
  }, []);

  const nextPage = useCallback(() => {
    setPage((prev) => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setPage((prev) => Math.max(1, prev - 1));
  }, []);

  return {
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
    reload: () => void fetchSurveys(),
    nextPage,
    prevPage,
  };
};
