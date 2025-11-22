import Link from 'next/link';

type SortOption = {
  value?: string;
  label: string;
};

type StoreSortBarProps = {
  options: readonly SortOption[];
  searchParams: Record<string, string | undefined>;
};

export const StoreSortBar = ({ options, searchParams }: StoreSortBarProps) => {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
      <span className="font-semibold text-slate-700">並び替え:</span>
      {options.map((option) => {
        const params = new URLSearchParams();
        if (searchParams.prefecture) params.set('prefecture', searchParams.prefecture);
        if (searchParams.area) params.set('area', searchParams.area);
        if (searchParams.industry) params.set('industry', searchParams.industry);
        if (searchParams.genre) params.set('genre', searchParams.genre);
        if (option.value) {
          params.set('sort', option.value);
        } else {
          params.delete('sort');
        }
        const href = params.toString() ? `/stores?${params.toString()}` : '/stores';
        const isActive =
          (!option.value && !searchParams.sort) ||
          (!!option.value && searchParams.sort === option.value);

        return (
          <Link
            key={option.label}
            href={href}
            className={`rounded-full px-3 py-1 font-semibold ${
              isActive
                ? 'bg-pink-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-pink-100 hover:text-pink-600'
            }`}
          >
            {option.label}
          </Link>
        );
      })}
    </div>
  );
};
