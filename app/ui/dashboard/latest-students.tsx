import { ArrowPathIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import Image from 'next/image';
import { fetchLatestStudents } from '@/app/lib/data';

export default async function LatestStudents() {
  const latestStudents = await fetchLatestStudents();
  console.log(latestStudents);
  return (
    <div className="flex w-full flex-col md:col-span-4">
      <h2 className={`mb-4 text-xl md:text-2xl`}>
        الطلاب الجدد
      </h2>
      <div className="flex grow flex-col justify-between rounded-xl bg-gray-50 p-4">
        <div className="bg-white px-6">
          {latestStudents.map((student, i) => {
            return (
              <div
                key={student.id}
                className={clsx(
                  'flex flex-row items-center justify-between py-4',
                  {
                    'border-t': i !== 0,
                  },
                )}
              >
                <div className="flex items-center">
                  <Image
                    src={"/user.png"}
                    alt={`${student.first_name}'s profile picture`}
                    className="ml-4 rounded-full"
                    width={32}
                    height={32}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold md:text-base">
                      {student.first_name} {student.last_name}
                    </p>
                    <p className="hidden text-sm text-gray-500 sm:block">
                      {student.grade} {student.department}
                    </p>
                  </div>
                </div>
                <p
                  className={`truncate text-sm font-medium md:text-base`}
                >
                  {new Date(student.created_at).toLocaleDateString()}
                </p>
              </div>
            );
          })}
        </div>
        <div className="flex items-center pb-2 pt-6">
          <ArrowPathIcon className="h-5 w-5 text-gray-500" />
          <h3 className="mr-2 text-sm text-gray-500 ">تم التحديث الآن</h3>
        </div>
      </div>
    </div>
  );
}
