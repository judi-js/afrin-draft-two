import Image from "next/image";
import {
  DeleteButton,
  DeleteButton2,
  GenerateButton,
  GenerateButton2,
  UpdateButton,
  UpdateButton2,
} from "@/app/ui/kits/buttons";
import { fetchFilteredInstructors } from "@/app/lib/data";
import { Instructor } from "@/app/lib/definitions";

// --- Mobile card component ---
function MobileStudentCard({
  instructor,
  instructors,
}: {
  instructor: Instructor;
  instructors: Instructor[];
}) {
  return (
    <div className="mb-2 w-full rounded-md bg-white p-4">
      {/* Header with name + actions */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <Image
              src="/user.png"
              className="rounded-full"
              alt={`${instructor.first_name}'s profile picture`}
              width={28}
              height={28}
            />
            <p>
              {instructor.first_name} {instructor.last_name}
            </p>
          </div>
          <div className="flex justify-start gap-3">
            <DeleteButton2 id={instructor.id} tableName="instructors" />
            <UpdateButton2 id={instructor.id} tableName="instructors" />
          </div>
        </div>
      </div>

      {/* Grade & department */}
      <div className="flex w-full items-center justify-between border-b py-5">
        <div className="flex w-1/2 flex-col">
          <p className="text-xs">الصف</p>
          {/* <p className="font-medium">{student.grade}</p> */}
        </div>
        {/* {student.department && (
          <div className="flex w-1/2 flex-col">
            <p className="text-xs">الفرع</p>
            <p className="font-medium">{student.department}</p>
          </div>
        )} */}
      </div>

      {/* Generate button */}
      <GenerateButton id={instructor.id} title={instructors.find((s) => s.id === instructor.id)?.first_name + "_" + instructors.find((s) => s.id === instructor.id)?.last_name} />
    </div>
  );
}

// --- Desktop row component ---
function DesktopStudentRow({
  instructor,
  instructors,
}: {
  instructor: Instructor;
  instructors: Instructor[];
}) {
  return (
    <tr
      key={instructor.id}
      className="group border-b last-of-type:border-none"
    >
      <td className="whitespace-nowrap bg-white py-5 pl-4 pr-3 text-sm text-black sm:pl-6">
        <div className="flex items-center gap-3">
          <Image
            src="/user.png"
            className="rounded-full"
            alt={`${instructor.first_name}'s profile picture`}
            width={28}
            height={28}
          />
          <p>
            {instructor.first_name} {instructor.last_name}
          </p>
        </div>
      </td>
      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
        {/* {instructor.grade} */}
      </td>
      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
        {/* {instructor.department || "-"} */}
      </td>
      <td className="whitespace-nowrap bg-white px-4 py-5 text-xs">
        <GenerateButton2 id={instructor.id} title={instructors.find((s) => s.id === instructor.id)?.first_name + "_" + instructors.find((s) => s.id === instructor.id)?.last_name} />
      </td>
      <td className="whitespace-nowrap bg-white py-3 pl-6 pr-3">
        <div className="flex justify-end gap-3">
          <UpdateButton id={instructor.id} tableName="instructors" />
          <DeleteButton id={instructor.id} tableName="instructors" />
        </div>
      </td>
    </tr>
  );
}

// --- Main table component ---
export default async function StudentsTable({
  query,
  currentPage,
  totalInstructors,
}: {
  query: string;
  currentPage: number;
  totalInstructors: number;
}) {
  const instructors = await fetchFilteredInstructors(query, currentPage);

  return (
    <div className="w-full mt-6 flow-root">
      <p className="mb-4 text-sm text-left text-gray-700">
        عدد المدرسين: {totalInstructors}
      </p>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden rounded-md bg-gray-50 p-2 md:pt-0">
            {/* Mobile view */}
            <div className="md:hidden">
              {instructors.map((instructor) => (
                <MobileStudentCard
                  key={instructor.id}
                  instructor={instructor}
                  instructors={instructors}
                />
              ))}
            </div>

            {/* Desktop view */}
            <table className="hidden min-w-full rounded-md text-gray-900 md:table">
              <thead className="rounded-md bg-gray-50 text-right text-sm font-normal">
                <tr>
                  <th className="px-4 py-5 font-medium sm:pl-6">الاسم</th>
                  <th className="px-3 py-5 font-medium">الصف</th>
                  <th className="px-3 py-5 font-medium">الفرع</th>
                  <th className="px-3 py-5 font-medium">
                    <span className="sr-only">توليد</span>
                  </th>
                  <th className="px-4 py-5 font-medium">
                    <span className="sr-only">تعديل</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {instructors.map((instructor) => (
                  <DesktopStudentRow
                    key={instructor.id}
                    instructor={instructor}
                    instructors={instructors}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
