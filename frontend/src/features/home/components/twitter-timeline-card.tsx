'use client';

import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    twttr?: {
      widgets?: {
        load: (element?: HTMLElement) => void;
      };
    };
  }
}

export const TwitterTimelineCard = () => {
  const [loaded, setLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // widgets.js を1回だけ読み込み
    if (typeof window === 'undefined') return;

    const scriptId = 'twitter-wjs';
    const applyWidgets = () => {
      setLoaded(true);
      window.twttr?.widgets?.load();
    };

    if (window.twttr?.widgets) {
      applyWidgets();
      return;
    }

    const existing = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (existing) {
      existing.onload = applyWidgets;
      return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://platform.twitter.com/widgets.js';
    script.async = true;
    script.onload = applyWidgets;
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (loaded) {
      window.twttr?.widgets?.load(containerRef.current || undefined);
    }
  }, [loaded]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const adjustWidth = () => {
      const iframe = container.querySelector('iframe');
      if (iframe) {
        iframe.style.width = '100%';
        iframe.style.maxWidth = '100%';
      }
    };

    const observer = new MutationObserver(() => adjustWidth());
    observer.observe(container, { childList: true, subtree: true });
    adjustWidth();

    return () => observer.disconnect();
  }, [loaded]);

  return (
    <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-700 p-6 text-white shadow-lg">
      <p className="text-sm font-semibold tracking-[0.2em] text-white/70 uppercase"></p>
      <h3 className="mt-3 text-xl font-semibold sm:text-2xl">𝕏 最新ポストをチェック</h3>
      <p className="mt-2 text-sm text-white/80">
        業界の最新情報やお店選びのコツを毎日更新💪<br />フォローしてプレゼント企画に参加しよう🎁
      </p>
      <div
        ref={containerRef}
        className="mt-4 w-full min-w-0 overflow-hidden rounded-2xl bg-white/5 p-2 shadow-inner"
      >
        <a
          className="twitter-timeline"
          data-theme="dark"
          data-chrome="transparent noheader nofooter noborders"
          data-tweet-limit="3"
          data-height="460"
          href="https://twitter.com/MAKOTO_CLUB2_3?ref_src=twsrc%5Etfw"
        >
          最新ポストを見る
        </a>
      </div>
    </div>
  );
};
