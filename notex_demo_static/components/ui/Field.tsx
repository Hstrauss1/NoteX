import { cn } from "@/lib/utils";
import React from "react";

export default function Field({
  label,
  flow = "col",
  children,
}: {
  label: string;
  flow?: "col" | "row";
  children: React.ReactNode;
}) {
  return (
    <div className={cn(flow === "col" ? "grid gap-2" : "flex gap-4")}>
      <label
        className={cn(flow === "col" ? "text-left" : "text-right w-36 pt-2")}
      >
        {label}
      </label>
      {children}
    </div>
  );
}
