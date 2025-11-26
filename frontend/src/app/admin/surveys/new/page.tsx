import { AdminSurveyEditor } from '@/components/admin/admin-survey-editor';
import { API_BASE_URL } from '@/lib/api-base';

const LOG_PREFIX = '[admin/surveys/new]';

const logInfo = (...args: unknown[]) => {
  console.log(LOG_PREFIX, ...args);
};

const logError = (...args: unknown[]) => {
  console.error(LOG_PREFIX, ...args);
};

type AdminStore = {
  id: string;
  name: string;
  branchName?: string;
  prefecture: string;
  area?: string;
  industry: string;
  genre?: string;
};

type PageSearchParams = {
  storeId?: string;
};

async function fetchAdminStore(id: string): Promise<AdminStore | null> {
  if (!API_BASE_URL) {
    logError('API_BASE_URL is empty while fetching store');
    return null;
  }
  const response = await fetch(`${API_BASE_URL}/api/admin/stores/${id}`, {
    cache: 'no-store',
  });
  if (!response.ok) {
    logError('failed to fetch admin store', { id, status: response.status });
    return null;
  }
  return (await response.json()) as AdminStore;
}

const buildInitialSurvey = (store?: AdminStore) => {
  const now = new Date().toISOString();
  return {
    id: '',
    storeId: store?.id ?? '',
    storeName: store?.name ?? '',
    branchName: store?.branchName ?? '',
    prefecture: store?.prefecture ?? '',
    category: store?.industry ?? '',
    workType: '',
    visitedAt: '',
    age: 0,
    specScore: 0,
    waitTimeHours: 0,
    averageEarning: 0,
    castBack: '',
    customerComment: '',
    staffComment: '',
    workEnvironmentComment: '',
    etcComment: '',
    emailAddress: '',
    imageUrls: [],
    status: 'pending',
    statusNote: '',
    reviewedBy: '',
    surveyedAt: undefined,
    rewardStatus: 'pending',
    rewardNote: '',
    rewardSentAt: undefined,
    surveyerId: undefined,
    surveyerName: undefined,
    surveyerHandle: undefined,
    createdAt: now,
    updatedAt: now,
    rating: 0,
  };
};

export const dynamic = 'force-dynamic';

export default async function AdminSurveyCreatePage({
  searchParams,
}: {
  searchParams?: Promise<PageSearchParams>;
}) {
  const resolvedSearch = searchParams ? await searchParams : undefined;
  const storeId = resolvedSearch?.storeId;

  let store: AdminStore | null = null;
  if (storeId) {
    store = await fetchAdminStore(storeId);
  }

  if (storeId && !store) {
    logInfo('store not found for survey creation', { storeId });
  }

  const initialSurvey = buildInitialSurvey(store ?? undefined);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-8">
      <AdminSurveyEditor initialSurvey={initialSurvey} mode="create" />
    </div>
  );
}
