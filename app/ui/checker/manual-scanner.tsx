"use client"

import { Dispatch, SetStateAction, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { StudentField } from "@/app/lib/definitions";
import { CalendarDateRangeIcon, UserCircleIcon } from "@heroicons/react/24/outline";

function ManualScanner({ onSelect, students, setDate }: { onSelect: (id: string) => void; students: StudentField[]; setDate?: Dispatch<SetStateAction<string | null>> }) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const handleChange = (date: Date | null) => {
    setSelectedDate(date);
    if (setDate) {
      setDate(date ? date.toISOString() : null);
    }
  }

  return (
    <div className="font-sans grid items-center justify-items-center gap-6 p-6 rounded-xl max-w-sm mx-auto">
      <div className="mb-4 w-full">
        <label htmlFor="student" className="mb-2 block text-sm font-medium">
          اسم الطالب
        </label>
        <div className="relative">
          <UserCircleIcon className="pointer-events-none absolute right-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
          <select
            id="student"
            name="studentId"
            className="hidden-arrow peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pr-10 text-sm outline-2 placeholder:text-gray-500 text-right"
            defaultValue=""
            onChange={(e) => onSelect(e.target.value)}
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
      </div>

      <div className="w-full">
        <label htmlFor="check_in" className="mb-2 block text-sm font-medium">
          الوقت والتاريخ
        </label>
        <div className="relative mt-2 rounded-md">
          <div className="relative">
            <CalendarDateRangeIcon className="z-50 pointer-events-none absolute right-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            <DatePicker
              id="check_in"
              name="check_in"
              selected={selectedDate}
              onChange={handleChange}
              showTimeSelect
              placeholderText="ادخل الوقت والتاريخ"
              dateFormat="Pp"
              className="py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 peer block w-full cursor-pointer rounded-md border border-gray-200 text-sm outline-2 placeholder:text-gray-500 text-right"
              wrapperClassName="w-full"
              popperClassName="max-sm:w-[50px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManualScanner;
