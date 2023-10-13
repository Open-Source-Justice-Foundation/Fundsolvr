import { classNames } from "@/app/lib/utils";

interface IBadgeProps {
  content?: string | number;
  size?: number;
}

export default function Badge({ content = "", size = 4 }: IBadgeProps) {
  return (
    <span
      className={classNames(
        `w-${size} h-${size}`,
        "inline-flex aspect-square items-center justify-center rounded-full bg-indigo-600 px-1 text-xs font-semibold text-white",
      )}
    >
      {content}
    </span>
  );
}
