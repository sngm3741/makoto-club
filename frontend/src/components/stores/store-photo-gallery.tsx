'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';

type StorePhotoGalleryProps = {
  images: Array<{ url: string; surveyId?: string; snippet?: string }>;
  storeName: string;
};

export const StorePhotoGallery = ({ images, storeName }: StorePhotoGalleryProps) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);

  const hasImages = images && images.length > 0;
  const safeImages = useMemo(() => images.filter((img) => img.url), [images]);

  useEffect(() => {
    if (activeIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveIndex(null);
      }
      if (e.key === 'ArrowRight') {
        setActiveIndex((prev) => (prev === null ? null : (prev + 1) % safeImages.length));
      }
      if (e.key === 'ArrowLeft') {
        setActiveIndex((prev) => (prev === null ? null : (prev - 1 + safeImages.length) % safeImages.length));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeIndex, safeImages.length]);

  if (!hasImages) return null;

  const openModal = (index: number) => {
    setActiveIndex(index);
    setCurrentIndex(index);
  };
  const closeModal = () => setActiveIndex(null);
  const prev = () =>
    setActiveIndex((prev) => (prev === null ? null : (prev - 1 + safeImages.length) % safeImages.length));
  const next = () => setActiveIndex((prev) => (prev === null ? null : (prev + 1) % safeImages.length));

  const handleScroll = () => {
    const container = scrollRef.current;
    if (!container || itemRefs.current.length === 0) return;
    const viewportCenter = container.scrollLeft + container.clientWidth / 2;
    let closestIndex = 0;
    let closestDistance = Infinity;
    itemRefs.current.forEach((el, idx) => {
      if (!el) return;
      const rectCenter = el.offsetLeft + el.offsetWidth / 2;
      const dist = Math.abs(rectCenter - viewportCenter);
      if (dist < closestDistance) {
        closestDistance = dist;
        closestIndex = idx;
      }
    });
    setCurrentIndex(closestIndex);
  };

  return (
    <>
      <div className="hide-scrollbar relative mt-4">
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scroll-smooth"
          onScroll={handleScroll}
        >
          {safeImages.map((item, index) => (
            <figure
              key={`${item.url}-${index}`}
              className="group relative aspect-[4/3] min-w-[260px] max-w-md flex-1 snap-center overflow-hidden rounded-xl bg-slate-100/60 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              onClick={() => openModal(index)}
              ref={(el) => {
                if (el) itemRefs.current[index] = el;
              }}
            >
              <img src={item.url} alt={`店舗写真 ${index + 1}`} className="h-full w-full cursor-zoom-in object-cover" loading="lazy" />
              <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-3 py-2 text-xs text-white opacity-90">
                {storeName} の投稿写真 #{index + 1}
              </figcaption>
            </figure>
          ))}
        </div>
        {safeImages.length > 1 && (
          <div className="mt-3 flex justify-center gap-2">
            {safeImages.map((_, idx) => (
              <span
                key={idx}
                className={`h-2 w-2 rounded-full transition ${currentIndex === idx ? 'bg-pink-500' : 'bg-slate-300/60'}`}
              />
            ))}
          </div>
        )}
      </div>

      {activeIndex !== null && safeImages[activeIndex] && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={closeModal}
        >
          <div
            className="relative w-full max-w-5xl overflow-hidden rounded-2xl bg-black/60 shadow-2xl ring-1 ring-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={safeImages[activeIndex].url}
              alt={`${storeName} の投稿写真 ${activeIndex + 1}`}
              className="mx-auto max-h-[80vh] w-full rounded-2xl object-contain bg-black/40"
              loading="lazy"
            />
            <div className="absolute inset-x-0 bottom-0 space-y-1 bg-gradient-to-t from-slate-950/80 via-slate-900/45 to-slate-900/10 px-4 py-3 text-sm text-white backdrop-blur-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="font-semibold">
                  {storeName} の投稿写真 #{activeIndex + 1} / {safeImages.length}
                </span>
                {safeImages[activeIndex].surveyId && (
                  <Link
                    href={`/surveys/${safeImages[activeIndex].surveyId}`}
                    className="text-xs font-semibold text-pink-200 underline decoration-pink-200/60 underline-offset-4 hover:text-white"
                  >
                    詳細を見る
                  </Link>
                )}
              </div>
              {safeImages[activeIndex].snippet && safeImages[activeIndex].surveyId && (
                <Link
                  href={`/surveys/${safeImages[activeIndex].surveyId}`}
                  className="block text-xs text-pink-100 hover:text-white"
                  title={safeImages[activeIndex].snippet}
                >
                  {safeImages[activeIndex].snippet}
                </Link>
              )}
            </div>
            <button
              onClick={closeModal}
              className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-slate-900 shadow hover:bg-white"
              aria-label="閉じる"
            >
              ✕
            </button>
            {safeImages.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-slate-900 shadow hover:bg-white"
                  aria-label="前の画像へ"
                >
                  ←
                </button>
                <button
                  onClick={next}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-slate-900 shadow hover:bg-white"
                  aria-label="次の画像へ"
                >
                  →
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

const SwipeHintIcon = () => (
  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-500 shadow-inner">
    ↔
  </span>
);
