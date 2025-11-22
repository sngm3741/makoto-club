'use client';

import { useCallback, useEffect, useState } from 'react';

import { API_BASE_URL } from '@/lib/api-base';
import type { AdminStoreRecord } from '@/types/admin-store';

type StoreListResponse = {
  items: AdminStoreRecord[];
  page: number;
  limit: number;
  total: number;
};

type Filters = {
  prefecture: string;
  industry: string;
  keyword: string;
};

const initialFilters: Filters = {
  prefecture: '',
  industry: '',
  keyword: '',
};

const PAGE_SIZE = 20;

export const useAdminStoreSearch = () => {
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [stores, setStores] = useState<AdminStoreRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStores = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.prefecture) params.set('prefecture', filters.prefecture);
      if (filters.industry) params.set('industry', filters.industry);
      if (filters.keyword.trim()) params.set('name', filters.keyword.trim());
      params.set('page', String(page));
      params.set('limit', String(PAGE_SIZE));
      const query = params.toString();
      const response = await fetch(
        `${API_BASE_URL}/api/admin/stores${query ? `?${query}` : ''}`,
        { cache: 'no-store' },
      );
      if (!response.ok) {
        throw new Error(`店舗一覧の取得に失敗しました (${response.status})`);
      }
      const payload = (await response.json()) as StoreListResponse;
      setStores(payload.items);
      setTotal(payload.total);
      if (payload.page !== page) {
        setPage(payload.page);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '店舗一覧の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    void fetchStores();
  }, [fetchStores]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const canPrev = page > 1;
  const canNext = page < totalPages;

  return {
    stores,
    total,
    page,
    totalPages,
    canPrev,
    canNext,
    loading,
    error,
    filters,
    setPrefecture: (value: string) => {
      setPage(1);
      setFilters((prev) => ({ ...prev, prefecture: value }));
    },
    setIndustry: (value: string) => {
      setPage(1);
      setFilters((prev) => ({ ...prev, industry: value }));
    },
    setKeyword: (value: string) => {
      setPage(1);
      setFilters((prev) => ({ ...prev, keyword: value }));
    },
    reload: () => void fetchStores(),
    nextPage: () =>
      setPage((prev) => (prev < totalPages ? prev + 1 : prev)),
    prevPage: () =>
      setPage((prev) => (prev > 1 ? prev - 1 : prev)),
    goToPage: (target: number) =>
      setPage(() => {
        const clamped = Math.max(1, Math.min(target, totalPages));
        return clamped;
      }),
  };
};
