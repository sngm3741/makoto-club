'use client';

import { useEffect } from 'react';
import { useBreadcrumbOverride } from './breadcrumb-context';

type Props = {
  label?: string;
  branchName?: string;
};

export const BreadcrumbLabelSetter = ({ label, branchName }: Props) => {
  const { setLastLabel } = useBreadcrumbOverride();
  const composed = branchName ? `${label}（${branchName}）` : label;
  useEffect(() => {
    setLastLabel(composed);
    return () => setLastLabel(undefined);
  }, [composed, setLastLabel]);

  return null;
};
