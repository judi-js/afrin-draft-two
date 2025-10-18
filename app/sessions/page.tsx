import Pagination from '@/app/ui/kits/pagination';
import Table from '@/app/ui/sessions/student-sessions-table';
import { SessionsTableSkeleton } from '@/app/ui/kits/skeletons';
import { Suspense } from 'react';
import { fetchSessionsByStudentPages } from '@/app/lib/data';
import { Metadata } from 'next';
import { auth, signOut } from '@/auth';
import { cookies } from 'next/headers';

export const metadata: Metadata = {
  title: 'تقرير الجلسات',
  description: 'عرض وتصفية الجلسات الخاصة بالطالب',
  keywords: 'جلسات, طالب, تقرير',
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
  const session = await auth();

  if (!session?.user) {
    return <p className="text-red-500 font-semibold text-right">يرجى تسجيل الدخول لعرض الجلسات</p>;
  }

  const handleLogout = async () => {
    'use server';
    const cookieStore = await cookies();
    cookieStore.delete('authjs.callback-url');
    cookieStore.delete('authjs.csrf-token');
    await signOut({ redirectTo: '/' });
  };

  const studentId = (session.user as { id: string }).id;

  const { totalPages, totalSessions } = await fetchSessionsByStudentPages(query, studentId);

  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      <div className="grow p-6 md:overflow-y-auto md:p-12">
        <div className="w-full">
          <Suspense key={query + currentPage} fallback={<SessionsTableSkeleton />}>
            <Table query={query} currentPage={currentPage} studentId={studentId} handleLogout={handleLogout} totalSessions={totalSessions} />
          </Suspense>
          {totalPages === 0 ? null : (<div className="mt-5 flex w-full justify-center">
            <Pagination totalPages={totalPages} />
          </div>)}
        </div>
      </div>
    </div>
  );
}
