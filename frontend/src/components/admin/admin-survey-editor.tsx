'use client';

import { type ChangeEvent, type FormEvent, useCallback, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import {
  AGE_OPTIONS,
  AVERAGE_EARNING_OPTIONS,
  PREFECTURES,
  SURVEY_CATEGORIES,
  SPEC_MAX,
  SPEC_MAX_LABEL,
  SPEC_MIN,
  SPEC_MIN_LABEL,
  WAIT_TIME_OPTIONS,
} from '@/constants/filters';
import { API_BASE_URL } from '@/lib/api-base';
import { uploadImage } from '@/lib/media-upload';

const API_BASE = API_BASE_URL;

type AdminSurvey = {
  id: string;
  storeId: string;
  storeName: string;
  branchName?: string;
  prefecture: string;
  category: string; // バックエンドは industry を返す場合があるので後続で正規化
  industry?: string;
  workType: string;
  visitedAt: string; // バックエンドは visitedPeriod を返す場合があるので後続で正規化
  visitedPeriod?: string;
  age: number;
  specScore: number;
  waitTimeHours: number;
  averageEarning: number;
  customerComment?: string;
  staffComment?: string;
  workEnvironmentComment?: string;
  emailAddress?: string;
  imageUrls?: string[];
  status: string;
  statusNote?: string;
  reviewedBy?: string;
  surveyedAt?: string;
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

type StoreCandidate = {
  id: string;
  name: string;
  branchName?: string;
  prefecture?: string;
  industryCodes: string[];
  reviewCount: number;
  lastReviewedAt?: string;
};

const WORK_TYPE_OPTIONS = [
  { value: '在籍', label: '在籍' },
  { value: '出稼ぎ', label: '出稼ぎ' },
];

const MAX_IMAGES = 5;
const MAX_IMAGE_SIZE_MB = 3;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
const ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
type ImageItem = { url: string; name: string; size: number };

type SurveyFormState = {
  storeId: string;
  storeName: string;
  branchName: string;
  prefecture: string;
  category: string;
  workType: string;
  visitedAt: string;
  age: string;
  specScore: string;
  waitTimeHours: string;
  averageEarning: string;
  customerComment: string;
  staffComment: string;
  workEnvironmentComment: string;
  emailAddress: string;
  imageUrls: ImageItem[];
  rating: string;
};

const formatFilename = (name: string) => {
  if (!name) return 'ファイル名なし';
  const MAX_BASE = 14;
  const dotIndex = name.lastIndexOf('.');
  if (dotIndex <= 0 || dotIndex === name.length - 1) {
    return name.length > MAX_BASE ? `${name.slice(0, MAX_BASE)}…` : name;
  }
  const base = name.slice(0, dotIndex);
  const ext = name.slice(dotIndex);
  if (base.length <= MAX_BASE) {
    return base + ext;
  }
  return `${base.slice(0, MAX_BASE)}…${ext}`;
};

const formatImageSize = (size: number) => {
  if (!size || size <= 0) return '-';
  const mb = size / (1024 * 1024);
  if (mb < 0.1) return '0.1MB以下';
  return `${mb.toFixed(1)}MB`;
};

function formatDate(value?: string) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
}

const RATING_MIN = 0;
const RATING_MAX = 5;
const RATING_STEP = 0.1;

const formatSpecScoreLabel = (value: number) => {
  if (value <= SPEC_MIN) return SPEC_MIN_LABEL;
  if (value >= SPEC_MAX) return SPEC_MAX_LABEL;
  return `${value}`;
};

const canonicalCategoryValue = (input?: string) => {
  if (!input) return '';
  const byValue = SURVEY_CATEGORIES.find((item) => item.value === input);
  if (byValue) {
    return byValue.value;
  }
  const byLabel = SURVEY_CATEGORIES.find((item) => item.label === input);
  if (byLabel) {
    return byLabel.value;
  }
  return input;
};

const categoryLabelFromValue = (value?: string) => {
  if (!value) return '未選択';
  const match = SURVEY_CATEGORIES.find((item) => item.value === value);
  if (match) {
    return match.label;
  }
  return value;
};

const StarDisplay = ({ value }: { value: number }) => (
  <span className="relative inline-block text-lg leading-none">
    <span className="text-slate-300">★★★★★</span>
    <span
      className="absolute left-0 top-0 overflow-hidden text-yellow-400"
      style={{ width: `${(value / RATING_MAX) * 100}%` }}
    >
      ★★★★★
    </span>
  </span>
);

type AdminSurveyEditorProps = {
  initialSurvey: AdminSurvey;
  mode?: 'edit' | 'create';
};

export function AdminSurveyEditor({ initialSurvey, mode = 'edit' }: AdminSurveyEditorProps) {
  const router = useRouter();
  const isCreateMode = mode === 'create';
  const [survey, setSurvey] = useState<AdminSurvey>(initialSurvey);
  const [form, setForm] = useState<SurveyFormState>({
    storeId: initialSurvey.storeId ?? '',
    storeName: initialSurvey.storeName ?? '',
    branchName: initialSurvey.branchName ?? '',
    prefecture: initialSurvey.prefecture ?? '',
    category: canonicalCategoryValue(initialSurvey.category || initialSurvey.industry) ?? '',
    workType: initialSurvey.workType ?? WORK_TYPE_OPTIONS[0].value,
    visitedAt: initialSurvey.visitedAt || initialSurvey.visitedPeriod || '',
    age: String(initialSurvey.age ?? ''),
    specScore: String(initialSurvey.specScore ?? ''),
    waitTimeHours: String(initialSurvey.waitTimeHours ?? ''),
    averageEarning: String(initialSurvey.averageEarning ?? ''),
    customerComment: initialSurvey.customerComment ?? '',
    staffComment: initialSurvey.staffComment ?? '',
    workEnvironmentComment: initialSurvey.workEnvironmentComment ?? '',
    emailAddress: initialSurvey.emailAddress ?? '',
    imageUrls: (initialSurvey.imageUrls ?? []).map((url, index) => ({
      url,
      name: `画像${index + 1}`,
      size: 0,
    })),
    rating: (initialSurvey.rating ?? '').toString(),
  });
  const [savingContent, setSavingContent] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [successLink, setSuccessLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [storeCandidates, setStoreCandidates] = useState<StoreCandidate[]>([]);
  const [storeSearchLoading, setStoreSearchLoading] = useState(false);
  const [storeSearchError, setStoreSearchError] = useState<string | null>(null);
  const [storeSearchExecuted, setStoreSearchExecuted] = useState(false);
  const [filterPrefecture, setFilterPrefecture] = useState(initialSurvey.prefecture ?? '');
  const [filterCategory, setFilterCategory] = useState(
    canonicalCategoryValue(initialSurvey.category || initialSurvey.industry),
  );

  const selectedCategoryLabel = useMemo(() => categoryLabelFromValue(form.category), [form.category]);

  const filterCategoryLabel = useMemo(() => categoryLabelFromValue(filterCategory), [filterCategory]);
  const showStoreSearch = false;
  // 店舗に必ず紐づく前提なので全モードでロック
  const lockStoreFields = true;
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const canAddMoreImages = form.imageUrls.length < MAX_IMAGES && !uploadingImage;

  const contentBaseline = useMemo(
    () => ({
      storeId: survey.storeId ?? '',
      storeName: survey.storeName,
      branchName: survey.branchName ?? '',
      prefecture: survey.prefecture,
      category: survey.category,
      workType: survey.workType ?? WORK_TYPE_OPTIONS[0].value,
      visitedAt: survey.visitedAt,
      age: String(survey.age),
      specScore: String(survey.specScore),
      waitTimeHours: String(survey.waitTimeHours),
      averageEarning: String(survey.averageEarning),
      customerComment: survey.customerComment ?? '',
      staffComment: survey.staffComment ?? '',
      workEnvironmentComment: survey.workEnvironmentComment ?? '',
      emailAddress: survey.emailAddress ?? '',
      imageUrls: survey.imageUrls ?? [],
      rating: survey.rating.toString(),
    }),
    [survey],
  );

  const isContentDirty = useMemo(() => {
    return Object.entries(contentBaseline).some(([key, value]) => {
      if (key === 'imageUrls') {
        const baselineUrls = (value as string[]) ?? [];
        const currentUrls = form.imageUrls.map((item) => item.url);
        return JSON.stringify(baselineUrls) !== JSON.stringify(currentUrls);
      }
      const formValue = form[key as keyof typeof form];
      return formValue !== value;
    });
  }, [contentBaseline, form]);
  const submitLabel = isCreateMode ? '登録する' : '更新する';
  const submitSavingLabel = isCreateMode ? '登録中…' : '保存中…';

  const handleImageUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0 || uploadingImage) return;
    const fileArray = Array.from(files);
    const isAllowedFile = (file: File) => {
      const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
      const byMime = file.type ? ALLOWED_MIME_TYPES.includes(file.type) : false;
      const byExt = ALLOWED_IMAGE_EXTENSIONS.includes(ext);
      return (byMime || byExt) && file.size <= MAX_IMAGE_SIZE_BYTES;
    };
    const oversize = fileArray.filter((file) => file.size > MAX_IMAGE_SIZE_BYTES);
    const invalid = fileArray.filter((file) => !isAllowedFile(file));
    if (invalid.length > 0) {
      const names = invalid.map((file) => file.name || '不明なファイル').join(', ');
      const cause = oversize.length > 0 ? `サイズが${MAX_IMAGE_SIZE_MB}MBを超えています` : '画像以外のファイルです';
      setImageError(`${cause}: ${names}`);
    } else {
      setImageError(null);
    }
    const validFiles = fileArray.filter(isAllowedFile);
    if (validFiles.length === 0) return;

    const remaining = MAX_IMAGES - form.imageUrls.length;
    if (remaining <= 0) {
      return;
    }

    setUploadingImage(true);
    try {
      for (const file of validFiles.slice(0, remaining)) {
        const url = await uploadImage(file);
        setForm((prev) => ({
          ...prev,
          imageUrls: [
            ...prev.imageUrls,
            {
              url,
              name: file.name || `画像${prev.imageUrls.length + 1}`,
              size: file.size,
            },
          ],
        }));
      }
    } catch (error) {
      console.error(error);
      setImageError('画像のアップロードに失敗しました。時間を置いて再度お試しください。');
    } finally {
      setUploadingImage(false);
    }
  }, [form.imageUrls.length, uploadingImage]);

  const handleRemoveImage = useCallback((index: number) => {
    setForm((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, idx) => idx !== index),
    }));
  }, []);

  const handleContentChange = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = event.target;
      if (name === 'rating') {
        const numeric = Number(value);
        const clamped = Math.min(RATING_MAX, Math.max(RATING_MIN, numeric));
        const rounded = (Math.round(clamped * 10) / 10).toFixed(1);
        setForm((prev) => ({ ...prev, rating: rounded }));
        return;
      }
      setForm((prev) => ({ ...prev, [name]: value }));
    },
    [],
  );

  const handleStoreSearch = useCallback(async () => {
    if (!API_BASE) {
      setError('API_BASE_URL が未設定です');
      return;
    }
    if (!filterPrefecture) {
      setStoreSearchError('検索用の都道府県を選択してください');
      return;
    }
    if (!filterCategory) {
      setStoreSearchError('検索用の業種を選択してください');
      return;
    }

    setStoreSearchLoading(true);
    setStoreSearchError(null);
    setStoreSearchExecuted(true);
    try {
      const params = new URLSearchParams();
      params.set('prefecture', filterPrefecture);
      params.set('industry', filterCategory);
      params.set('limit', '50');

      const response = await fetch(`${API_BASE}/api/admin/stores?${params.toString()}`, {
        cache: 'no-store',
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        const message =
          data && typeof data === 'object' && data !== null && 'error' in data
            ? (data as { error: string }).error
            : `店舗候補の取得に失敗しました (${response.status})`;
        throw new Error(message);
      }
      const payload = (await response.json()) as { items: StoreCandidate[] };
      setStoreCandidates(payload.items ?? []);
      if ((payload.items ?? []).length === 0) {
        setStoreSearchError('該当する店舗が見つかりませんでした。');
      }
    } catch (err) {
      setStoreSearchError(err instanceof Error ? err.message : '店舗候補の取得に失敗しました');
    } finally {
      setStoreSearchLoading(false);
    }
  }, [filterPrefecture, filterCategory]);

  const handleStoreSelect = useCallback((candidate: StoreCandidate) => {
    const canonicalCodes = candidate.industryCodes
      .map((code) => canonicalCategoryValue(code))
      .filter((code) => code);
    const selectedCategory = canonicalCodes[0] || form.category;
    setForm((prev) => ({
      ...prev,
      storeId: candidate.id,
      storeName: candidate.name,
      branchName: candidate.branchName ?? '',
      prefecture: candidate.prefecture ?? prev.prefecture,
      category: selectedCategory,
    }));
    if (candidate.prefecture) {
      setFilterPrefecture(candidate.prefecture);
    }
    if (canonicalCodes[0]) {
      setFilterCategory(canonicalCodes[0]);
    }
    setStoreSearchError(null);
    setMessage(`店舗を「${candidate.name}${candidate.branchName ? ` ${candidate.branchName}` : ''}」に設定しました。`);
    setError(null);
  }, [form.category]);

  const handleStoreCreate = useCallback(async () => {
    if (!API_BASE) {
      setError('API_BASE_URL が未設定です');
      return;
    }
    const storeName = (form.storeName ?? '').trim();
    if (!storeName) {
      setStoreSearchError('店舗名を入力してください');
      return;
    }
    if (!form.prefecture) {
      setStoreSearchError('都道府県を選択してください');
      return;
    }
    if (!form.category) {
      setStoreSearchError('業種を選択してください');
      return;
    }

    setStoreSearchLoading(true);
    setStoreSearchError(null);
    try {
      const payload = {
        name: storeName,
        branchName: (form.branchName ?? '').trim(),
        prefecture: form.prefecture,
        industryCode: form.category,
      };
      const response = await fetch(`${API_BASE}/api/admin/stores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        const message =
          data && typeof data === 'object' && data !== null && 'error' in data
            ? (data as { error: string }).error
            : `店舗の登録に失敗しました (${response.status})`;
        throw new Error(message);
      }

      const data = (await response.json()) as { store: StoreCandidate; created: boolean };
      const createdStore = data.store;
      const canonicalCodes = createdStore.industryCodes
        .map((code) => canonicalCategoryValue(code))
        .filter((code) => code);
      const selectedCategory = canonicalCodes[0] || form.category;
      setForm((prev) => ({
        ...prev,
        storeId: createdStore.id,
        storeName: createdStore.name,
        branchName: createdStore.branchName ?? '',
        prefecture: createdStore.prefecture ?? prev.prefecture,
        category: selectedCategory,
      }));
      if (createdStore.prefecture) {
        setFilterPrefecture(createdStore.prefecture);
      }
      if (canonicalCodes[0]) {
        setFilterCategory(canonicalCodes[0]);
      }
      setStoreCandidates((prev) => {
        const filtered = prev.filter((item) => item.id !== createdStore.id);
        return [createdStore, ...filtered];
      });
      setStoreSearchExecuted(true);
      setMessage(
        data.created
          ? `店舗「${createdStore.name}${createdStore.branchName ? ` ${createdStore.branchName}` : ''}」を新規登録しました。`
          : `店舗「${createdStore.name}${createdStore.branchName ? ` ${createdStore.branchName}` : ''}」を選択しました。`,
      );
      setError(null);
    } catch (err) {
      setStoreSearchError(err instanceof Error ? err.message : '店舗の登録に失敗しました');
    } finally {
      setStoreSearchLoading(false);
    }
  }, [form.storeName, form.branchName, form.prefecture, form.category]);

  const handleContentSave = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      if (!API_BASE) {
        setError('API_BASE_URL が未設定です');
        return;
      }
      if (!form.storeId) {
        setError('店舗候補から該当店舗を選択するか、新規店舗を登録してください');
        return;
      }
      setSavingContent(true);
      setMessage(null);
      setError(null);
      try {
        const normalizeOptional = (value?: string) => {
          if (!value) return undefined;
          const trimmed = value.trim();
          return trimmed.length > 0 ? trimmed : undefined;
        };
        const imageUrls = form.imageUrls.map((item) => item.url).filter((url) => (url ?? '').trim().length > 0);
        const storeName = (form.storeName ?? '').trim();
        const branchName = (form.branchName ?? '').trim();
        const prefecture = (form.prefecture ?? '').trim();

        const payload: Record<string, unknown> = {
          storeId: form.storeId,
          storeName,
          branchName,
          prefecture,
          industry: form.category, // バックエンドのキーに合わせる
          workType: form.workType,
          visitedPeriod: form.visitedAt, // バックエンドのキーに合わせる
          age: Number(form.age),
          specScore: Number(form.specScore),
          waitTimeHours: Number(form.waitTimeHours),
          averageEarning: Number(form.averageEarning),
          customerComment: normalizeOptional(form.customerComment) ?? null,
          staffComment: normalizeOptional(form.staffComment) ?? null,
          workEnvironmentComment: normalizeOptional(form.workEnvironmentComment) ?? null,
          emailAddress: normalizeOptional(form.emailAddress),
          imageUrls,
          rating: Number(form.rating),
        };

        const endpoint = isCreateMode
          ? `${API_BASE}/api/admin/surveys`
          : `${API_BASE}/api/admin/surveys/${survey.id}`;
        const method = isCreateMode ? 'POST' : 'PUT';

        const response = await fetch(endpoint, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => null);
          const message =
            data && typeof data === 'object' && data !== null && 'error' in data
              ? (data as { error: string }).error
              : `内容の更新に失敗しました (${response.status})`;
          throw new Error(message);
        }

        const updated = (await response.json()) as AdminSurvey;
        setSurvey(updated);
        setForm({
          storeId: updated.storeId ?? '',
          storeName: updated.storeName ?? '',
          branchName: updated.branchName ?? '',
          prefecture: updated.prefecture ?? '',
          category: canonicalCategoryValue(updated.category || updated.industry) ?? '',
          workType: updated.workType ?? WORK_TYPE_OPTIONS[0].value,
          visitedAt: updated.visitedAt || updated.visitedPeriod || '',
          age: String(updated.age ?? ''),
          specScore: String(updated.specScore ?? ''),
          waitTimeHours: String(updated.waitTimeHours ?? ''),
          averageEarning: String(updated.averageEarning ?? ''),
          customerComment: updated.customerComment ?? '',
          staffComment: updated.staffComment ?? '',
          workEnvironmentComment: updated.workEnvironmentComment ?? '',
          emailAddress: updated.emailAddress ?? '',
          imageUrls: (updated.imageUrls ?? []).map((url, index) => ({
            url,
            name: `画像${index + 1}`,
            size: 0,
          })),
          rating: (updated.rating ?? '').toString(),
        });
        if (isCreateMode) {
          setMessage('アンケートを登録しました。');
          setSuccessLink(`/surveys/${updated.id}`);
        } else {
          setMessage('アンケート内容を更新しました');
          setSuccessLink(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '内容の更新に失敗しました');
      } finally {
        setSavingContent(false);
      }
    },
    [form, survey.id, isCreateMode, router],
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">
        {isCreateMode ? 'アンケート作成' : 'アンケート編集'}
      </h1>

      {message ? (
        <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
          {successLink ? (
            <span className="ml-2">
              <Link href={successLink} className="underline">
                アンケートを確認する
              </Link>
            </span>
          ) : null}
        </p>
      ) : null}
      {error ? <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

      <section className="space-y-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <header className="space-y-1">
          <h2 className="text-lg font-semibold text-slate-900">アンケート内容</h2>
          <p className="text-sm text-slate-500">
            {isCreateMode ? '必要事項を入力し、アンケートを登録してください。' : '投稿内容を編集し、保存してください。'}
          </p>
        </header>

        <form className="grid gap-4" onSubmit={handleContentSave}>
          {showStoreSearch && (
            <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="max-w-xl space-y-1 text-sm text-slate-600">
                <p>検索用の都道府県・業種を設定し、「店舗を絞り込む」を押してください。</p>
                <p className="text-xs text-slate-500">
                  候補から店舗を選択すると、下の入力欄（店舗名／支店名／都道府県／業種）が候補の情報で自動更新されます。
                </p>
              </div>
              <div className="flex flex-wrap items-end gap-3">
                <label className="space-y-1 text-sm">
                  <span className="font-semibold text-slate-700">検索用 都道府県</span>
                  <select
                    value={filterPrefecture}
                    onChange={(event) => setFilterPrefecture(event.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-pink-400 focus:outline-none"
                  >
                    <option value="">選択してください</option>
                    {PREFECTURES.map((prefecture) => (
                      <option key={prefecture} value={prefecture}>
                        {prefecture}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1 text-sm">
                  <span className="font-semibold text-slate-700">検索用 業種</span>
                  <select
                    value={filterCategory}
                    onChange={(event) => setFilterCategory(event.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-pink-400 focus:outline-none"
                  >
                    <option value="">選択してください</option>
                    {SURVEY_CATEGORIES.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  onClick={handleStoreSearch}
                  className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow disabled:opacity-60"
                  disabled={storeSearchLoading}
                >
                  {storeSearchLoading ? '検索中…' : '店舗を絞り込む'}
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              絞り込み条件: {filterPrefecture || '未選択'} / {filterCategoryLabel}
            </p>
            <p className="text-xs text-slate-500">
              現在の選択:{' '}
              {form.storeId
                ? `${form.storeName}${form.branchName ? `（${form.branchName}）` : ''} / ${form.prefecture} / ${selectedCategoryLabel}`
                : '未選択です。候補から選ぶか新規店舗を登録してください。'}
            </p>

            {storeSearchError ? (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{storeSearchError}</p>
            ) : null}

            {storeSearchExecuted ? (
              <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                {storeSearchLoading ? (
                  <p className="px-3 py-2 text-xs text-slate-500">店舗候補を取得しています…</p>
                ) : storeCandidates.length > 0 ? (
                  <ul className="divide-y divide-slate-200">
                    {storeCandidates.map((candidate) => {
                      const selected = form.storeId === candidate.id;
                      return (
                        <li key={candidate.id}>
                          <button
                            type="button"
                            onClick={() => handleStoreSelect(candidate)}
                            className={`flex w-full flex-col items-start gap-1 px-3 py-2 text-left transition ${
                              selected ? 'bg-pink-50 text-pink-700' : 'hover:bg-slate-100'
                            }`}
                          >
                            <span className="text-sm font-semibold">
                              {candidate.name}
                              {candidate.branchName ? `（${candidate.branchName}）` : ''}
                            </span>
                            <span className="text-xs text-slate-500">
                              {candidate.prefecture ?? '都道府県不明'} / 登録済みアンケート数 {candidate.reviewCount}
                              {candidate.industryCodes.length > 0
                                ? ` / 業種: ${candidate.industryCodes
                                    .map((code) => categoryLabelFromValue(code))
                                    .join(', ')}`
                                : ''}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                    <li>
                      <button
                        type="button"
                        onClick={handleStoreCreate}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-semibold text-pink-600 transition hover:bg-pink-50 hover:text-pink-700 disabled:opacity-60"
                        disabled={storeSearchLoading}
                      >
                        ＋ 現在の内容で新規店舗を登録する
                      </button>
                    </li>
                  </ul>
                ) : (
                  <div className="space-y-2 px-3 py-2">
                    <p className="text-xs text-slate-500">条件に一致する店舗が見つかりませんでした。</p>
                    <button
                      type="button"
                      onClick={handleStoreCreate}
                      className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-pink-400 hover:text-pink-600 disabled:opacity-60"
                      disabled={storeSearchLoading}
                    >
                      ＋ 現在の内容で新規店舗を登録する
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                都道府県と業種を確認し、「店舗を絞り込む」を押すと候補が表示されます。
              </p>
            )}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span className="font-semibold text-slate-700">店舗名</span>
              <input
                name="storeName"
                value={form.storeName}
                onChange={handleContentChange}
                placeholder="例: やりすぎ娘"
                className={`w-full rounded-lg border px-3 py-2 text-sm focus:border-pink-400 focus:outline-none ${
                  lockStoreFields ? 'border-slate-100 bg-slate-50 text-slate-500' : 'border-slate-200'
                }`}
                required
                disabled={lockStoreFields}
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-semibold text-slate-700">支店名</span>
              <input
                name="branchName"
                value={form.branchName}
                onChange={handleContentChange}
                placeholder="例: 新宿店"
                className={`w-full rounded-lg border px-3 py-2 text-sm focus:border-pink-400 focus:outline-none ${
                  lockStoreFields ? 'border-slate-100 bg-slate-50 text-slate-500' : 'border-slate-200'
                }`}
                disabled={lockStoreFields}
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-semibold text-slate-700">都道府県</span>
              <select
                name="prefecture"
                value={form.prefecture}
                onChange={handleContentChange}
                className={`w-full rounded-lg border px-3 py-2 text-sm focus:border-pink-400 focus:outline-none ${
                  lockStoreFields ? 'border-slate-100 bg-slate-50 text-slate-500' : 'border-slate-200'
                }`}
                required
                disabled={lockStoreFields}
              >
                <option value="">選択してください</option>
                {PREFECTURES.map((prefecture) => (
                  <option key={prefecture} value={prefecture}>
                    {prefecture}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-semibold text-slate-700">業種</span>
              <select
                name="category"
                value={form.category}
                onChange={handleContentChange}
                className={`w-full rounded-lg border px-3 py-2 text-sm focus:border-pink-400 focus:outline-none ${
                  lockStoreFields ? 'border-slate-100 bg-slate-50 text-slate-500' : 'border-slate-200'
                }`}
                required
                disabled={lockStoreFields}
              >
                <option value="">選択してください</option>
                {SURVEY_CATEGORIES.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-semibold text-slate-700">働いた時期</span>
              <input
                type="month"
                name="visitedAt"
                value={form.visitedAt}
                onChange={handleContentChange}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-pink-400 focus:outline-none"
                required
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-semibold text-slate-700">勤務形態</span>
              <select
                name="workType"
                value={form.workType}
                onChange={handleContentChange}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-pink-400 focus:outline-none"
                required
              >
                {WORK_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-semibold text-slate-700">年齢</span>
              <select
                name="age"
                value={form.age}
                onChange={handleContentChange}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-pink-400 focus:outline-none"
                required
              >
                {AGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm sm:col-span-2">
              <span className="font-semibold text-slate-700">スペック</span>
              <input
                type="range"
                name="specScore"
                value={Number(form.specScore) || SPEC_MIN}
                onChange={handleContentChange}
                min={SPEC_MIN}
                max={SPEC_MAX}
                step={1}
                className="w-full accent-pink-500"
              />
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{SPEC_MIN_LABEL}</span>
                <span className="text-sm font-semibold text-slate-700">
                  {formatSpecScoreLabel(Number(form.specScore) || SPEC_MIN)}
                </span>
                <span>{SPEC_MAX_LABEL}</span>
              </div>
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-semibold text-slate-700">待機時間</span>
              <select
                name="waitTimeHours"
                value={form.waitTimeHours}
                onChange={handleContentChange}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-pink-400 focus:outline-none"
                required
              >
                {WAIT_TIME_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-semibold text-slate-700">平均稼ぎ</span>
              <select
                name="averageEarning"
                value={form.averageEarning}
                onChange={handleContentChange}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-pink-400 focus:outline-none"
                required
              >
                {AVERAGE_EARNING_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-4">
            <label className="space-y-1 text-sm">
              <span className="font-semibold text-slate-700">客層の印象</span>
              <textarea
                name="customerComment"
                value={form.customerComment}
                onChange={handleContentChange}
                rows={3}
                placeholder="客層の特徴や接客時の印象など"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-pink-400 focus:outline-none"
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-semibold text-slate-700">スタッフ対応</span>
              <textarea
                name="staffComment"
                value={form.staffComment}
                onChange={handleContentChange}
                rows={3}
                placeholder="講習やサポート、送迎などスタッフの対応"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-pink-400 focus:outline-none"
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-semibold text-slate-700">職場環境</span>
              <textarea
                name="workEnvironmentComment"
                value={form.workEnvironmentComment}
                onChange={handleContentChange}
                rows={3}
                placeholder="待機室・備品・寮など働く環境について"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-pink-400 focus:outline-none"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span className="font-semibold text-slate-700">連絡用メールアドレス（任意）</span>
              <input
                type="email"
                name="emailAddress"
                value={form.emailAddress}
                onChange={handleContentChange}
                placeholder="example@makoto-club.jp"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-pink-400 focus:outline-none"
              />
            </label>
            <div className="space-y-2 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold text-slate-700">選択済み画像</span>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 px-3 py-1.5 text-xs font-semibold text-white shadow hover:from-pink-400 hover:to-violet-400 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => canAddMoreImages && fileInputRef.current?.click()}
                  disabled={!canAddMoreImages}
                >
                  📷 画像を追加
                </button>
              </div>
              <span className="text-xs text-slate-500">
                {form.imageUrls.length > 0
                  ? `${form.imageUrls.length}/${MAX_IMAGES}件の画像を選択中`
                  : `画像は未選択です (${MAX_IMAGES}枚まで)`}
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(event) => handleImageUpload(event.target.files)}
              />
              {imageError ? (
                <p className="text-xs text-red-600">{imageError}</p>
              ) : null}
              {form.imageUrls.length === 0 ? (
                <p className="text-xs text-slate-500">まだ画像が選択されていません。</p>
              ) : (
                <ul className="space-y-2 rounded-xl border border-slate-100 bg-white/80 p-3 text-xs text-slate-600 shadow-inner">
                  {form.imageUrls.map((image, index) => (
                    <li key={`${image.url}-${index}`} className="flex w-full items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image.url}
                        alt={image.name}
                        className="h-12 w-12 flex-shrink-0 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-xs font-semibold text-slate-700" title={image.name}>
                          {formatFilename(image.name)}
                        </p>
                        <p className="text-[10px] text-slate-400">{formatImageSize(image.size)}</p>
                      </div>
                      <button
                        type="button"
                        className="text-pink-500 hover:text-pink-400"
                        onClick={() => handleRemoveImage(index)}
                      >
                        削除
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <label className="space-y-2 text-sm">
            <span className="font-semibold text-slate-700">満足度</span>
            <div className="flex items-center gap-3">
              <StarDisplay value={Number(form.rating) || 0} />
              <span className="text-xs text-slate-500">
                {(Number(form.rating) || 0).toFixed(1)} / {RATING_MAX.toFixed(1)}
              </span>
            </div>
            <input
              type="range"
              name="rating"
              value={Number(form.rating) || 0}
              onChange={handleContentChange}
              min={RATING_MIN}
              max={RATING_MAX}
              step={RATING_STEP}
              className="w-full accent-pink-500"
            />
            <div className="flex justify-between text-xs text-slate-500">
              <span>0</span>
              <span>2.5</span>
              <span>5.0</span>
            </div>
          </label>

          <div className="flex justify-end">
            <button
              type="submit"
              className="w-full rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow disabled:opacity-60 sm:w-auto"
              disabled={savingContent || !isContentDirty}
            >
              {savingContent ? submitSavingLabel : submitLabel}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">メタ情報</h2>
        <dl className="mt-4 grid gap-2 text-sm text-slate-600">
          <div className="flex gap-3">
            <dt className="w-32 font-semibold">投稿ID</dt>
            <dd>{survey.surveyerId ?? '—'}</dd>
          </div>
          <div className="flex gap-3">
            <dt className="w-32 font-semibold">投稿者</dt>
            <dd>
              {survey.surveyerHandle ? `@${survey.surveyerHandle}` : survey.surveyerName ?? '匿名'}
            </dd>
          </div>
          <div className="flex gap-3">
            <dt className="w-32 font-semibold">総評</dt>
            <dd>{survey.rating.toFixed(1)} / 5</dd>
          </div>
          <div className="flex gap-3">
            <dt className="w-32 font-semibold">投稿日時</dt>
            <dd>{formatDate(survey.createdAt)}</dd>
          </div>
          <div className="flex gap-3">
            <dt className="w-32 font-semibold">最終更新</dt>
            <dd>{formatDate(survey.updatedAt)}</dd>
          </div>
          <div className="flex gap-3">
            <dt className="w-32 font-semibold">審査日時</dt>
            <dd>{formatDate(survey.surveyedAt)}</dd>
          </div>
          <div className="flex gap-3">
            <dt className="w-32 font-semibold">報酬送付日時</dt>
            <dd>{formatDate(survey.rewardSentAt)}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
