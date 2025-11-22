export const STATUS_LABEL: Record<string, string> = {
  pending: '審査中',
  approved: '掲載OK',
  rejected: '掲載不可',
};

export const REWARD_STATUS_LABEL: Record<string, string> = {
  pending: '未処理',
  ready: '送付準備中',
  sent: '送付済み',
};

export const STATUS_OPTIONS = [
  { value: 'pending', label: '審査中' },
  { value: 'approved', label: '掲載OK' },
  { value: 'rejected', label: '掲載不可' },
  { value: 'all', label: 'すべて' },
] as const;
