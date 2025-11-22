export const HeroSection = () => {
  return (
    <div className="space-y-6 rounded-3xl bg-gradient-to-br from-pink-100 via-white to-white p-8 shadow-lg">
      <p className="inline-flex rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-pink-600">
        風俗で働く女の子のためのアンケートメディア
      </p>
      <h1 className="text-3xl leading-snug font-semibold text-slate-900">
        リアルなアンケートで、
        <br className="hidden sm:block" />
        自分にぴったりの店舗を探そう
      </h1>
      <p className="text-sm leading-relaxed text-slate-600">
        500件以上のアンケートを集約。待機時間や平均稼ぎなど、気になるポイント別に検索できます。
        X（旧Twitter）でログインすると投稿もできて、PayPay1,000円の特典をDMでご案内します。
      </p>
      <div className="flex flex-wrap gap-3 text-xs text-slate-500">
        <span className="rounded-full bg-white/90 px-3 py-1 font-medium">500件以上のアンケート</span>
        <span className="rounded-full bg-white/90 px-3 py-1 font-medium">全国47都道府県対応</span>
        <span className="rounded-full bg-white/90 px-3 py-1 font-medium">X連携で本人確認</span>
      </div>
    </div>
  );
};
