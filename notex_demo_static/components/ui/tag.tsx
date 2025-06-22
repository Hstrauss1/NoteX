import { cn } from "@/lib/utils";
import React from "react";

export default function Tag({
  name,
  className,
  children,
  ...props
}: {
  name: string;
  className?: string;
  children?: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 shadow-xs rounded-md px-2 py-1 text-black dark:text-white flex items-center gap-2 w-fit text-sm",
        className
      )}
      {...props}
    >
      <span className="uppercase text-inherit">{name.replace(/-/g, " ")}</span>
      {children}
    </div>
  );
}
