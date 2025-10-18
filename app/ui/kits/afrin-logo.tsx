import { BookOpenIcon } from '@heroicons/react/24/outline';

export default function AfrinLogo() {
  return (
    <div
      className={`flex flex-row gap-2 items-center max-sm:justify-center leading-none text-white`}
    >
      <BookOpenIcon className="h-12 w-12 rotate-[15deg]" />
      <p className="text-[44px]">معهد عفرين</p>
    </div>
  );
}
