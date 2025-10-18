import Form from '@/app/ui/students/create-form';
import Breadcrumbs from '@/app/ui/kits/breadcrumbs';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'إضافة طالب',
  description: 'صفحة إضافة طالب جديد',
};

export default function Page() {

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'الطلاب', href: '/dashboard/students' },
          {
            label: 'إضافة طالب',
            href: '/dashboard/students/create',
            active: true,
          },
        ]}
      />
      <Form />
    </main>
  );
}
