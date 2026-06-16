export const PAGE_SIZE = 10;

export function getPaginationMeta(totalItems: number, page: number, pageSize = PAGE_SIZE) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize) || 1);
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    page: safePage,
    totalPages,
    totalItems,
    pageSize,
    startIndex: totalItems === 0 ? 0 : start + 1,
    endIndex: Math.min(start + pageSize, totalItems),
    offset: start,
  };
}

export function paginateSlice<T>(items: T[], page: number, pageSize = PAGE_SIZE) {
  const meta = getPaginationMeta(items.length, page, pageSize);
  return {
    ...meta,
    items: items.slice(meta.offset, meta.offset + pageSize),
  };
}
