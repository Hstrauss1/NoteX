import { cn } from "@/lib/utils";
import { format } from "date-fns";

export const Comment = async ({
  comment,
  date,
  className,
}: {
  comment: string;
  date: string;
  className?: string;
}) => {
  // const user = await getUser(userId);
  // console.log(user);
  return (
    <div
      className={cn(
        "bg-neutral-50 dark:bg-neutral-700 border border-neutral-200/70 dark:border-neutral-600/70 rounded-xl p-4 h-fit shadow-xs",
        className
      )}
    >
      <p className="p-0">{comment}</p>
      <time className="text-xs text-neutral-400">
        {format(date, "MMMM d, yyyy h:mm a")}
      </time>
    </div>
  );
};
