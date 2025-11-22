import { PREFECTURES, SURVEY_CATEGORIES } from '@/constants/filters';
import { SectionCard, SectionHeader } from '@/components/common/section';

type StoreFilterPanelProps = {
  prefecture: string;
  industry: string;
  keyword: string;
  page: number;
  totalPages: number;
  onPrefectureChange: (value: string) => void;
  onIndustryChange: (value: string) => void;
  onKeywordChange: (value: string) => void;
  onReload: () => void;
  loading: boolean;
  total: number;
};

export const StoreFilterPanel = ({
  prefecture,
  industry,
  keyword,
  page,
  totalPages,
  onPrefectureChange,
  onIndustryChange,
  onKeywordChange,
  onReload,
  loading,
  total,
}: StoreFilterPanelProps) => (
  <SectionCard>
    <SectionHeader
      title="条件で絞り込む"
      description="都道府県・業種・店舗名で検索できます。"
    />
    <div className="grid gap-4 md:grid-cols-4">
      <div>
        <label className="text-xs font-semibold text-slate-500" htmlFor="admin-store-prefecture">
          都道府県
        </label>
        <select
          id="admin-store-prefecture"
          value={prefecture}
          onChange={(event) => onPrefectureChange(event.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-pink-400 focus:outline-none"
        >
          <option value="">指定なし</option>
          {PREFECTURES.map((pref) => (
            <option key={pref} value={pref}>
              {pref}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-xs font-semibold text-slate-500" htmlFor="admin-store-industry">
          業種
        </label>
        <select
          id="admin-store-industry"
          value={industry}
          onChange={(event) => onIndustryChange(event.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-pink-400 focus:outline-none"
        >
          <option value="">指定なし</option>
          {SURVEY_CATEGORIES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>
      <div className="md:col-span-2">
        <label className="text-xs font-semibold text-slate-500" htmlFor="admin-store-keyword">
          店舗名/支店名
        </label>
        <input
          id="admin-store-keyword"
          value={keyword}
          onChange={(event) => onKeywordChange(event.target.value)}
          placeholder="店舗名の一部で検索"
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-pink-400 focus:outline-none"
        />
      </div>
    </div>
    <div className="mt-4 flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={onReload}
        className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow disabled:opacity-60"
        disabled={loading}
      >
        {loading ? '読み込み中…' : '再読み込み'}
      </button>
      <p className="text-xs text-slate-500">
        該当件数: {total} 件 / ページ {page} / {totalPages}
      </p>
    </div>
  </SectionCard>
);
