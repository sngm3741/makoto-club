import Link from 'next/link';
import { TwitterTimelineCard } from './twitter-timeline-card';

export const PromoSection = () => {
  return (
    <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-pink-200 bg-white p-6 shadow-lg">
        <p className="inline-flex rounded-full bg-pink-100 px-3 py-1 text-xs font-semibold text-pink-600">PayPay 1000円分🎁</p>
        <h3 className="mt-4 text-2xl font-semibold text-slate-900">
          匿名店舗アンケートを投稿してくれた方にPayPay 1,000円プレゼント
        </h3>
        <p className="mt-2 text-sm text-slate-600">
        ※アンケート項目 <span className='font-bold'>メールアドレス<span className='text-xs'> (任意)</span></span> の記入が必要になります。
        </p>
        <Link
          href="/surveys/new"
          className="mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 px-4 py-2 text-sm font-semibold text-white shadow-md hover:from-pink-400 hover:to-violet-400"
        >
          アンケート投稿ページへ
        </Link>
      </div>
      <TwitterTimelineCard />
    
    </section>
  );
};
