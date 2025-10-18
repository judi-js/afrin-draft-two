import { fetchStudents } from '@/app/lib/data';
import Form from '@/app/ui/sessions/create-form';
import Breadcrumbs from '@/app/ui/kits/breadcrumbs';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'اضافة جلسة',
  description: 'صفحة إضافة جلسة جديدة',
  keywords: 'جلسة, إضافة, تعليم',
};

export default async function Page() {
  const students = await fetchStudents();

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'الجلسات', href: '/dashboard/sessions' },
          {
            label: 'إضافة جلسة',
            href: '/dashboard/sessions/create',
            active: true,
          },
        ]}
      />
      <Form students={students} />
    </main>
  );
}
