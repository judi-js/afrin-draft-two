import Form from '@/app/ui/instructors/edit-form';
import Breadcrumbs from '@/app/ui/kits/breadcrumbs';
import { fetchInstructorById } from '@/app/lib/data';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'تعديل المدرس',
  description: 'صفحة تعديل بيانات المدرس',
  keywords: 'تعديل, مدرس, بيانات',
};

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;
  const instructor = await fetchInstructorById(id);

  if (!instructor) {
    notFound();
  }

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'المدرسين', href: '/dashboard/instructors' },
          {
            label: 'تعديل المدرس',
            href: `/dashboard/instructors/${id}/edit`,
            active: true,
          },
        ]}
      />
      <Form instructor={instructor} />
    </main>
  );
}
