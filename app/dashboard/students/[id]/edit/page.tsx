import Form from '@/app/ui/students/edit-form';
import Breadcrumbs from '@/app/ui/kits/breadcrumbs';
import { fetchStudentById } from '@/app/lib/data';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'تعديل الطالب',
  description: 'صفحة تعديل بيانات الطالب',
  keywords: 'تعديل, طالب, بيانات',
};

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;
  const student = await fetchStudentById(id);

  if (!student) {
    notFound();
  }

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'الطلاب', href: '/dashboard/students' },
          {
            label: 'تعديل الطالب',
            href: `/dashboard/students/${id}/edit`,
            active: true,
          },
        ]}
      />
      <Form student={student} />
    </main>
  );
}
