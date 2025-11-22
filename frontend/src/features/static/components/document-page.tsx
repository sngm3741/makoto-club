import type { ReactNode } from 'react';

import { SectionCard, SectionHeader } from '@/components/common/section';

type DocumentSection = {
  title?: string;
  content: ReactNode;
};

type DocumentPageProps = {
  title: string;
  description: string;
  sections: DocumentSection[];
  lastUpdated?: string;
  badge?: string;
};

export const DocumentPage = ({
  title,
  description,
  sections,
  lastUpdated,
  badge,
}: DocumentPageProps) => (
  <div className="space-y-6 pb-12">
    <SectionHeader title={title} description={description} size="lg" badge={badge} />
    <SectionCard className="text-sm leading-relaxed text-slate-600">
      <div className="space-y-4">
        {sections.map((section, index) => (
          <div key={section.title ?? index} className="space-y-1">
            {section.title && (
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {section.title}
              </p>
            )}
            <div>{section.content}</div>
          </div>
        ))}
      </div>
    </SectionCard>
    {lastUpdated && <p className="text-xs text-slate-400">最終更新日: {lastUpdated}</p>}
  </div>
);
