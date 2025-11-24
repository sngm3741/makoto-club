import { SearchForm } from '@/components/search/search-form';
import { SectionCard, SectionPillTitle } from '@/components/common/section';

type StoreFilterPanelProps = {
  initialPrefecture?: string;
  initialIndustry?: string;
  initialKeyword?: string;
};

export const StoreFilterPanel = ({ initialPrefecture, initialIndustry, initialKeyword }: StoreFilterPanelProps) => (
  <section className="space-y-3">
    <SectionPillTitle
      label="店舗検索"
    />
    
      <SearchForm
        redirectPath="/stores"
        initialPrefecture={initialPrefecture}
        initialIndustry={initialIndustry}
        initialKeyword={initialKeyword}
        keywordParam="name"
      />
    
  </section>
);
