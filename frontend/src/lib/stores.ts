"use server";
import { API_BASE_URL } from '@/lib/api-base';
import type { StoreDetail, StoreSummary, SurveySummary } from '@/types/survey';

type StoreSearchParams = {
  prefecture?: string;
  area?: string;
  industry?: string;
  genre?: string;
  name?: string;
  page?: number;
  limit?: number;
  sort?: string;
};

const DEFAULT_LIMIT = 10;
const SURVEY_FETCH_LIMIT = 50;

type ApiStore = {
  id: string;
  name: string;
  branchName?: string;
  prefecture: string;
  area?: string;
  industry: string;
  genre?: string;
  businessHours?: { open: string; close: string };
  averageRating: number;
  createdAt?: string;
  updatedAt?: string;
};

type ApiStoreListResponse = {
  items: ApiStore[];
  page: number;
  limit: number;
  total: number;
};

const pickLatestDate = (a?: string, b?: string) => {
  if (!a) return b;
  if (!b) return a;
  return new Date(a) < new Date(b) ? b : a;
};

export async function fetchStoreSurveys(storeId: string): Promise<SurveySummary[]> {
  const url = new URL(`/api/stores/${storeId}/surveys`, API_BASE_URL);
  url.searchParams.set('limit', String(SURVEY_FETCH_LIMIT));
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    return [];
  }
  return (await response.json()) as SurveySummary[];
}

type StoreStats = {
  count: number;
  helpfulCount: number;
  averageEarning?: number;
  waitTimeHours?: number;
  averageRating?: number;
  averageEarningLabel?: string;
  waitTimeLabel?: string;
};

const computeStoreStats = (surveys: SurveySummary[]): StoreStats => {
  if (surveys.length === 0) {
    return { count: 0, helpfulCount: 0 };
  }
  const count = surveys.length;
  const helpfulCount = surveys.reduce((sum, survey) => sum + (survey.helpfulCount ?? 0), 0);
  const avgEarning =
    Math.round((surveys.reduce((sum, survey) => sum + survey.averageEarning, 0) / count) * 10) /
    10;
  const avgWait =
    Math.round((surveys.reduce((sum, survey) => sum + survey.waitTimeHours, 0) / count) * 10) /
    10;
  const avgRating =
    Math.round((surveys.reduce((sum, survey) => sum + survey.rating, 0) / count) * 10) / 10;
  return {
    count,
    helpfulCount,
    averageEarning: avgEarning,
    waitTimeHours: avgWait,
    averageRating: avgRating,
    averageEarningLabel: `${avgEarning}万円`,
    waitTimeLabel: `${avgWait}時間`,
  };
};

export async function fetchStores(params: StoreSearchParams) {
  const { page = 1, limit = DEFAULT_LIMIT } = params;

  if (!API_BASE_URL) {
    throw new Error('API_BASE_URL が設定されていません');
  }

  const url = new URL('/api/stores', API_BASE_URL);
  if (params.prefecture) url.searchParams.set('prefecture', params.prefecture);
  if (params.area) url.searchParams.set('area', params.area);
  if (params.industry) url.searchParams.set('industry', params.industry);
  if (params.genre) url.searchParams.set('genre', params.genre);
  if (params.name) url.searchParams.set('name', params.name);
  url.searchParams.set('page', String(page));
  url.searchParams.set('limit', String(limit));
  if (params.sort) url.searchParams.set('sort', params.sort);

  const response = await fetch(url, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('店舗情報の取得に失敗しました');
  }

  const data = (await response.json()) as ApiStoreListResponse;
  const items = await Promise.all(
    data.items.map(async (store) => {
      try {
        const surveys = await fetchStoreSurveys(store.id);
        const stats = computeStoreStats(surveys);
        return {
          id: store.id,
          storeName: store.name,
          branchName: store.branchName,
          prefecture: store.prefecture,
          area: store.area,
          category: store.industry,
          genre: store.genre,
          createdAt: store.createdAt,
          updatedAt: store.updatedAt,
          averageRating: stats.averageRating ?? store.averageRating,
          averageEarning: stats.averageEarning ?? 0,
          averageEarningLabel: stats.averageEarningLabel ?? '-',
          waitTimeHours: stats.waitTimeHours ?? 0,
          waitTimeLabel: stats.waitTimeLabel ?? '-',
          surveyCount: stats.count,
          helpfulCount: stats.helpfulCount,
        };
      } catch (error) {
        console.error('failed to load surveys for store', store.id, error);
        return {
          id: store.id,
          storeName: store.name,
          branchName: store.branchName,
          prefecture: store.prefecture,
          area: store.area,
          category: store.industry,
          genre: store.genre,
          createdAt: store.createdAt,
          updatedAt: store.updatedAt,
          averageRating: store.averageRating,
          averageEarning: 0,
          averageEarningLabel: '-',
          waitTimeHours: 0,
          waitTimeLabel: '-',
          surveyCount: 0,
          helpfulCount: 0,
        };
      }
    }),
  );

  return {
    items,
    page: data.page,
    limit: data.limit,
    total: data.total,
  };
}

export async function fetchStoreDetail(storeId: string): Promise<StoreDetail> {
  if (!API_BASE_URL) {
    throw new Error('API_BASE_URL が設定されていません');
  }

  const storeResponse = await fetch(`${API_BASE_URL}/api/stores/${storeId}`, {
    cache: 'no-store',
  });
  if (!storeResponse.ok) {
    throw new Error('店舗情報の取得に失敗しました');
  }
  const store = (await storeResponse.json()) as ApiStore;
  const surveys = await fetchStoreSurveys(storeId);
  const stats = computeStoreStats(surveys);

  return {
    id: store.id,
    storeName: store.name,
    branchName: store.branchName,
    prefecture: store.prefecture,
    area: store.area,
    category: store.industry,
    genre: store.genre,
    businessHours: store.businessHours,
    createdAt: store.createdAt,
    updatedAt: store.updatedAt,
    averageRating: stats.averageRating ?? store.averageRating,
    averageEarning: stats.averageEarning ?? 0,
    averageEarningLabel: stats.averageEarningLabel ?? '-',
    waitTimeHours: stats.waitTimeHours ?? 0,
    waitTimeLabel: stats.waitTimeLabel ?? '-',
    surveyCount: stats.count,
    helpfulCount: stats.helpfulCount,
    surveys,
  };
}

export async function fetchLatestStores(limit = 3) {
  const { items } = await fetchStores({ sort: 'newest', limit });
  return items;
}
