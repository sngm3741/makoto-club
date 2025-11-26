import Link from 'next/link';

import { SectionCard, SectionPillTitle } from '@/components/common/section';

export default function AdminHomePage() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900">管理メニュー</h1>
        <p className="text-sm text-slate-500">店舗一覧とアンケート一覧へのショートカットです。</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <SectionCard className="flex flex-col gap-3">
          <SectionPillTitle label="店舗一覧" />
          <p className="text-sm text-slate-600">店舗情報の確認・編集、新規店舗の登録はこちら。</p>
          <Link
            href="/admin/stores"
            className="inline-flex w-fit items-center gap-2 rounded-full bg-pink-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-pink-500"
          >
            店舗一覧へ
            <span aria-hidden>→</span>
          </Link>
        </SectionCard>

        <SectionCard className="flex flex-col gap-3">
          <SectionPillTitle label="アンケート一覧" />
          <p className="text-sm text-slate-600">投稿アンケートの確認・編集、新規作成はこちら。</p>
          <Link
            href="/admin/surveys"
            className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-slate-800"
          >
            アンケート一覧へ
            <span aria-hidden>→</span>
          </Link>
        </SectionCard>
      </div>
    </div>
  );
}
