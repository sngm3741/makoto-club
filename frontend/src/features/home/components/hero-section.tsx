import Link from "next/link";

export const HeroSection = () => {
  return (
    <div className="space-y-6 rounded-3xl bg-gradient-to-br from-pink-100 via-white to-white p-8 shadow-lg">
      
      <p className="inline-flex rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-pink-600">
      <Link href="https://x.com/MAKOTO_CLUB2_3">
        # 匿名店舗アンケート
      </Link>
      </p>
      
      <h1 className="text-2xl leading-snug font-semibold text-slate-900">
        みんなのリアルな声から、
        <br className="" />
        自分にぴったりのお店を。
      </h1>
      <p className="text-sm leading-relaxed text-slate-600">
        <Link 
          href="/surveys/new"
          className="font-semibold text-pink-600 underline decoration-2 underline-offset-2 hover:text-pink-700 hover:decoration-pink-700 transition-colors"
        >
          アンケート投稿で PayPay1000円プレゼント🎁
        </Link>
      </p>
      {/* <div className="flex flex-wrap gap-3 text-xs text-slate-500">
        <span className="rounded-full bg-white/90 px-3 py-1 font-medium">100件以上のアンケート</span>
        <span className="rounded-full bg-white/90 px-3 py-1 font-medium">全国47都道府県対応</span>
        <span className="rounded-full bg-white/90 px-3 py-1 font-medium">X連携で本人確認</span>
      </div> */}
    </div>
  );
};
