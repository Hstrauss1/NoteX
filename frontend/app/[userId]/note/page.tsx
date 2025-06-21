import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ListMyNotes from "./ListMyNotes";
import { Suspense } from "react";
import { NoteLinkSkeleton } from "@/components/ui/note-link";
import ListMyUnlockedNotes from "./ListMyUnlockedNotes";

export default async function NotePage({
  params,
}: {
  params: Promise<{ userId: string; noteId: string }>;
}) {
  const { userId } = await params;
  const supabase = await createClient();
  const session = await supabase.auth.getSession();
  const token = session.data.session?.access_token;
  if (!token) redirect("/signin");

  return (
    <section className="w-full h-full">
      <div className="wm-auto flex flex-col gap-6 pt-10">
        <h1>Notes</h1>
        <section className="flex flex-col gap-3">
          <h2>My Notes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Suspense
              fallback={Array(4)
                .fill(0)
                .map((_, index) => (
                  <NoteLinkSkeleton key={index} />
                ))}
            >
              <ListMyNotes userId={userId} token={token} />
            </Suspense>
          </div>
        </section>
        <section className="flex flex-col gap-3">
          <h2>Unlocked Notes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Suspense
              fallback={Array(4)
                .fill(0)
                .map((_, index) => (
                  <NoteLinkSkeleton key={index} />
                ))}
            >
              <ListMyUnlockedNotes userId={userId} token={token} />
            </Suspense>
          </div>
        </section>
      </div>
    </section>
  );
}
