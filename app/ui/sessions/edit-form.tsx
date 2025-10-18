'use client';

import { StudentField, Session } from '@/app/lib/definitions';
import {
  CalendarDateRangeIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { Button } from '@/app/ui/kits/button';
import { updateSession, State } from '@/app/lib/actions';
import { useActionState, useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

export default function EditSessionForm({
  session,
  students,
}: {
  session: Session;
  students: StudentField[];
}) {
  const initialState: State = { message: null, errors: {} };
  const updateSessionWithId = updateSession.bind(null, session.id);
  const [state, formAction, isPending] = useActionState(updateSessionWithId, initialState);
  const [selectedDate, setSelectedDate] = useState<Date | null>(session.check_in);
  const [selectedDateCheckOut, setSelectedDateCheckOut] = useState<Date | null>(session.check_out);

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
  };

  const handleDateChangeCheckOut = (date: Date | null) => {
    setSelectedDateCheckOut(date);
  }

  return (
    <form action={formAction}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Student Name */}
        <div className="mb-4">
          <label htmlFor="student" className="mb-2 block text-sm font-medium">
            اسم الطالب
          </label>
          <div className="relative">
            <UserCircleIcon className="pointer-events-none absolute right-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
            <select
              id="student"
              name="studentId"
              className="hidden-arrow peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pr-10 text-sm outline-2 placeholder:text-gray-500 text-right"
              defaultValue={session.student_id}
              aria-describedby="student-error"
            >
              <option value="" disabled>
                اختر طالباً
              </option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.first_name} {student.last_name}
                </option>
              ))}
            </select>
          </div>

          <div id="student-error" aria-live="polite" aria-atomic="true">
            {state.errors?.studentId &&
              state.errors.studentId.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* Check In Time */}
        <div className="mb-4">
          <label htmlFor="check_in" className="mb-2 block text-sm font-medium">
            وقت الدخول
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <CalendarDateRangeIcon className="z-50 pointer-events-none absolute right-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
              <DatePicker
                id="check_in"
                name="check_in"
                selected={selectedDate}
                onChange={handleDateChange}
                showTimeSelect
                placeholderText="ادخل وقت الدخول"
                dateFormat="Pp"
                className="py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 peer block w-full cursor-pointer rounded-md border border-gray-200 text-sm outline-2 placeholder:text-gray-500 text-right"
                wrapperClassName="w-full"
                popperClassName="max-sm:w-[50px]"
              />
            </div>
          </div>
          <div id="checkin-error" aria-live="polite" aria-atomic="true">
            {state.errors?.check_in &&
              state.errors.check_in.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>
        {/* Check Out Time */}
        <div className="mb-4">
          <label htmlFor="check_out" className="mb-2 block text-sm font-medium">
            وقت الخروج
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <CalendarDateRangeIcon className="z-50 pointer-events-none absolute right-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
              <DatePicker
                id="check_out"
                name="check_out"
                showTimeSelect
                dateFormat="Pp"
                placeholderText="ادخل وقت الخروج"
                className="py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 peer block w-full cursor-pointer rounded-md border border-gray-200 text-sm outline-2 placeholder:text-gray-500 text-right"
                wrapperClassName="w-full"
                selected={selectedDateCheckOut}
                onChange={handleDateChangeCheckOut}
                popperClassName="max-sm:h-[50px] max-sm:w-[50px]"
              />
            </div>
          </div>
          <div id="checkout-error" aria-live="polite" aria-atomic="true">
            {state.errors?.check_out &&
              state.errors.check_out.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/sessions"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          إلغاء
        </Link>
        <Button type="submit" disabled={isPending} aria-disabled={isPending}>
          {isPending ? 'جاري التعديل...' : 'تعديل جلسة'}
        </Button>
      </div>
    </form>
  );
}
