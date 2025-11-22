import { HeroSection } from '@/features/home/components/hero-section';
import { PromoSection } from '@/features/home/components/promo-section';
import { SearchPanel } from '@/features/home/components/search-panel';
import { StoreShowcase } from '@/features/home/components/store-showcase';
import { SurveyShowcase } from '@/features/home/components/survey-showcase';
import { fetchLatestStores } from '@/lib/stores';
import { fetchSurveys } from '@/lib/surveys';

export default async function HomePage() {
  const [{ items: latestSurveys }, latestStores] = await Promise.all([
    fetchSurveys({ sort: 'newest', limit: 3 }),
    fetchLatestStores(3),
  ]);

  return (
    <div className="space-y-12 pb-12">
      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <HeroSection />
        <SearchPanel />
      </section>

      <SurveyShowcase title="新着アンケート" linkHref="/surveys" surveys={latestSurveys} />

      <StoreShowcase title="新着店舗情報" linkHref="/stores" stores={latestStores} />

      <PromoSection />
    </div>
  );
}
