import { SectionCard, SectionHeader } from '@/components/common/section';

import { STATUS_OPTIONS } from '../constants';
import type { StatusFilter } from '../hooks/use-admin-survey-list';

type SurveyFilterBarProps = {
  status: StatusFilter;
  onStatusChange: (value: StatusFilter) => void;
  onReload: () => void;
  loading: boolean;
};

export const SurveyFilterBar = ({
  status,
  onStatusChange,
  onReload,
  loading,
}: SurveyFilterBarProps) => (
  <SectionCard>
    <SectionHeader
      title="審査状況で絞り込む"
      description="ステータスを切り替えて、必要なアンケートのみ表示します。"
    />
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={status}
        onChange={(event) => onStatusChange(event.target.value as StatusFilter)}
        className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-pink-400 focus:outline-none"
      >
        {STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={onReload}
        className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow disabled:opacity-60"
        disabled={loading}
      >
        {loading ? '読み込み中…' : '再読み込み'}
      </button>
    </div>
  </SectionCard>
);
