'use client';

import Link from 'next/link';
import {
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/app/ui/kits/button';
import { createInstructor, InstructorFormState } from '@/app/lib/actions';
import { useActionState } from 'react';

export default function Form() {
  const initialState: InstructorFormState = { message: null, errors: {} };
  const [state, formAction, isPending] = useActionState(createInstructor, initialState);

  return (
    <form action={formAction}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* First Name */}
        <div className="mb-4">
          <label htmlFor="first_name" className="mb-2 block text-sm font-medium">
            الاسم الأول
          </label>
          <div className="relative">
            <UserCircleIcon className="pointer-events-none absolute right-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              id="first_name"
              name="first_name"
              className="peer block w-full rounded-md border border-gray-200 py-2 pr-10 text-sm outline-2 placeholder:text-gray-500 text-right"
              placeholder="أدخل الاسم الأول"
              aria-describedby="first_name-error"
            />
          </div>

          <div id="first_name-error" aria-live="polite" aria-atomic="true">
            {state.errors?.first_name &&
              state.errors.first_name.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>
        {/* Last Name */}
        <div className="mb-4">
          <label htmlFor="last_name" className="mb-2 block text-sm font-medium">
            اسم العائلة
          </label>
          <div className="relative">
            <UserCircleIcon className="pointer-events-none absolute right-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              id="last_name"
              name="last_name"
              className="peer block w-full rounded-md border border-gray-200 py-2 pr-10 text-sm outline-2 placeholder:text-gray-500 text-right"
              placeholder="أدخل اسم العائلة"
              aria-describedby="last_name-error"
            />
          </div>

          <div id="last_name-error" aria-live="polite" aria-atomic="true">
            {state.errors?.last_name &&
              state.errors.last_name.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/instructors"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          إلغاء
        </Link>
        <Button type="submit" disabled={isPending} aria-disabled={isPending}>
          {isPending ? 'جاري الإضافة...' : 'إضافة مدرس'}
        </Button>
      </div>
    </form>
  );
}
