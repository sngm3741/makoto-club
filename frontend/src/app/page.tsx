import { HeroSection } from '@/features/home/components/hero-section';
import { PromoSection } from '@/features/home/components/promo-section';
import { SearchPanel } from '@/features/home/components/search-panel';
import { StoreShowcase } from '@/features/home/components/store-showcase';
import { SurveyShowcase } from '@/features/home/components/survey-showcase';
import { fetchLatestStores } from '@/lib/stores';
import { fetchSurveys } from '@/lib/surveys';
import Image from 'next/image';

export default async function HomePage() {
  const [{ items: latestSurveys }, latestStores] = await Promise.all([
    fetchSurveys({ sort: 'newest', limit: 3 }),
    fetchLatestStores(3),
  ]);

  return (
    <div className="space-y-12 pb-12">
      <section className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-lg">
        <div className="absolute inset-0">
          <Image
            src="/h3.jpg"
            alt="Makoto Club hero"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/60 via-white/30 to-transparent" />
        </div>
        <div className="relative px-6 py-10 sm:px-10 sm:py-14">
          <div className="inline-flex max-w-3xl items-start gap-3 rounded-2xl bg-white/0 px-5 py-4 text-slate-900 shadow-2xl ring-1 ring-white/60 backdrop-blur-sm">
            <div className="flex-1">
              <p className="text-[11px] font-semibold tracking-[0.25em] text-slate-700">
                #匿名店舗アンケート
              </p>
              <h1 className="mt-2 text-xl font-semibold sm:text-4xl text-pink-600">
                みんなのリアルな声から、<br />
                自分にぴったりのお店を。
              </h1>
              <div className="mt-2 rounded-2xl bg-white/60 p-3 text-sm text-slate-700">
                アンケートの投稿で <span className="font-bold text-pink-600">PayPay 1000円 プレゼント🎁</span>
              </div>
              <div className="mt-4">
                <a
                  href="/surveys/new"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 px-4 py-2 text-sm font-semibold text-white shadow-md hover:from-pink-400 hover:to-violet-400"
                >
                  アンケートを投稿する
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <SearchPanel />
      </section>

      <SurveyShowcase title="新着アンケート" linkHref="/surveys" surveys={latestSurveys} />

      <StoreShowcase title="新着店舗情報" linkHref="/stores" stores={latestStores} />

      <PromoSection />
    </div>
  );
}
