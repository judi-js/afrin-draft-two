import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from "use-debounce";

export function useSearch() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    params.delete('page');
    if (term) {
      params.set('query', term);
    } else {
      params.delete('query');
    }
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  return { handleSearch, searchParams };
}
