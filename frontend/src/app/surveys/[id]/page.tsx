import { notFound } from 'next/navigation';

import { fetchSurveyById } from '@/lib/surveys';
import { SurveyDetailContent } from '@/components/surveys/survey-detail';

type SurveyDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function SurveyDetailPage({ params }: SurveyDetailPageProps) {
  const { id } = await params;

  const survey = await fetchSurveyById(id);
  if (!survey) {
    notFound();
  }

  return (
    <div className="space-y-6 pb-12">
      <SurveyDetailContent survey={survey} />
    </div>
  );
}
