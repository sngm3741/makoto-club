import Link from 'next/link';

export const PromoSection = () => {
  return (
    <section className="grid gap-4 md:grid-cols-2">
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-700 p-6 text-white shadow-lg">
        <p className="text-sm font-semibold tracking-[0.2em] text-white/70 uppercase">オフィシャルTwitter</p>
        <h3 className="mt-4 text-2xl font-semibold">最新イベント情報を毎日発信中</h3>
        <p className="mt-2 text-sm text-white/80">
          店舗特集やキャッシュバック、出稼ぎのコツなどをポップに紹介。フォローして最新情報をチェック！
        </p>
        <a
          href="https://twitter.com"
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900"
        >
          Twitterで見る
          <span aria-hidden>↗</span>
        </a>
      </div>
      <div className="rounded-3xl border border-pink-200 bg-white p-6 shadow-lg">
        <p className="inline-flex rounded-full bg-pink-100 px-3 py-1 text-xs font-semibold text-pink-600">投稿でPayPayをプレゼント</p>
        <h3 className="mt-4 text-2xl font-semibold text-slate-900">
          Xログインで投稿すると
          <br />
          PayPay 1,000円プレゼント
        </h3>
        <p className="mt-2 text-sm text-slate-600">
          「投稿してPayPayを受け取る」からXログインするとアンケートを投稿できます。審査完了後に公式アカウントからDMで受け取りリンクをお送りします。
        </p>
        <Link
          href="/surveys/new"
          className="mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 px-4 py-2 text-sm font-semibold text-white shadow-md hover:from-pink-400 hover:to-violet-400"
        >
          アンケート投稿ページへ
        </Link>
      </div>
    </section>
  );
};
