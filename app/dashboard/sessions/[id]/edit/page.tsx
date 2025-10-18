import Form from '@/app/ui/sessions/edit-form';
import Breadcrumbs from '@/app/ui/kits/breadcrumbs';
import { fetchSessionById, fetchStudents } from '@/app/lib/data';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'تعديل الجلسة',
  description: 'تعديل تفاصيل الجلسة',
  keywords: 'جلسة, تعديل, تفاصيل',
};

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;
  const [session, students] = await Promise.all([
    fetchSessionById(id),
    fetchStudents(),
  ]);

  if (!session) {
    notFound();
  }

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'الجلسات', href: '/dashboard/sessions' },
          {
            label: 'تعديل الجلسة',
            href: `/dashboard/sessions/${id}/edit`,
            active: true,
          },
        ]}
      />
      <Form session={session} students={students} />
    </main>
  );
}
