import { SearchForm } from '@/components/search/search-form';
import { SectionCard, SectionPillTitle } from '@/components/common/section';

type SurveyFilterPanelProps = {
  initialPrefecture?: string;
  initialIndustry?: string;
  initialKeyword?: string;
};

export const SurveyFilterPanel = ({ initialPrefecture, initialIndustry, initialKeyword }: SurveyFilterPanelProps) => (
  <section className="space-y-3">
    <SectionPillTitle
      label="アンケート検索"
    />
      <SearchForm
        redirectPath="/surveys"
        initialPrefecture={initialPrefecture}
        initialIndustry={initialIndustry}
        initialKeyword={initialKeyword}
        keywordParam="keyword"
      />
  </section>
);
