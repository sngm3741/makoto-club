import { EmptyState } from '@/components/common/empty-state';
import { SurveyCard } from '@/components/surveys/survey-card';
import type { SurveySummary } from '@/types/survey';

type SurveyListSectionProps = {
  surveys: SurveySummary[];
};

export const SurveyListSection = ({ surveys }: SurveyListSectionProps) => {
  if (surveys.length === 0) {
    return (
      <EmptyState
        title="該当するアンケートがありません"
        description="別の条件やエリアで探してみてください。"
      />
    );
  }

  return (
    <section className="grid gap-4 md:grid-cols-2">
      {surveys.map((survey) => (
        <SurveyCard key={survey.id} survey={survey} />
      ))}
    </section>
  );
};
