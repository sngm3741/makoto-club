"use server";

import { MOCK_SURVEYS } from '@/data/mock-surveys';
import { API_BASE_URL } from '@/lib/api-base';
import type { StoreDetail, StoreSummary, SurveySummary } from '@/types/survey';

type StoreSearchParams = {
  prefecture?: string;
  area?: string;
  industry?: string;
  genre?: string;
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

function aggregateMockStores(): StoreSummary[] {
  const storeMap = new Map<string, StoreSummary>();

  MOCK_SURVEYS.forEach((survey) => {
    const existing = storeMap.get(survey.storeName);
    if (existing) {
      existing.surveyCount += 1;
      existing.helpfulCount = (existing.helpfulCount ?? 0) + (survey.helpfulCount ?? 0);
      existing.averageEarning =
        Math.round(((existing.averageEarning * (existing.surveyCount - 1) + survey.averageEarning) /
          existing.surveyCount) *
          10) / 10;
      existing.averageEarningLabel = `${existing.averageEarning}万円`;
      existing.waitTimeHours =
        Math.round(((existing.waitTimeHours * (existing.surveyCount - 1) + survey.waitTimeHours) /
          existing.surveyCount) *
          10) / 10;
      existing.waitTimeLabel = `${existing.waitTimeHours}時間`;
      existing.averageRating =
        Math.round(((existing.averageRating * (existing.surveyCount - 1) + survey.rating) /
          existing.surveyCount) *
          10) / 10;
      existing.createdAt = pickLatestDate(existing.createdAt, survey.createdAt);
      existing.updatedAt = pickLatestDate(existing.updatedAt, survey.updatedAt);
    } else {
      storeMap.set(survey.storeName, {
        id: `store-${storeMap.size + 1}`,
        storeName: survey.storeName,
        branchName: survey.storeBranch ?? undefined,
        prefecture: survey.storePrefecture,
        area: survey.storeArea ?? undefined,
        category: survey.storeIndustry,
        genre: survey.storeGenre ?? undefined,
        createdAt: survey.createdAt,
        updatedAt: survey.updatedAt,
        averageRating: survey.rating,
        helpfulCount: survey.helpfulCount ?? 0,
        averageEarning: survey.averageEarning,
        averageEarningLabel: `${survey.averageEarning}万円`,
        waitTimeHours: survey.waitTimeHours,
        waitTimeLabel: `${survey.waitTimeHours}時間`,
        surveyCount: 1,
      });
    }
  });

  return Array.from(storeMap.values());
}

function filterStores(stores: StoreSummary[], params: StoreSearchParams) {
  const { prefecture, area, industry, genre } = params;
  return stores.filter((store) => {
    if (prefecture && store.prefecture !== prefecture) return false;
    if (area && store.area !== area) return false;
    if (industry && store.category !== industry) return false;
    if (genre && store.genre !== genre) return false;
    return true;
  });
}

function sortStores(stores: StoreSummary[], sortKey?: string) {
  if (sortKey === 'newest') {
    return [...stores].sort((a, b) => {
      const aDate = a.createdAt ?? a.updatedAt;
      const bDate = b.createdAt ?? b.updatedAt;
      if (!aDate && !bDate) return 0;
      if (!aDate) return 1;
      if (!bDate) return -1;
      return new Date(aDate) < new Date(bDate) ? 1 : -1;
    });
  }

  if (sortKey === 'helpful') {
    return [...stores].sort((a, b) => {
      const helpfulA = a.helpfulCount ?? 0;
      const helpfulB = b.helpfulCount ?? 0;
      if (helpfulA === helpfulB) {
        return (a.createdAt ?? a.updatedAt ?? '') < (b.createdAt ?? b.updatedAt ?? '') ? 1 : -1;
      }
      return helpfulB - helpfulA;
    });
  }

  if (sortKey === 'earning') {
    return [...stores].sort((a, b) => {
      const earnA = a.averageEarning ?? 0;
      const earnB = b.averageEarning ?? 0;
      if (earnA === earnB) {
        return (a.createdAt ?? a.updatedAt ?? '') < (b.createdAt ?? b.updatedAt ?? '') ? 1 : -1;
      }
      return earnB - earnA;
    });
  }

  return stores;
}

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
    const stores = aggregateMockStores();
    const filtered = sortStores(filterStores(stores, params), params.sort);
    const start = (page - 1) * limit;
    return {
      items: filtered.slice(start, start + limit),
      page,
      limit,
      total: filtered.length,
    };
  }

  const url = new URL('/api/stores', API_BASE_URL);
  if (params.prefecture) url.searchParams.set('prefecture', params.prefecture);
  if (params.area) url.searchParams.set('area', params.area);
  if (params.industry) url.searchParams.set('industry', params.industry);
  if (params.genre) url.searchParams.set('genre', params.genre);
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
    const mock = aggregateMockStores().find((store) => store.id === storeId);
    const surveys = MOCK_SURVEYS.filter((survey) => survey.storeName === mock?.storeName);
    return {
      ...(mock ?? {
        id: storeId,
        storeName: '不明な店舗',
        prefecture: '',
        category: '',
        averageRating: 0,
        averageEarning: 0,
        waitTimeHours: 0,
        surveyCount: 0,
      }),
      surveys,
    };
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
