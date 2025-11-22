import Link from 'next/link';

import { DocumentPage } from '@/features/static/components/document-page';

export default function ContactPage() {
  return (
    <DocumentPage
      title="お問い合わせ（削除依頼）"
      description="掲載内容の修正・削除、その他のお問い合わせは以下の窓口からご連絡ください。通常2営業日以内に返信いたします。"
      lastUpdated="2025-10-23"
      sections={[
        {
          title: 'LINE',
          content:
            '公式アカウント「マコトクラブ」から「削除依頼」と送信してください。担当者が順次対応します。',
        },
        {
          title: 'メール',
          content: (
            <p>
              <Link href="mailto:support@makoto-club.jp" className="text-pink-600 underline">
                support@makoto-club.jp
              </Link>
            </p>
          ),
        },
        {
          title: '記載いただきたい情報',
          content: '対象店舗名、掲載日時、修正/削除理由、LINE登録時のお名前（任意）をご記載ください。',
        },
      ]}
    />
  );
}
