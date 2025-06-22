import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-neutral-400 selection:bg-sky-200 dark:selection:bg-sky-800 selection:text-black dark:selection:text-white border border-neutral-300/70 dark:border-neutral-700/70 flex h-9 w-full min-w-0 rounded-lg bg-white dark:bg-neutral-900 px-3 py-1 text-base transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:mr-2 file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-neutral-400 focus-visible:ring-neutral-200/70 dark:focus-visible:border-neutral-600 dark:focus-visible:ring-neutral-700/70 focus-visible:ring-2",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  );
}

export { Input };
