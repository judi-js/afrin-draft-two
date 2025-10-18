import Image from "next/image";
import { UpdateButton, DeleteButton } from "@/app/ui/kits/buttons";
import { fetchFilteredSessions } from "@/app/lib/data";
import { formatDate, formatEstimatedTime, formatTime } from "@/app/lib/utils";
import { FormattedSessionsTable } from "@/app/lib/definitions";

type SessionsTableProps = {
  query: string;
  currentPage: number;
  from: string;
  to: string;
  totalSessions: number;
};

function MobileSessionCard({ session }: { session: FormattedSessionsTable }) {
  const date = formatDate(session.check_in);
  const checkInTime = formatTime(session.check_in);
  const checkOutTime = formatTime(session.check_out);

  return (
    <div className="mb-2 w-full rounded-md bg-white p-4">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <div className="mb-2 flex items-center">
            <Image
              src="/user.png"
              className="ml-2 rounded-full"
              width={28}
              height={28}
              alt={`${session.first_name}'s profile picture`}
            />
            <p>
              {session.first_name} {session.last_name}
            </p>
          </div>
          <p className="text-sm text-gray-500">{date}</p>
        </div>
        <span className="rounded-md bg-gray-100 px-2 py-1 text-sm max-w-[80px] text-center">
          {formatEstimatedTime(+session.estimated_time, "brief")}
        </span>
      </div>
      <div className="flex w-full items-center justify-between pt-4">
        <div>
          <p>
            <Image
              src="/check-in.png"
              alt="Check In Icon"
              width={16}
              height={16}
              className="inline-block ml-1"
            />
            {checkInTime}
          </p>
          <p>
            <Image
              src="/check-out.png"
              alt="Check Out Icon"
              width={16}
              height={16}
              className="inline-block ml-1 scale-x-[-1]"
            />
            {checkOutTime}
          </p>
        </div>
        <div className="flex justify-end gap-2">
          <UpdateButton id={session.id} tableName="sessions" />
          <DeleteButton id={session.id} tableName="sessions" />
        </div>
      </div>
    </div>
  );
}

function DesktopSessionRow({ session }: { session: FormattedSessionsTable }) {
  const date = formatDate(session.check_in);
  const checkInTime = formatTime(session.check_in);
  const checkOutTime = formatTime(session.check_out);

  return (
    <tr
      key={session.id}
      className="w-full border-b py-3 text-sm last-of-type:border-none
        [&:first-child>td:first-child]:rounded-tl-lg
        [&:first-child>td:last-child]:rounded-tr-lg
        [&:last-child>td:first-child]:rounded-bl-lg
        [&:last-child>td:last-child]:rounded-br-lg"
    >
      <td className="whitespace-nowrap py-3 pl-6 pr-3">
        <div className="flex items-center gap-3">
          <Image
            src="/user.png"
            className="rounded-full"
            width={28}
            height={28}
            alt={`${session.first_name}'s profile picture`}
          />
          <p>
            {session.first_name} {session.last_name}
          </p>
        </div>
      </td>
      <td className="whitespace-nowrap px-3 py-3">{date}</td>
      <td className="whitespace-nowrap px-3 py-3">{checkInTime}</td>
      <td className="whitespace-nowrap px-3 py-3">{checkOutTime}</td>
      <td className="whitespace-nowrap px-3 py-3">
        {formatEstimatedTime(+session.estimated_time, "full")}
      </td>
      <td className="whitespace-nowrap py-3 pl-6 pr-3">
        <div className="flex justify-end gap-3">
          <UpdateButton id={session.id} tableName="sessions" />
          <DeleteButton id={session.id} tableName="sessions" />
        </div>
      </td>
    </tr>
  );
}

export default async function SessionsTable({
  query,
  currentPage,
  from,
  to,
  totalSessions,
}: SessionsTableProps) {
  const sessions = await fetchFilteredSessions(query, currentPage, from, to);

  return (
    <div className="mt-6 flow-root">
      <p className="mb-4 text-sm text-left text-gray-700">
        عدد الجلسات: {totalSessions}
      </p>
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          {/* Mobile view */}
          <div className="lg:hidden">
            {sessions?.map((session) => (
              <MobileSessionCard key={session.id} session={session} />
            ))}
          </div>

          {/* Desktop view */}
          <table className="hidden min-w-full text-gray-900 lg:table">
            <thead className="rounded-lg text-right text-sm font-normal">
              <tr>
                <th className="px-4 py-5 font-medium sm:pl-6">اسم الطالب</th>
                <th className="px-3 py-5 font-medium">التاريخ</th>
                <th className="px-3 py-5 font-medium">وقت الدخول</th>
                <th className="px-3 py-5 font-medium">وقت الخروج</th>
                <th className="px-3 py-5 font-medium">الوقت المقدر</th>
                <th className="relative py-3 pl-6 pr-3">
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {sessions?.map((session) => (
                <DesktopSessionRow key={session.id} session={session} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
