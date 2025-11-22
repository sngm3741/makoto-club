import { SearchForm } from '@/components/search/search-form';
import { SectionCard, SectionHeader } from '@/components/common/section';

export const SearchPanel = () => {
  return (
    <SectionCard className="shadow-lg">
      <SectionHeader
        title="条件から探す"
        description="絞り込み後は「店舗一覧」に遷移します。希望の都道府県や業種で検索してみてください。"
      />
      <SearchForm />
    </SectionCard>
  );
};
