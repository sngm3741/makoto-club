import Link from 'next/link';

import { SurveyCard } from '@/components/surveys/survey-card';
import type { SurveySummary } from '@/types/survey';

type SurveyShowcaseProps = {
  title: string;
  linkHref: string;
  linkLabel?: string;
  surveys: SurveySummary[];
};

export const SurveyShowcase = ({ title, linkHref, linkLabel = 'もっと見る →', surveys }: SurveyShowcaseProps) => {
  return (
    <section className="space-y-6">
      <div className="flex items-baseline justify-between">
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
        <Link href={linkHref} className="text-sm font-semibold text-pink-600 hover:text-pink-500">
          {linkLabel}
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {surveys.map((survey) => (
          <SurveyCard key={survey.id} survey={survey} />
        ))}
      </div>
    </section>
  );
};
