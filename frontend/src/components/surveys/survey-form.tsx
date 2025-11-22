'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

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
import {
  AUTH_UPDATE_EVENT,
  TwitterLoginResult,
  readStoredAuth,
  startTwitterLogin,
} from '@/lib/twitter-auth';
import { uploadImage } from '@/lib/media-upload';
import Link from 'next/link';

type FormValues = {
  storeName: string;
  branchName: string;
  prefecture: string;
  category: string;
  visitedAt: string;
  workType: string;
  age: string;
  specScore?: number;
  waitTimeHours: string;
  averageEarning: string;
  customerComment: string;
  staffComment: string;
  workEnvironmentComment: string;
  emailAddress: string;
  rating?: number;
};

const DEFAULT_FORM_VALUES: FormValues = {
  storeName: '',
  branchName: '',
  prefecture: '',
  category: '',
  visitedAt: '',
  workType: '',
  age: '',
  specScore: undefined,
  waitTimeHours: '',
  averageEarning: '',
  customerComment: '',
  staffComment: '',
  workEnvironmentComment: '',
  emailAddress: '',
  rating: undefined,
};

const TWITTER_AUTH_BASE_URL = process.env.NEXT_PUBLIC_TWITTER_AUTH_BASE_URL ?? '';
const PENDING_SURVEY_STORAGE_KEY = 'makotoClubPendingSurvey';

const storePendingSurvey = (values: FormValues) => {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(PENDING_SURVEY_STORAGE_KEY, JSON.stringify(values));
  } catch (error) {
    console.error('Pending survey の保存に失敗しました', error);
  }
};

const readPendingSurvey = (): FormValues | undefined => {
  if (typeof window === 'undefined') return undefined;
  const raw = sessionStorage.getItem(PENDING_SURVEY_STORAGE_KEY);
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw) as Partial<FormValues>;
    return { ...DEFAULT_FORM_VALUES, ...parsed };
  } catch {
    return undefined;
  }
};

const clearPendingSurvey = () => {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(PENDING_SURVEY_STORAGE_KEY);
};

const RATING_MIN = 0;
const RATING_MAX = 5;
const RATING_STEP = 0.1;
const MAX_IMAGES = 5;
const MAX_IMAGE_SIZE_MB = 3;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
const ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

