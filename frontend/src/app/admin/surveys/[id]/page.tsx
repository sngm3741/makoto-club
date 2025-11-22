import { notFound } from 'next/navigation';

import { AdminSurveyEditor } from '@/components/admin/admin-survey-editor';
import { API_BASE_URL } from '@/lib/api-base';
const LOG_PREFIX = '[admin/surveys/[id]]';

const logInfo = (...args: unknown[]) => {
  console.log(LOG_PREFIX, ...args);
};

const logError = (...args: unknown[]) => {
  console.error(LOG_PREFIX, ...args);
};

type AdminSurvey = {
  id: string;
  storeId: string;
  storeName: string;
  branchName?: string;
  prefecture: string;
  category: string;
  workType: string;
  visitedAt: string;
  age: number;
  specScore: number;
  waitTimeHours: number;
  averageEarning: number;
  status: string;
  statusNote?: string;
  surveyedBy?: string;
  surveyedAt?: string;
  customerComment?: string;
  staffComment?: string;
  workEnvironmentComment?: string;
  emailAddress?: string;
  imageUrls?: string[];
  rewardStatus: string;
  rewardNote?: string;
  rewardSentAt?: string;
  surveyerId?: string;
  surveyerName?: string;
  surveyerHandle?: string;
  createdAt: string;
  updatedAt: string;
  rating: number;
};

type RouteParams = {
  id?: string;
};

type PageProps = {
  params: RouteParams | Promise<RouteParams>;
};

async function fetchSurvey(id: string): Promise<AdminSurvey> {
  if (!API_BASE_URL) {
    logError('API_BASE_URL is empty. Ensure Vercel 環境変数が設定されています。', {
      'process.env.API_BASE_URL': process.env.API_BASE_URL,
      'process.env.NEXT_PUBLIC_API_BASE_URL': process.env.NEXT_PUBLIC_API_BASE_URL,
    });
    throw new Error('API_BASE_URL が設定されていません');
  }
	const requestUrl = `${API_BASE_URL}/api/admin/surveys/${id}`;
  logInfo('fetchSurvey start', { id, requestUrl });
  const response = await fetch(requestUrl, {
    cache: 'no-store',
  });
  logInfo('fetchSurvey response', { status: response.status, ok: response.ok, redirected: response.redirected });
  if (response.status === 404) {
    logInfo('fetchSurvey result notFound', { id, requestUrl });
    notFound();
  }
	if (!response.ok) {
		const body = await response.text().catch(() => '<<failed to read body>>');
		logError('fetchSurvey failed', { id, requestUrl, status: response.status, body });
		throw new Error('アンケートの取得に失敗しました');
	}
	const payload = (await response.json()) as AdminSurvey;
	logInfo('fetchSurvey success', {
    id,
    status: payload.status,
    rewardStatus: payload.rewardStatus,
    surveyerId: payload.surveyerId,
  });
  return payload;
}

export const dynamic = 'force-dynamic';

export default async function AdminSurveyDetailPage({ params }: PageProps) {
  const resolvedParams = params instanceof Promise ? await params : params;
  logInfo('page render start', { params: resolvedParams });
  const id = resolvedParams?.id;
  if (!id) {
    logError('params.id is missing.', resolvedParams);
    notFound();
  }

	const survey = await fetchSurvey(id);
  logInfo('page render success', { id });
  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-8">
      <AdminSurveyEditor initialSurvey={survey} />
    </div>
  );
}
