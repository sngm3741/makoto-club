import { SearchForm } from '@/components/search/search-form';
import { SectionCard, SectionHeader } from '@/components/common/section';

type SurveyFilterPanelProps = {
  initialPrefecture?: string;
  initialIndustry?: string;
};

export const SurveyFilterPanel = ({ initialPrefecture, initialIndustry }: SurveyFilterPanelProps) => (
  <SectionCard>
    <SectionHeader
      title="条件で絞り込む"
      description="都道府県や業種を選んで、目的に合ったアンケートを表示します。"
    />
    <SearchForm
      redirectPath="/surveys"
      initialPrefecture={initialPrefecture}
      initialIndustry={initialIndustry}
    />
  </SectionCard>
);