const formatSpecScoreLabel = (value: number) => {
  if (value <= SPEC_MIN) {
    return SPEC_MIN_LABEL;
  }
  if (value >= SPEC_MAX) {
    return SPEC_MAX_LABEL;
  }
  return `${value}`;
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

const formatImageSize = (bytes: number) => {
  if (!bytes || bytes <= 0) return '-';
  const mb = bytes / (1024 * 1024);
  if (mb < 0.1) return '0.1MB以下';
  return `${mb.toFixed(1)}MB`;
};

const StarDisplay = ({ value }: { value: number }) => {
  const clamped = Math.max(RATING_MIN, Math.min(RATING_MAX, value));
  return (
    <span className="relative inline-block text-xl leading-none">
      <span className="text-slate-300">★★★★★</span>
      <span
        className="absolute left-0 top-0 overflow-hidden text-yellow-400"
        style={{ width: `${(clamped / RATING_MAX) * 100}%` }}
      >
        ★★★★★
      </span>
    </span>
  );
};

export const SurveyForm = () => {
  const [auth, setAuth] = useState<TwitterLoginResult | undefined>();
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [, setAuthLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const hasAutoSubmitted = useRef(false);
  const [images, setImages] = useState<{ url: string; name: string; size: number }[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const canAddMoreImages = images.length < MAX_IMAGES && !uploadingImage;
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0 || uploadingImage) return;
    const fileArray = Array.from(files);
    const isAllowedFile = (file: File) => {
      const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
      const byMime = file.type ? ALLOWED_MIME_TYPES.includes(file.type) : false;
      const byExt = ALLOWED_IMAGE_EXTENSIONS.includes(ext);
      return (byMime || byExt) && file.size <= MAX_IMAGE_SIZE_BYTES;
    };
    const invalid = fileArray.filter((file) => !isAllowedFile(file));
    if (invalid.length > 0) {
      const names = invalid.map((file) => file.name || '不明なファイル').join(', ');
      setImageError(`対応していない形式またはサイズです (${MAX_IMAGE_SIZE_MB}MB以内の画像のみ): ${names}`);
    } else {
      setImageError(null);
    }

    const validFiles = fileArray.filter((file) => isAllowedFile(file));
    if (validFiles.length === 0) return;

    setUploadingImage(true);
    try {
      const remaining = MAX_IMAGES - images.length;
      if (remaining <= 0) {
        return;
      }
      for (const file of validFiles.slice(0, remaining)) {
        const url = await uploadImage(file);
        setImages((prev) => [
          ...prev,
          {
            url,
            name: file.name || `画像${prev.length + 1}`,
            size: file.size,
          },
        ]);
      }
    } catch (error) {
      console.error(error);
      setImageError('画像のアップロードに失敗しました。時間を置いて再度お試しください。');
    } finally {
      setUploadingImage(false);
    }
  }, [images.length, uploadingImage]);

  const handleRemoveImage = useCallback((index: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== index));
  }, []);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: DEFAULT_FORM_VALUES,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const current = readStoredAuth();
    if (current) {
      setAuth(current);
    }

    const listener: EventListener = (event) => {
      const custom = event as CustomEvent<TwitterLoginResult>;
      if (!custom.detail) return;
      setAuth(custom.detail);
      setErrorMessage('');
      setStatus('idle');
      hasAutoSubmitted.current = false;
    };

    window.addEventListener(AUTH_UPDATE_EVENT, listener);
    return () => {
      window.removeEventListener(AUTH_UPDATE_EVENT, listener);
    };
  }, []);

  const handleTwitterLogin = useCallback(async () => {
    if (typeof window === 'undefined') return;
    if (!TWITTER_AUTH_BASE_URL) {
      setErrorMessage('Xログインのエンドポイントが設定されていません。');
      setStatus('error');
      return;
    }

    setAuthLoading(true);
    setErrorMessage('');

    try {
      await startTwitterLogin(TWITTER_AUTH_BASE_URL);
      setStatus('idle');
    } catch (error) {
      console.error(error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Xログインに失敗しました。時間を置いて再度お試しください。',
      );
      setStatus('error');
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const onSubmit = useCallback(
    async (values: FormValues) => {
      if (!auth?.accessToken) {
        storePendingSurvey(values);
        hasAutoSubmitted.current = false;
        handleTwitterLogin();
        return;
      }

      setStatus('submitting');
      setErrorMessage('');

      const payload = {
        storeName: values.storeName.trim(),
        branchName: values.branchName.trim(),
        prefecture: values.prefecture,
        category: values.category,
        visitedAt: values.visitedAt,
        workType: values.workType,
        age: Number(values.age),
        specScore: values.specScore ?? SPEC_MIN,
        waitTimeHours: Number(values.waitTimeHours),
        averageEarning: Number(values.averageEarning),
        customerComment: values.customerComment.trim(),
        staffComment: values.staffComment.trim(),
        workEnvironmentComment: values.workEnvironmentComment.trim(),
        emailAddress: values.emailAddress.trim() || undefined,
        imageUrls: images.map((item) => item.url),
        rating: values.rating ?? RATING_MIN,
      };

      try {
        const response = await fetch(`${API_BASE_URL}/api/surveys`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${auth.accessToken}`,
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json().catch(() => null);
        if (!response.ok) {
          if (response.status === 401) {
            storePendingSurvey(values);
            setStatus('idle');
            setErrorMessage('');
            hasAutoSubmitted.current = false;
            setAuth(undefined);
            handleTwitterLogin();
            return;
          }
          const message =
            data &&
            typeof data === 'object' &&
            data !== null &&
            'error' in data &&
            typeof data.error === 'string'
              ? data.error
              : '投稿に失敗しました。時間を置いて再度お試しください。';
          throw new Error(message);
        }

        if (data && typeof window !== 'undefined') {
          console.info('投稿結果', data);
        }

        setStatus('success');
        reset(DEFAULT_FORM_VALUES);
        setImages([]);
        setImageError(null);
        clearPendingSurvey();
        hasAutoSubmitted.current = false;
        setShowSuccessModal(true);
      } catch (error) {
        console.error(error);
        setErrorMessage('投稿に失敗しました。時間を置いて再度お試しください。');
        setStatus('error');
      }
    },
    [auth, handleTwitterLogin, images, reset],
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!auth?.accessToken) return;
    if (hasAutoSubmitted.current) return;

    const pending = readPendingSurvey();
    if (!pending) return;

    hasAutoSubmitted.current = true;
    reset(pending);
    setImages([]);
    setTimeout(() => {
      void handleSubmit(onSubmit)();
    }, 0);
  }, [auth, handleSubmit, onSubmit, reset]);

  return (
    <section className="space-y-6 rounded-3xl border border-slate-100 bg-white p-6 shadow-lg">
      <header className="space-y-3">
        <h1 className="text-xl font-semibold text-slate-900">アンケートを投稿する</h1>
        <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
          <p className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-black font-semibold text-white">𝕏</span>
            アンケートの審査後に報酬を 𝕏 のDMでお送りします (PayPay 1,000 円分)
          </p>
        </div>
      </header>

      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <Field label="店舗名" required error={errors.storeName?.message}>
          <input
            id="storeName"
            type="text"
            placeholder="例: やりすぎ娘"
            {...register('storeName', { required: '店舗名は必須です' })}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-pink-400 focus:ring-2 focus:ring-pink-100 focus:outline-none"
          />
        </Field>

        <Field label="支店名" error={errors.branchName?.message}>
          <input
            id="branchName"
            type="text"
            placeholder="例: 新宿店"
            {...register('branchName')}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-pink-400 focus:ring-2 focus:ring-pink-100 focus:outline-none"
          />
        </Field>

        <Field label="都道府県" required error={errors.prefecture?.message}>
          <select
            id="prefecture"
            {...register('prefecture', { required: '都道府県を選択してください' })}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-pink-400 focus:ring-2 focus:ring-pink-100 focus:outline-none"
          >
            <option value="">選択してください</option>
            {PREFECTURES.map((prefecture) => (
              <option key={prefecture} value={prefecture}>
                {prefecture}
              </option>
            ))}
          </select>
        </Field>

        <Field label="業種" required error={errors.category?.message}>
          <select
            id="category"
            {...register('category', { required: '業種を選択してください' })}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-pink-400 focus:ring-2 focus:ring-pink-100 focus:outline-none"
          >
            <option value="">選択してください</option>
            {SURVEY_CATEGORIES.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="働いた時期" required error={errors.visitedAt?.message}>
          <input
            id="visitedAt"
            type="month"
            {...register('visitedAt', { required: '働いた時期を入力してください' })}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-pink-400 focus:ring-2 focus:ring-pink-100 focus:outline-none"
          />
        </Field>

        <Field label="勤務形態" required error={errors.workType?.message}>
          <select
            id="workType"
            {...register('workType', { required: '勤務形態を選択してください' })}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-pink-400 focus:ring-2 focus:ring-pink-100 focus:outline-none"
          >
            <option value="">選択してください</option>
            <option value="在籍">在籍</option>
            <option value="出稼ぎ">出稼ぎ</option>
          </select>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="年齢" required error={errors.age?.message}>
            <select
              id="age"
              {...register('age', { required: '年齢を選択してください' })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-pink-400 focus:ring-2 focus:ring-pink-100 focus:outline-none"
            >
              <option value="">選択してください</option>
              {AGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="スペック" required error={errors.specScore?.message}>
            <Controller
              name="specScore"
              control={control}
              rules={{
                validate: (value) =>
                  typeof value === 'number' && !Number.isNaN(value)
                    ? true
                    : 'スペックを選択してください',
              }}
              render={({ field }) => (
                <div className="space-y-2">
                  <input
                    id="specScore"
                    type="range"
                    min={SPEC_MIN}
                    max={SPEC_MAX}
                    step={1}
                    value={field.value ?? SPEC_MIN}
                    onChange={(event) => field.onChange(Number(event.target.value))}
                    className="w-full accent-pink-500"
                  />
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{SPEC_MIN_LABEL}</span>
                    <span className="text-sm font-semibold text-slate-700">
                      {field.value === undefined ? '未選択' : formatSpecScoreLabel(field.value)}
                    </span>
                    <span>{SPEC_MAX_LABEL}</span>
                  </div>
                </div>
              )}
            />
          </Field>

          <Field label="待機時間" required error={errors.waitTimeHours?.message}>
            <select
              id="waitTimeHours"
              {...register('waitTimeHours', { required: '待機時間を選択してください' })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-pink-400 focus:ring-2 focus:ring-pink-100 focus:outline-none"
            >
              <option value="">選択してください</option>
              {WAIT_TIME_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="平均稼ぎ" required error={errors.averageEarning?.message}>
            <select
              id="averageEarning"
              {...register('averageEarning', { required: '平均稼ぎを選択してください' })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-pink-400 focus:ring-2 focus:ring-pink-100 focus:outline-none"
            >
              <option value="">選択してください</option>
              {AVERAGE_EARNING_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="客層の印象" error={errors.customerComment?.message}>
          <textarea
            id="customerComment"
            rows={4}
            placeholder="客層の特徴や接客時の印象など"
            {...register('customerComment')}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-pink-400 focus:ring-2 focus:ring-pink-100 focus:outline-none"
          />
        </Field>

        <Field label="スタッフ対応" error={errors.staffComment?.message}>
          <textarea
            id="staffComment"
            rows={4}
            placeholder="講習やサポート、送迎などスタッフの対応について"
            {...register('staffComment')}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-pink-400 focus:ring-2 focus:ring-pink-100 focus:outline-none"
          />
        </Field>

        <Field label="職場環境" error={errors.workEnvironmentComment?.message}>
          <textarea
            id="workEnvironmentComment"
            rows={4}
            placeholder="待機室・備品・寮など働く環境について"
            {...register('workEnvironmentComment')}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-pink-400 focus:ring-2 focus:ring-pink-100 focus:outline-none"
          />
        </Field>

        <Field label="連絡先メールアドレス (任意)" error={errors.emailAddress?.message}>
          <input
            id="emailAddress"
            type="email"
            placeholder="example@makoto-club.jp"
            {...register('emailAddress')}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-pink-400 focus:ring-2 focus:ring-pink-100 focus:outline-none"
          />
        </Field>

        <div className="space-y-3 rounded-2xl border border-dashed border-slate-200 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-semibold text-sm text-slate-800">写真 (任意)</p>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 px-3 py-1.5 text-xs font-semibold text-white shadow hover:from-pink-400 hover:to-violet-400 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => canAddMoreImages && fileInputRef.current?.click()}
              disabled={!canAddMoreImages}
            >
              📷 画像を追加
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(event) => handleImageUpload(event.target.files)}
            />
          </div>
          <p className="text-xs text-slate-500">
            {images.length > 0 ? `${images.length}/${MAX_IMAGES}件の画像を選択中` : 'まだ画像は選択されていません'}
          </p>
          {imageError ? (
            <p className="text-xs text-red-600">{imageError}</p>
          ) : null}
          {images.length > 0 ? (
            <ul className="space-y-2 rounded-xl border border-slate-100 bg-white/80 p-3 text-xs text-slate-600 shadow-inner">
              {images.map((image, index) => (
                <li key={`${image.url}-${index}`} className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.url}
                    alt={image.name}
                    className="h-12 w-12 flex-shrink-0 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-700" title={image.name}>
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
          ) : null}
        </div>

        <Field label="満足度" required error={errors.rating?.message}>
          <Controller
            name="rating"
            control={control}
            rules={{
              validate: (value) =>
                typeof value === 'number' && value >= RATING_MIN && value <= RATING_MAX
                  ? true
                  : '満足度を0〜5の範囲で選択してください',
            }}
            render={({ field }) => (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <StarDisplay value={field.value ?? 0} />
                  <span className="text-sm text-slate-600">
                    {field.value !== undefined ? field.value.toFixed(1) : '未選択'} / {RATING_MAX.toFixed(1)}
                  </span>
                </div>
                <input
                  id="rating"
                  type="range"
                  min={RATING_MIN}
                  max={RATING_MAX}
                  step={RATING_STEP}
                  value={field.value ?? 0}
                  onChange={(event) => {
                    const numeric = Number(event.target.value);
                    const clamped = Math.min(RATING_MAX, Math.max(RATING_MIN, numeric));
                    const rounded = Math.round(clamped * 10) / 10;
                    field.onChange(rounded);
                  }}
                  className="w-full accent-pink-500"
                />
                <div className="flex justify-between text-xs text-slate-500">
                  <span>0</span>
                  <span>2.5</span>
                  <span>5.0</span>
                </div>
              </div>
            )}
          />
        </Field>

        <div className="space-y-2 rounded-2xl bg-slate-50 p-4 text-xs text-slate-500">
          <p>虚偽の情報が含まれる場合、掲載を停止することがあります。</p>
          <p>アンケートの内容は<Link href="/privacy"><span className="underline"> プライバシーポリシー </span></Link>に準じてWEBサイト内・または<Link href="#"><span className="underline">𝕏マコトクラブ</span></Link>で公開されます。</p>
        </div>

        {status === 'success' ? (
          <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            投稿ありがとうございます！運営チームが内容を確認後、TwitterのDMで特典のご案内をお送りします。
          </p>
        ) : null}

        {status === 'error' && errorMessage ? (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</p>
        ) : null}

        <button
          type="submit"
          disabled={status === 'submitting'}
          className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-violet-500 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-pink-400 hover:to-violet-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === 'submitting' ? '送信中...' : '投稿する'}
        </button>
      </form>

      {showSuccessModal ? (
        <div className="fixed inset-0 z-[210] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <div className="space-y-3 text-center">
              <h2 className="text-lg font-semibold text-slate-900">投稿を受け付けました</h2>
              <p className="text-sm text-slate-600">
                アンケートありがとうございます！内容を審査後、𝕏 の DM（@
                {auth?.twitterUser?.username ?? '---'}）へ PayPay 1,000 円分のリンクをご案内します。
              </p>
              <p className="text-xs text-slate-400">
                審査には最大で 2〜3 営業日ほどお時間をいただく場合があります。
              </p>
            </div>
            <button
              type="button"
              className="mt-6 w-full rounded-full bg-gradient-to-r from-pink-500 to-violet-500 px-4 py-2 text-sm font-semibold text-white transition hover:from-pink-400 hover:to-violet-400"
              onClick={() => setShowSuccessModal(false)}
            >
              OK
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
};

type FieldProps = {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  error?: string;
};

const Field = ({ label, required, children, error }: FieldProps) => {
  return (
    <div className="space-y-1 text-sm">
      <label className="font-semibold text-slate-700">
        {label}
        {required ? <span className="ml-1 text-pink-600">*</span> : null}
      </label>
      {children}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
};
