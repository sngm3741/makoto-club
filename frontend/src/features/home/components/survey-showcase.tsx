import Link from 'next/link';

import { SectionPillTitle } from '@/components/common/section';
import { SurveyCard } from '@/components/surveys/survey-card';
import type { SurveySummary } from '@/types/survey';

type SurveyShowcaseProps = {
  title: string;
  linkHref: string;
  linkLabel?: string;
  surveys: SurveySummary[];
};

export const SurveyShowcase = ({ title, linkHref, linkLabel = 'もっと見る', surveys }: SurveyShowcaseProps) => {
  return (
    <section className="space-y-4">
      <SectionPillTitle label={title} linkHref={linkHref} />
      <div className="grid gap-4 md:grid-cols-3">
        {surveys.map((survey) => (
          <SurveyCard key={survey.id} survey={survey} />
        ))}
      </div>
      <div className="space-y-2">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
        <div className="flex justify-center">
        <Link
          href={linkHref}
          className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold text-pink-500 transition hover:text-pink-600"
        >
          {linkLabel}
        </Link>
        </div>
      </div>
    </section>
  );
};
