'use client';

import { Button } from './Button';
import { useLang } from '@/hooks/useLang';

type PaginationProps = {
  page: number;
  totalPages: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  onPageChange: (page: number) => void;
  className?: string;
};

export function Pagination({
  page,
  totalPages,
  totalItems,
  startIndex,
  endIndex,
  onPageChange,
  className = '',
}: PaginationProps) {
  const { t } = useLang();

  if (totalItems === 0) return null;

  return (
    <div className={`pagination-bar ${className}`}>
      <p className="pagination-info label-si">
        {t(
          `පෙන්වනුයේ ${startIndex}-${endIndex} / ${totalItems}`,
          `Showing ${startIndex}-${endIndex} of ${totalItems}`
        )}
      </p>
      <div className="pagination-controls">
        <Button
          type="button"
          variant="secondary"
          className="!px-3 !py-1.5 !text-xs"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          {t('පෙර', 'Prev')}
        </Button>
        <span className="pagination-page label-si">
          {t(`පිටුව ${page} / ${totalPages}`, `Page ${page} of ${totalPages}`)}
        </span>
        <Button
          type="button"
          variant="secondary"
          className="!px-3 !py-1.5 !text-xs"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          {t('ඊළඟ', 'Next')}
        </Button>
      </div>
    </div>
  );
}
