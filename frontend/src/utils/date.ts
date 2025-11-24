export const formatDateTime = (value: string | null | undefined): string => {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours());
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}/${month}/${day} ${hours}:${minutes}`;
};

export const formatRelativeVisitedPeriod = (value: string | null | undefined): string => {
  if (!value) return '';

  const parseVisited = (input: string): Date | null => {
    const parts = input.split('-');
    if (parts.length >= 2) {
      const year = Number(parts[0]);
      const month = Number(parts[1]);
      const day = parts.length >= 3 ? Number(parts[2]) : 1;
      if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return null;
      const d = new Date(Date.UTC(year, month - 1, day));
      return Number.isNaN(d.getTime()) ? null : d;
    }
    const parsed = new Date(input);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const visited = parseVisited(value);
  if (!visited) return value;

  const now = new Date();
  const diffMs = now.getTime() - visited.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return value;
  if (diffDays === 0) return '今日';
  if (diffDays === 1) return '1日前';
  if (diffDays < 7) return `${diffDays}日前`;
  if (diffDays < 14) return '1週間前';
  if (diffDays < 21) return '2週間前';
  if (diffDays < 28) return '3週間前';

  const months = Math.max(1, Math.floor(diffDays / 30));
  if (months < 12) return `${months}ヶ月前`;

  const years = Math.max(1, Math.floor(diffDays / 365));
  return `${years}年前`;
};
