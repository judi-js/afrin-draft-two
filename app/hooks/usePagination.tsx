// usePagination.tsx
import { usePathname, useSearchParams } from 'next/navigation';
import { generatePagination, generatePaginationForBigScreens } from '@/app/lib/utils';

export function usePagination(totalPages: number, bigScreen = false) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get('page')) || 1;

  const allPages = bigScreen
    ? generatePaginationForBigScreens(currentPage, totalPages)
    : generatePagination(currentPage, totalPages);

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPages;

  return { currentPage, allPages, createPageURL, isFirstPage, isLastPage };
}
