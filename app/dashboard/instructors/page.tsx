import { fetchInstructorsPages, fetchStudentsPages } from '@/app/lib/data';
import Pagination from '@/app/ui/kits/pagination';
import InstructorsTable from '@/app/ui/instructors/table';
import { Metadata } from 'next';
import Search from '@/app/ui/kits/search';
import { CreateButton } from '@/app/ui/kits/buttons';
import { Suspense } from 'react';
import { StudentsTableSkeleton } from '@/app/ui/kits/skeletons';

export const metadata: Metadata = {
  title: 'المدرسين',
};

export default async function Page(props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;

  const {totalPages, totalInstructors} = await fetchInstructorsPages(query);

  return (
    <main>
      <h1 className={`mb-8 text-xl md:text-2xl`}>
        المدرسين
      </h1>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="ابحث حسب الاسم، الصف، أو الفرع..." />
        <CreateButton entity="instructors" />
      </div>
      <Suspense key={query + currentPage} fallback={<StudentsTableSkeleton />}>
        <InstructorsTable query={query} currentPage={currentPage} totalInstructors={totalInstructors} />
      </Suspense>
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </main>
  );
}
