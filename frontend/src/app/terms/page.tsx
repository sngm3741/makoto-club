import { DocumentPage } from '@/features/static/components/document-page';

export default function TermsPage() {
  return (
    <DocumentPage
      title="利用規約"
      description="本サービス「マコトクラブ」をご利用いただく前に、以下の利用規約をご確認ください。正式な文章は法務確認後に差し替え予定です。"
      lastUpdated="2025-10-23"
      sections={[
        {
          content:
            '1. 利用者は、本サービスに登録・投稿する情報について、真実かつ正確な内容を提供するものとします。',
        },
        {
          content:
            '2. 投稿内容に第三者の個人情報や誹謗中傷が含まれる場合、運営は削除する権利を有します。',
        },
        {
          content:
            '3. 投稿された内容については、サービスのプロモーション等で匿名のまま引用させていただく場合があります。',
        },
        {
          content:
            '4. 本規約は予告なく変更することがあります。変更後もサービスを利用された場合、改訂された内容に同意したものとみなします。',
        },
      ]}
    />
  );
}
