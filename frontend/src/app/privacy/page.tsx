import { DocumentPage } from '@/features/static/components/document-page';

export default function PrivacyPage() {
  return (
    <DocumentPage
      title="プライバシーポリシー"
      description="本ポリシーは、マコトクラブが収集する個人情報の取り扱いについて定めるものです。正式な文面は運用開始前に差し替えます。"
      lastUpdated="2025-10-23"
      sections={[
        {
          content:
            '1. 取得する情報: LINE OAuthを通じて取得した userId / displayName / アイコンURL、および投稿フォームで入力された内容。',
        },
        {
          content:
            '2. 利用目的: サービス運営、投稿内容の確認、特典付与のご連絡、お問い合わせへの対応。',
        },
        {
          content:
            '3. 保存期間: 法令に基づき必要な期間保存し、不要となった情報は適切な方法で削除します。',
        },
        {
          content:
            '4. 第三者提供: 法令に基づく場合を除き、本人の同意なく第三者へ提供しません。',
        },
        {
          content:
            '5. お問い合わせ: 情報の開示・訂正・削除等の依頼はお問い合わせ窓口よりご連絡ください。',
        },
      ]}
    />
  );
}
