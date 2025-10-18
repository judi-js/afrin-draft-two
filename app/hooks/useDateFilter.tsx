import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

export function useDateFilter() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const query = searchParams.get('query');
  const params = new URLSearchParams(searchParams.toString());
  const to = params.get('to') ? new Date(params.get('to')!) : null;
  const from = params.get('from') ? new Date(params.get('from')!) : null;
  if (query) params.set('query', query);

  // Helper to get ISO string for local date (removes timezone offset)
  function toLocalISOString(date: Date | null) {
    if (!date) return '';
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10); // Only date part
  }

  const handleFromSearch = useDebouncedCallback((date: Date | null) => {
    const params = new URLSearchParams(searchParams);
    params.delete('page');
    if (date) {
      params.set('from', toLocalISOString(date));
    } else {
      params.delete('from');
    }
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  const handleToSearch = useDebouncedCallback((date: Date | null) => {
    const params = new URLSearchParams(searchParams);
    params.delete('page');
    if (date) {
      params.set('to', toLocalISOString(date));
    } else {
      params.delete('to');
    }
    replace(`${pathname}?${params.toString()}`);
  }, 300);
  return {
    to,
    from,
    handleToSearch,
    handleFromSearch
  }
}
