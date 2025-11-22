import { SearchForm } from '@/components/search/search-form';
import { SectionCard, SectionHeader } from '@/components/common/section';

type StoreFilterPanelProps = {
  initialPrefecture?: string;
  initialIndustry?: string;
};

export const StoreFilterPanel = ({ initialPrefecture, initialIndustry }: StoreFilterPanelProps) => (
  <SectionCard>
    <SectionHeader
      title="条件で絞り込む"
      description="都道府県と業種を自由に組み合わせて検索できます。"
    />
    <SearchForm
      redirectPath="/stores"
      initialPrefecture={initialPrefecture}
      initialIndustry={initialIndustry}
    />
  </SectionCard>
);
