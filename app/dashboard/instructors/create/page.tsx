import Form from '@/app/ui/instructors/create-form';
import Breadcrumbs from '@/app/ui/kits/breadcrumbs';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'إضافة مدرس',
  description: 'صفحة إضافة مدرس جديد',
};

export default function Page() {

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'الطلاب', href: '/dashboard/students' },
          {
            label: 'إضافة مدرس',
            href: '/dashboard/instructors/create',
            active: true,
          },
        ]}
      />
      <Form />
    </main>
  );
}
