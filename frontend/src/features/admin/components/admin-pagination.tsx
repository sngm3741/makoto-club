type AdminPaginationProps = {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  loading?: boolean;
};

export const AdminPagination = ({
  page,
  totalPages,
  onPrev,
  onNext,
  loading = false,
}: AdminPaginationProps) => (
  <div className="flex items-center justify-between rounded-3xl border border-slate-100 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
    <span>
      ページ {page} / {totalPages}
    </span>
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onPrev}
        className="rounded-full border border-slate-200 px-3 py-1 font-semibold text-slate-600 hover:border-pink-300 hover:text-pink-600 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={loading || page <= 1}
      >
        前へ
      </button>
      <button
        type="button"
        onClick={onNext}
        className="rounded-full border border-slate-200 px-3 py-1 font-semibold text-slate-600 hover:border-pink-300 hover:text-pink-600 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={loading || page >= totalPages}
      >
        次へ
      </button>
    </div>
  </div>
);
