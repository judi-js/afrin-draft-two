import Image from "next/image";
import { fetchFilteredSessionsByStudent } from "@/app/lib/data";
import { formatDate, formatEstimatedTime, formatTime } from "@/app/lib/utils";

type StudentSession = {
  id: string;
  first_name: string;
  last_name: string;
  check_in: string;
  check_out: string | null;
  estimated_time: number | string;
};

type Props = {
  query: string;
  currentPage: number;
  studentId: string;
  handleLogout: () => Promise<void>;
  totalSessions: number;
};

// --- Mobile card component ---
function MobileStudentSessionCard({ session }: { session: StudentSession }) {
  const date = formatDate(session.check_in);
  const checkInTime = formatTime(session.check_in);
  const checkOutTime = formatTime(session.check_out);

  return (
    <div className="mb-2 w-full rounded-md bg-white p-4">
      <div className="flex items-center justify-between border-b pb-4">
        <p className="text-sm text-gray-500">{date}</p>
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
      </div>
    </div>
  );
}

// --- Desktop row component ---
function DesktopStudentSessionRow({ session }: { session: StudentSession }) {
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
      <td className="whitespace-nowrap px-3 py-3">{date}</td>
      <td className="whitespace-nowrap px-3 py-3">{checkInTime}</td>
      <td className="whitespace-nowrap px-3 py-3">{checkOutTime}</td>
      <td className="whitespace-nowrap px-3 py-3">
        {formatEstimatedTime(+session.estimated_time, "full")}
      </td>
    </tr>
  );
}

// --- Main component ---
export default async function StudentSessionsTable({
  query,
  currentPage,
  studentId,
  handleLogout,
  totalSessions,
}: Props) {
  const sessions = await fetchFilteredSessionsByStudent(
    query,
    currentPage,
    studentId
  );

  if (sessions.length === 0) {
    return (
      <div className="mt-6 flow-root text-center">
        <button
          onClick={handleLogout}
          className="text-blue-500 px-4 py-2 rounded underline"
        >
          تسجيل الخروج
        </button>
        <p>لا يوجد جلسات مسجلة بعد</p>
      </div>
    );
  }

  return (
    <div className="mt-6 flow-root">

      <div className="flex w-full items-center justify-between">
        <div className="mb-2 flex items-center">
          <Image
            src="/user.png"
            className="ml-3 rounded-full"
            width={36}
            height={36}
            alt={`${sessions[0].first_name}'s profile picture`}
          />
          <p>
            {sessions[0].first_name} {sessions[0].last_name}{" "}
            {"("}{totalSessions} جلسة{")"}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="text-blue-500 px-4 py-2 rounded underline"
        >
          تسجيل الخروج
        </button>
      </div>

      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          {/* Mobile view */}
          <div className="md:hidden">
            {sessions.map((session) => (
              <MobileStudentSessionCard key={session.id} session={session} />
            ))}
          </div>

          {/* Desktop view */}
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-right text-sm font-normal">
              <tr>
                <th className="px-3 py-5 font-medium">التاريخ</th>
                <th className="px-3 py-5 font-medium">وقت الدخول</th>
                <th className="px-3 py-5 font-medium">وقت الخروج</th>
                <th className="px-3 py-5 font-medium">الوقت المقدر</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {sessions.map((session) => (
                <DesktopStudentSessionRow key={session.id} session={session} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
