'use client';

import { FormEvent, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';

type UseSearchFiltersOptions = {
  initialPrefecture?: string;
  initialIndustry?: string;
  redirectPath?: string;
  initialKeyword?: string;
  keywordParam?: string;
};

type FilterState = {
  prefecture: string;
  industry: string;
  keyword: string;
};

export const useSearchFilters = ({
  initialPrefecture = '',
  initialIndustry = '',
  redirectPath = '/stores',
  initialKeyword = '',
  keywordParam = 'name',
}: UseSearchFiltersOptions = {}) => {
  const router = useRouter();
  const [filters, setFilters] = useState<FilterState>({
    prefecture: initialPrefecture,
    industry: initialIndustry,
    keyword: initialKeyword,
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
       if (state.keyword) params.set(keywordParam, state.keyword);
      const query = params.toString();
      return query ? `${redirectPath}?${query}` : redirectPath;
    },
    [filters, keywordParam, redirectPath],
  );

  const handleSubmit = useCallback(
    (event?: FormEvent<HTMLFormElement>) => {
      event?.preventDefault();
      router.push(buildHref());
    },
    [buildHref, router],
  );

  const reset = useCallback(() => {
    setFilters({ prefecture: '', industry: '', keyword: '' });
  }, []);

  return {
    prefecture: filters.prefecture,
    industry: filters.industry,
    keyword: filters.keyword,
    setPrefecture: (value: string) => updateField('prefecture', value),
    setIndustry: (value: string) => updateField('industry', value),
    setKeyword: (value: string) => updateField('keyword', value),
    handleSubmit,
    reset,
    buildHref,
  };
};
