'use client';

import { FormEvent, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';

type UseSearchFiltersOptions = {
  initialPrefecture?: string;
  initialIndustry?: string;
  redirectPath?: string;
};

type FilterState = {
  prefecture: string;
  industry: string;
};

export const useSearchFilters = ({
  initialPrefecture = '',
  initialIndustry = '',
  redirectPath = '/stores',
}: UseSearchFiltersOptions = {}) => {
  const router = useRouter();
  const [filters, setFilters] = useState<FilterState>({
    prefecture: initialPrefecture,
    industry: initialIndustry,
  });

  const updateField = useCallback(
    (field: keyof FilterState, value: string) => {
      setFilters((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const buildHref = useCallback(
    (state: FilterState = filters) => {
      const params = new URLSearchParams();
      if (state.prefecture) params.set('prefecture', state.prefecture);
      if (state.industry) params.set('industry', state.industry);
      const query = params.toString();
      return query ? `${redirectPath}?${query}` : redirectPath;
    },
    [filters, redirectPath],
  );

  const handleSubmit = useCallback(
    (event?: FormEvent<HTMLFormElement>) => {
      event?.preventDefault();
      router.push(buildHref());
    },
    [buildHref, router],
  );

  const reset = useCallback(() => {
    setFilters({ prefecture: '', industry: '' });
  }, []);

  return {
    prefecture: filters.prefecture,
    industry: filters.industry,
    setPrefecture: (value: string) => updateField('prefecture', value),
    setIndustry: (value: string) => updateField('industry', value),
    handleSubmit,
    reset,
    buildHref,
  };
};
