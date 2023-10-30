import { DetailedHTMLProps, HTMLAttributes } from "react";

import { classNames } from "@/app/lib/utils";

interface ShimmerProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> { }

const Shimmer = ({ children, className = "", ...props }: ShimmerProps) => (
  <div
    className={classNames(
      "relative isolate overflow-hidden bg-opacity-60",
      "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite]",
      "before:bg-gradient-to-r before:from-transparent before:to-transparent",
      "bg-gray-300 before:via-gray-100",
      "dark:bg-gray-600 dark:before:via-gray-500",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export default Shimmer;
