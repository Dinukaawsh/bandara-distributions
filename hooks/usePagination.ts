'use client';

import { useEffect, useMemo, useState } from 'react';
import { PAGE_SIZE, paginateSlice } from '@/lib/pagination';

export function usePagination<T>(items: T[], pageSize = PAGE_SIZE, resetKey?: string | number) {
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [resetKey]);

  const result = useMemo(() => paginateSlice(items, page, pageSize), [items, page, pageSize]);

  useEffect(() => {
    if (page > result.totalPages) setPage(result.totalPages);
  }, [page, result.totalPages]);

  return {
    page: result.page,
    setPage,
    totalPages: result.totalPages,
    totalItems: result.totalItems,
    pageSize: result.pageSize,
    startIndex: result.startIndex,
    endIndex: result.endIndex,
    paginatedItems: result.items,
  };
}
