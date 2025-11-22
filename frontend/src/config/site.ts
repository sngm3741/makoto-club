export const SITE_NAME = 'マコトクラブ';

export const NAV_LINKS = [
  { href: '/stores', label: '店舗一覧' },
  { href: '/surveys', label: 'アンケート一覧' },
  { href: '/surveys/new', label: 'アンケート投稿' },
] as const;

export const FOOTER_LINKS = [
  { href: '/terms', label: '利用規約' },
  { href: '/privacy', label: 'プライバシーポリシー' },
  { href: '/contact', label: 'お問い合わせ' },
  { href: '#', label: '削除依頼はこちら' },
] as const;
