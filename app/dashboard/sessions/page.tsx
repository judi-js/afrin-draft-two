import Pagination from '@/app/ui/kits/pagination';
import Search from '@/app/ui/kits/search';
import Table from '@/app/ui/sessions/table';
import { CreateButton } from '@/app/ui/kits/buttons';
import { SessionsTableSkeleton } from '@/app/ui/kits/skeletons';
import { Suspense } from 'react';
import { fetchSessionsPages } from '@/app/lib/data';
import { Metadata } from 'next';
import FilterBar from '@/app/ui/kits/date-filter';

export const metadata: Metadata = {
  title: 'الجلسات',
};

export default async function Page(props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
    from?: string;
    to?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;
  const from = searchParams?.from || '';
  const to = searchParams?.to || '';

  const { totalPages, totalSessions } = await fetchSessionsPages(query, from, to);

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`mb-4 text-xl md:text-2xl`}>الجلسات</h1>
      </div>
      <div className="my-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="ابحث حسب الاسم، الصف، أو الفرع..." />
        <CreateButton entity="sessions" />
      </div>
      <FilterBar />
      <Suspense key={query + currentPage} fallback={<SessionsTableSkeleton />}>
        <Table query={query} currentPage={currentPage} from={from} to={to} totalSessions={totalSessions} />
      </Suspense>
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}
