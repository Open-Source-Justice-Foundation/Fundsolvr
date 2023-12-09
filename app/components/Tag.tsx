"use client";

export default function Tag({ tag }: any) {
  return (
    <div
      key={tag}
      className="flex cursor-pointer select-none items-center gap-x-2 rounded-lg bg-gray-200 px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-300 dark:bg-darkFormFieldBackground dark:text-gray-100 dark:hover:bg-gray-600"
    >
      {tag}
    </div>
  );
}
