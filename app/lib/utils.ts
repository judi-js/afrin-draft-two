import { StudentCount } from "@/app/lib/definitions";

export const formatCurrency = (amount: number) => {
  return (amount / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
};

export const formatDateToLocal = (
  dateStr: string,
  locale: string = "en-US"
) => {
  const date = new Date(dateStr);
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  };
  const formatter = new Intl.DateTimeFormat(locale, options);
  return formatter.format(date);
};

export const generateYAxis = (studentsCount: StudentCount[]) => {
  const yAxisLabels: string[] = [];
  const highestRecord = Math.max(
    ...studentsCount.map((m) => m.cumulative_count),
    0
  );

  // Base step before rounding
  const rawStep = Math.ceil(highestRecord / 5);

  // Round step up to nearest 10
  const step = Math.ceil(rawStep / 10) * 10;

  // Top label is 5 steps
  const topLabel = step * 5;

  // Build exactly 6 labels (0 through topLabel)
  for (let i = 0; i <= 5; i++) {
    yAxisLabels.unshift(`${i * step}`);
  }

  return { yAxisLabels, topLabel };
};

export const generatePagination = (currentPage: number, totalPages: number) => {
  // If total pages are 5 or less, show all
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // If current page is in the first 3 pages
  if (currentPage <= 3) {
    return [1, 2, 3, "...", totalPages];
  }

  // If current page is in the last 3 pages
  if (currentPage >= totalPages - 2) {
    return [1, "...", totalPages - 2, totalPages - 1, totalPages];
  }

  // Otherwise, show first page, ellipsis, current page, ellipsis, last page
  return [1, "...", currentPage, "...", totalPages];
};

export const generatePaginationForBigScreens = (
  currentPage: number,
  totalPages: number
) => {
  // If the total number of pages is 7 or less,
  // display all pages without any ellipsis.
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // If the current page is among the first 3 pages,
  // show the first 3, an ellipsis, and the last 2 pages.
  if (currentPage <= 3) {
    return [1, 2, 3, "...", totalPages - 1, totalPages];
  }

  // If the current page is among the last 3 pages,
  // show the first 2, an ellipsis, and the last 3 pages.
  if (currentPage >= totalPages - 2) {
    return [1, 2, "...", totalPages - 2, totalPages - 1, totalPages];
  }

  // If the current page is somewhere in the middle,
  // show the first page, an ellipsis, the current page and its neighbors,
  // another ellipsis, and the last page.
  return [
    1,
    "...",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "...",
    totalPages,
  ];
};

export const formatEstimatedTime = (
  minutes: number,
  mode: "brief" | "full"
) => {
  const hourLabel = mode === "brief" ? "س" : "ساعة";
  const dayLabel = mode === "brief" ? "ي" : "يوم";
  const minuteLabel = mode === "brief" ? "د" : "دقيقة";

  if (minutes < 60) return `${minutes} دقيقة`;
  if (minutes < 1440) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) return `${hours} ساعة`;
    return `${hours} ${hourLabel} ${mins} ${minuteLabel}`;
  }

  const days = Math.floor(minutes / 1440);
  const remainingMinutes = minutes % 1440;
  const hours = Math.floor(remainingMinutes / 60);
  const mins = remainingMinutes % 60;

  if (hours === 0 && mins === 0) return `${days} يوم`;
  if (mins === 0) return `${days} ${dayLabel} و ${hours} ساعة`;
  if (hours === 0) return `${days} ${dayLabel} و ${mins} دقيقة`;

  return `${days} ${dayLabel} و ${hours} ${hourLabel} و ${mins} ${minuteLabel}`;
};

export function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ar-EG", {
    weekday: "long",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
}

export function formatTime(dateStr: string | null) {
  if (!dateStr) return "غير مسجل";
  return new Date(dateStr).toLocaleTimeString("ar-EG", {
    hour: "2-digit",
    minute: "2-digit",
  });
}