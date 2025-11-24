"use server";
import { API_BASE_URL } from '@/lib/api-base';
import type {
  SurveyDetail,
  SurveyListResponse,
  SurveySummary,
} from '@/types/survey';

type SurveySearchParams = {
  prefecture?: string;
  industry?: string;
  storeName?: string;
  storeId?: string;
  keyword?: string;
  sort?: string;
  page?: number;
  limit?: number;
};

const DEFAULT_LIMIT = 10;

function toSummary(survey: SurveyDetail): SurveySummary {
  return { ...survey };
}

export async function fetchSurveys(
  params: SurveySearchParams,
): Promise<SurveyListResponse> {
  const { page = 1, limit = DEFAULT_LIMIT } = params;

  if (!API_BASE_URL) {
    throw new Error('API_BASE_URL が設定されていません');
  }

  const url = new URL('/api/surveys', API_BASE_URL);
  if (params.prefecture) url.searchParams.set('prefecture', params.prefecture);
  if (params.industry) url.searchParams.set('industry', params.industry);
  if (params.storeName) url.searchParams.set('storeName', params.storeName);
  if (params.storeId) url.searchParams.set('storeId', params.storeId);
  if (params.keyword) url.searchParams.set('keyword', params.keyword);
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
    throw new Error('API_BASE_URL が設定されていません');
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
