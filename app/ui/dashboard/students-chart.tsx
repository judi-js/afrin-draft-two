import { generateYAxis } from '@/app/lib/utils';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { fetchStudentsCount } from '@/app/lib/data';

// This component is representational only.
// For data visualization UI, check out:
// https://www.tremor.so/
// https://www.chartjs.org/
// https://airbnb.io/visx/

export default async function RevenueChart() {
  const { data, years } = await fetchStudentsCount();
  console.log(years, data);

  const chartHeight = 350;
  const { yAxisLabels, topLabel } = generateYAxis(data);
  console.log(yAxisLabels, topLabel);

  if (!data || data.length === 0) {
    return <p className="mt-4 text-gray-400">No data available.</p>;
  }

  const checkMonthInPast = (month: string, year: number) => {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthDate = new Date(`${month.trim()} 1, ${year}`);
    return monthDate <= currentMonthStart;
  }

  return (
    <div className="w-full md:col-span-4">
      <h2 className={`mb-4 text-xl md:text-2xl`}>
        عدد الطلاب التراكمي
      </h2>
      <div className="rounded-xl bg-gray-50 p-4">
        <div className="sm:grid-cols-13 mt-0 grid grid-cols-12 items-end gap-2 rounded-md bg-white p-4 md:gap-4">
          {/* y-axis */}
          <div
            className="mb-6 hidden flex-col justify-between text-sm text-gray-400 sm:flex"
            style={{ height: `${chartHeight}px` }}
          >
            {yAxisLabels.map((label) => (
              <p key={label}>{label}</p>
            ))}
          </div>

          {data.map((month) => (
            <div key={month.month_name} className="flex flex-col items-center gap-2">
              {/* bars */}
              <div
                className={`w-full rounded-md relative group ${checkMonthInPast(month.month_name, month.year) ? 'bg-blue-300' : 'bg-gray-300'}`}
                style={{
                  height: `${(chartHeight / topLabel) * month.cumulative_count}px`,
                }}
              >
                {/* Tooltip */}
                <span className="absolute left-1/2 -translate-x-1/2 -top-7 z-10 hidden group-hover:block bg-gray-700 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                  {month.cumulative_count}
                </span>
              </div>
              {/* x-axis */}
              <p className="-rotate-90 text-sm text-gray-400 sm:rotate-0">
                {month.month_name.slice(0, 3)}
              </p>
            </div>
          ))}
        </div>
        <div className="flex items-center pb-2 pt-6">
          <CalendarIcon className="h-5 w-5 text-gray-500" />
          <h3 className="mr-2 text-sm text-gray-500 ">اخر 12 شهر {years[0] + "-" + years[1]}</h3>
        </div>
      </div>
    </div>
  );
}
