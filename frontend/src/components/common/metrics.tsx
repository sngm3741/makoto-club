import { cn } from '@/utils/cn';

type StarDisplayProps = {
  value: number;
  size?: 'md' | 'lg';
};

export const StarDisplay = ({ value, size = 'md' }: StarDisplayProps) => {
  const clamped = Math.max(0, Math.min(5, value));
  const fontSize = size === 'lg' ? 'text-2xl' : 'text-base';
  return (
    <span className={cn('relative inline-block leading-none', fontSize)}>
      <span className="text-slate-300">★★★★★</span>
      <span
        className="absolute left-0 top-0 overflow-hidden text-yellow-400"
        style={{ width: `${(clamped / 5) * 100}%` }}
      >
        ★★★★★
      </span>
    </span>
  );
};

type MetricCardProps = {
  label: string;
  value: string;
  tone?: 'slate' | 'pink' | 'violet';
};

export const MetricCard = ({ label, value, tone = 'slate' }: MetricCardProps) => {
  const valueColor =
    tone === 'pink'
      ? 'text-pink-600'
      : tone === 'violet'
        ? 'text-violet-600'
        : 'text-slate-900';
  return (
    <div className="rounded-2xl bg-slate-50 px-4 py-3 shadow-inner">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${valueColor}`}>{value}</p>
    </div>
  );
};
