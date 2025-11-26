'use client';

import { ChangeEvent, FormEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import {
  PREFECTURES,
  STORE_AREAS,
  STORE_GENRES,
  SURVEY_CATEGORIES,
} from '@/constants/filters';
import { API_BASE_URL } from '@/lib/api-base';
import type { AdminStoreRecord } from '@/types/admin-store';

type StoreRequestPayload = {
  name: string;
  branchName?: string | null;
  prefecture: string;
  area?: string | null;
  industry: string;
  genre?: string | null;
  unitPrice?: string | null;
  businessHours?: {
    open: string;
    close: string;
  } | null;
};

const formatDate = (value?: string) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
};

type AdminStoreEditorProps = {
  initialStore?: AdminStoreRecord;
};

export function AdminStoreEditor({ initialStore }: AdminStoreEditorProps) {
  const router = useRouter();
  const isNew = !initialStore?.id;

  const [store, setStore] = useState<AdminStoreRecord | undefined>(initialStore);
  const [form, setForm] = useState({
    name: initialStore?.name ?? '',
    branchName: initialStore?.branchName ?? '',
    prefecture: initialStore?.prefecture ?? '',
    area: initialStore?.area ?? '',
    industry: initialStore?.industry ?? '',
    genre: initialStore?.genre ?? '',
    unitPrice: initialStore?.unitPrice ?? '',
    open: initialStore?.businessHours?.open ?? '',
    close: initialStore?.businessHours?.close ?? '',
  });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showCreatedModal, setShowCreatedModal] = useState(false);
  const currentBaseline = store ?? initialStore;

  const baselineForm = useMemo(() => {
    if (!currentBaseline) return null;
    return {
      name: currentBaseline.name ?? '',
      branchName: currentBaseline.branchName ?? '',
      prefecture: currentBaseline.prefecture ?? '',
      area: currentBaseline.area ?? '',
      industry: currentBaseline.industry ?? '',
      genre: currentBaseline.genre ?? '',
      unitPrice: currentBaseline.unitPrice ?? '',
      open: currentBaseline.businessHours?.open ?? '',
      close: currentBaseline.businessHours?.close ?? '',
    };
  }, [currentBaseline]);

  const isDirty = useMemo(() => {
    if (isNew) return true;
    if (!baselineForm) return false;
    return (
      form.name !== baselineForm.name ||
      form.branchName !== baselineForm.branchName ||
      form.prefecture !== baselineForm.prefecture ||
      form.area !== baselineForm.area ||
      form.industry !== baselineForm.industry ||
      form.genre !== baselineForm.genre ||
      form.unitPrice !== baselineForm.unitPrice ||
      form.open !== baselineForm.open ||
      form.close !== baselineForm.close
    );
  }, [baselineForm, form, isNew]);

  const title = isNew ? '新規店舗の登録' : '店舗情報の編集';

  const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const buildPayload = (): StoreRequestPayload | null => {
    if (!form.name.trim()) {
      setError('店舗名を入力してください。');
      return null;
    }
    if (!form.prefecture) {
      setError('都道府県を選択してください。');
      return null;
    }
    if (!form.industry) {
      setError('業種を選択してください。');
      return null;
    }
    const payload: StoreRequestPayload = {
      name: form.name.trim(),
      branchName: form.branchName.trim() ? form.branchName.trim() : null,
      prefecture: form.prefecture,
      area: form.area.trim() ? form.area.trim() : null,
      industry: form.industry,
      genre: form.genre.trim() ? form.genre.trim() : null,
    };
    if (form.unitPrice.trim()) {
      payload.unitPrice = form.unitPrice.trim();
    } else {
      payload.unitPrice = null;
    }
    if (form.open && form.close) {
      payload.businessHours = { open: form.open, close: form.close };
    } else {
      payload.businessHours = null;
    }
    return payload;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage(null);
    setError(null);
    const payload = buildPayload();
    if (!payload) return;

    try {
      setSaving(true);
      const target = isNew
        ? `${API_BASE_URL}/api/admin/stores`
        : `${API_BASE_URL}/api/admin/stores/${store?.id}`;
      const method = isNew ? 'POST' : 'PUT';
      const response = await fetch(target, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const body = await response.text().catch(() => '');
        throw new Error(body || '店舗情報の保存に失敗しました');
      }
      const updated = (await response.json()) as AdminStoreRecord;
      if (isNew) {
        // 新規作成後はフォームを初期化し、メタ情報も非表示に戻す
        setStore(undefined);
        setForm({
          name: '',
          branchName: '',
          prefecture: '',
          area: '',
          industry: '',
          genre: '',
          unitPrice: '',
          open: '',
          close: '',
        });
        setMessage(null);
        setShowCreatedModal(true);
        // 同じ新規画面に留まるが、空状態に戻す
      } else {
        setStore(updated);
        setForm({
          name: updated.name,
          branchName: updated.branchName ?? '',
          prefecture: updated.prefecture,
          area: updated.area ?? '',
          industry: updated.industry,
          genre: updated.genre ?? '',
          unitPrice: updated.unitPrice ?? '',
          open: updated.businessHours?.open ?? '',
          close: updated.businessHours?.close ?? '',
        });
        setMessage('店舗情報を保存しました。');
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '店舗情報の保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!store?.id) return;
    if (!confirm('この店舗を削除します。よろしいですか？')) {
      return;
    }
    setError(null);
    setMessage(null);
    try {
      setDeleting(true);
      const response = await fetch(`${API_BASE_URL}/api/admin/stores/${store.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const body = await response.text().catch(() => '');
        throw new Error(body || '店舗の削除に失敗しました');
      }
      router.push('/admin/stores');
    } catch (err) {
      setError(err instanceof Error ? err.message : '店舗の削除に失敗しました');
    } finally {
      setDeleting(false);
    }
  };

  const metadata = useMemo(() => {
    if (!store) return null;
    return (
      <dl className="grid gap-2 text-xs text-slate-500 sm:grid-cols-2">
        <div>
          <dt className="font-semibold text-slate-600">店舗ID</dt>
          <dd className="mt-1 font-mono">{store.id}</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-600">平均評価</dt>
          <dd className="mt-1">{store.averageRating.toFixed(1)}</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-600">作成日時</dt>
          <dd className="mt-1">{formatDate(store.createdAt)}</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-600">更新日時</dt>
          <dd className="mt-1">{formatDate(store.updatedAt)}</dd>
        </div>
      </dl>
    );
  }, [store]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
      {showCreatedModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-900">店舗の登録をしました</h2>
            <p className="mt-2 text-sm text-slate-600">引き続き、店舗一覧から確認や編集ができます。</p>
            <div className="mt-4 flex gap-2">
              <a
                href="/admin/stores"
                className="flex-1 rounded-full bg-pink-600 px-4 py-2 text-center text-sm font-semibold text-white shadow hover:bg-pink-500"
              >
                店舗一覧へ
              </a>
              <button
                type="button"
                onClick={() => setShowCreatedModal(false)}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <header>
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        <p className="text-sm text-slate-500">
          店舗名・ロケーション・業種などを編集し、保存ボタンで反映してください。
        </p>
      </header>

      {message ? <p className="rounded-lg bg-green-50 px-4 py-2 text-sm text-green-700">{message}</p> : null}
      {error ? <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p> : null}

      <section className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-600" htmlFor="name">
            店舗名 *
          </label>
          <input
            id="name"
            name="name"
            value={form.name}
            onChange={handleInputChange}
            placeholder="やりすぎ娘"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-pink-400 focus:outline-none"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-600" htmlFor="branchName">
            支店名
          </label>
          <input
            id="branchName"
            name="branchName"
            value={form.branchName}
            onChange={handleInputChange}
            placeholder="五反田店"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-pink-400 focus:outline-none"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-600" htmlFor="prefecture">
            都道府県 *
          </label>
          <select
            id="prefecture"
            name="prefecture"
            value={form.prefecture}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-pink-400 focus:outline-none"
          >
            <option value="">選択してください</option>
            {PREFECTURES.map((pref) => (
              <option key={pref} value={pref}>
                {pref}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-600" htmlFor="area">
            エリア
          </label>
          <select
            id="area"
            name="area"
            value={form.area}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-pink-400 focus:outline-none"
          >
            <option value="">指定なし</option>
            {STORE_AREAS.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-600" htmlFor="industry">
            業種 *
          </label>
          <select
            id="industry"
            name="industry"
            value={form.industry}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-pink-400 focus:outline-none"
          >
            <option value="">選択してください</option>
            {SURVEY_CATEGORIES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-600" htmlFor="genre">
            ジャンル
          </label>
          <select
            id="genre"
            name="genre"
            value={form.genre}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-pink-400 focus:outline-none"
          >
            <option value="">指定なし</option>
            {STORE_GENRES.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-600" htmlFor="unitPrice">
            キャストバック (60分単価)
          </label>
          <input
            id="unitPrice"
            name="unitPrice"
            type="text"
            placeholder="例: 10000 / 1万円 / 応相談"
            value={form.unitPrice}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-pink-400 focus:outline-none"
          />
          <p className="text-xs text-slate-500">
            任意 / 文字列で入力された値をそのまま保存します。
          </p>
        </div>
        <div className="md:col-span-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600" htmlFor="open">
                営業開始時間 (HH:MM)
              </label>
              <input
                id="open"
                name="open"
                value={form.open}
                onChange={handleInputChange}
                placeholder="10:00"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-pink-400 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600" htmlFor="close">
                営業終了時間 (HH:MM)
              </label>
              <input
                id="close"
                name="close"
                value={form.close}
                onChange={handleInputChange}
                placeholder="23:00"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-pink-400 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </section>

      {metadata ? (
        <section className="rounded-2xl bg-slate-50 p-4">
          <h2 className="text-sm font-semibold text-slate-700">メタ情報</h2>
          <div className="mt-2">{metadata}</div>
        </section>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          className="rounded-full bg-pink-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-pink-500 disabled:opacity-60"
          disabled={saving || (!isNew && !isDirty)}
        >
          {isNew ? (saving ? '保存中…' : '保存する') : saving ? '更新中…' : '更新する'}
        </button>
        {!isNew ? (
          <button
            type="button"
            onClick={() => void handleDelete()}
            className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
            disabled={deleting}
          >
            {deleting ? '削除中…' : 'この店舗を削除'}
          </button>
        ) : null}
      </div>
    </form>
  );
}
