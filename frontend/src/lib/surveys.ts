"use server";

import { MOCK_SURVEYS } from '@/data/mock-surveys';
import { API_BASE_URL } from '@/lib/api-base';
import type {
  SurveyDetail,
  SurveyListResponse,
  SurveySummary,
} from '@/types/survey';

type SurveySearchParams = {
  prefecture?: string;
  industry?: string;
  storeId?: string;
  sort?: string;
  page?: number;
  limit?: number;
};

const DEFAULT_LIMIT = 10;

function toSummary(survey: SurveyDetail): SurveySummary {
  return { ...survey };
}

function filterMockSurveys({ prefecture, industry, storeName }: SurveySearchParams) {
  return MOCK_SURVEYS.filter((survey) => {
    if (prefecture && survey.storePrefecture !== prefecture) {
      return false;
    }
    if (industry && survey.storeIndustry !== industry) {
      return false;
    }
    if (storeName && !survey.storeName.includes(storeName)) {
      return false;
    }
    return true;
  });
}

function sortMockSurveys(surveys: SurveyDetail[], sortKey?: string) {
  if (sortKey === 'helpful') {
    return [...surveys].sort(
      (a, b) => (b.helpfulCount ?? 0) - (a.helpfulCount ?? 0) || (a.createdAt < b.createdAt ? 1 : -1),
    );
  }

  if (sortKey === 'earning') {
    return [...surveys].sort(
      (a, b) => b.averageEarning - a.averageEarning || (a.createdAt < b.createdAt ? 1 : -1),
    );
  }

  // default: newest first
  return [...surveys].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function fetchSurveys(
  params: SurveySearchParams,
): Promise<SurveyListResponse> {
  const { page = 1, limit = DEFAULT_LIMIT } = params;

  if (!API_BASE_URL) {
    const filtered = sortMockSurveys(filterMockSurveys(params), params.sort);
    const start = (page - 1) * limit;
    const items = filtered.slice(start, start + limit).map(toSummary);
    return {
      items,
      page,
      limit,
      total: filtered.length,
    };
  }

  const url = new URL('/api/surveys', API_BASE_URL);
  if (params.prefecture) url.searchParams.set('prefecture', params.prefecture);
  if (params.industry) url.searchParams.set('industry', params.industry);
  if (params.storeId) url.searchParams.set('storeId', params.storeId);
  if (params.sort) url.searchParams.set('sort', params.sort);
  url.searchParams.set('page', String(page));
  url.searchParams.set('limit', String(limit));

  const response = await fetch(url, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('アンケートの取得に失敗しました');
  }

  const data = (await response.json()) as SurveyListResponse;
  return data;
}

export async function fetchSurveyById(id: string): Promise<SurveyDetail | null> {
  if (!API_BASE_URL) {
    return MOCK_SURVEYS.find((survey) => survey.id === id) ?? null;
  }

  const response = await fetch(`${API_BASE_URL}/api/surveys/${id}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error('アンケート詳細の取得に失敗しました');
  }

  return (await response.json()) as SurveyDetail;
}

export async function fetchFeaturedSurveys() {
  const [latest, highRated] = await Promise.all([
    fetchSurveys({ sort: 'newest', limit: 3 }),
    fetchSurveys({ sort: 'helpful', limit: 3 }),
  ]);
  return {
    latest: latest.items,
    highRated: highRated.items,
  };
}
