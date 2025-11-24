'use client';

import { useMemo, useState } from 'react';

import { SurveyCard } from '@/components/surveys/survey-card';
import type { SurveySummary } from '@/types/survey';

const PAGE_SIZE = 5;

type Props = {
  surveys: SurveySummary[];
};

export const StoreSurveyList = ({ surveys }: Props) => {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(surveys.length / PAGE_SIZE));

  const currentPage = Math.min(page, totalPages);

  const items = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return surveys.slice(start, start + PAGE_SIZE);
  }, [currentPage, surveys]);

  if (surveys.length === 0) {
    return <p className="rounded-2xl bg-slate-100 px-4 py-6 text-sm text-slate-500">まだアンケートが登録されていません。</p>;
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((survey) => (
          <SurveyCard key={survey.id} survey={survey} />
        ))}
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 text-sm">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-full border border-slate-200 px-3 py-1 text-slate-700 transition hover:border-pink-200 hover:text-pink-600 disabled:cursor-not-allowed disabled:border-slate-100 disabled:text-slate-300"
            disabled={currentPage === 1}
          >
            前へ
          </button>
          <span className="text-xs text-slate-500">
            {currentPage} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="rounded-full border border-slate-200 px-3 py-1 text-slate-700 transition hover:border-pink-200 hover:text-pink-600 disabled:cursor-not-allowed disabled:border-slate-100 disabled:text-slate-300"
            disabled={currentPage === totalPages}
          >
            次へ
          </button>
        </div>
      )}
    </div>
  );
};
