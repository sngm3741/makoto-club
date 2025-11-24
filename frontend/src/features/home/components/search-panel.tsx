import { SearchForm } from '@/components/search/search-form';
import { SectionCard, SectionPillTitle } from '@/components/common/section';

export const SearchPanel = () => {
  return (
    <section className="space-y-3">
      <SectionPillTitle
        label="店舗検索"
      />
      <SectionCard className="shadow-lg">
        <SearchForm keywordParam="name" />
      </SectionCard>
    </section>
  );
};
