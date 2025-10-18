import { fetchStudentsPages } from '@/app/lib/data';
import Pagination from '@/app/ui/kits/pagination';
import CustomersTable from '@/app/ui/students/table';
import { Metadata } from 'next';
import Search from '@/app/ui/kits/search';
import { CreateButton } from '@/app/ui/kits/buttons';
import { Suspense } from 'react';
import { StudentsTableSkeleton } from '@/app/ui/kits/skeletons';

export const metadata: Metadata = {
  title: 'الطلاب',
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

  const {totalPages, totalStudents} = await fetchStudentsPages(query);

  return (
    <main>
      <h1 className={`mb-8 text-xl md:text-2xl`}>
        الطلاب
      </h1>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="ابحث حسب الاسم، الصف، أو الفرع..." />
        <CreateButton entity="students" />
      </div>
      <Suspense key={query + currentPage} fallback={<StudentsTableSkeleton />}>
        <CustomersTable query={query} currentPage={currentPage} totalStudents={totalStudents} />
      </Suspense>
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </main>
  );
}
