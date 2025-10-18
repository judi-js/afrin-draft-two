import CardWrapper from '@/app/ui/dashboard/cards';
import StudentsChart from '@/app/ui/dashboard/students-chart';
import LatestStudents from '@/app/ui/dashboard/latest-students';
import { Suspense } from 'react';
import {
  StudentsChartSkeleton,
  LatestStudentsSkeleton,
  CardsSkeleton,
} from '@/app/ui/kits/skeletons';

export default async function Page() {

  return (
    <main>
      <h1 className={`mb-4 text-xl md:text-2xl`}>
        لوحة البيانات
      </h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Suspense fallback={<CardsSkeleton />}>
          <CardWrapper />
        </Suspense>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        <Suspense fallback={<StudentsChartSkeleton />}>
          <StudentsChart />
        </Suspense>
        <Suspense fallback={<LatestStudentsSkeleton />}>
          <LatestStudents />
        </Suspense>
      </div>
    </main>
  );
}
