import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";
import NoteInfo, { NoteInfoSkeleton } from "./NoteInfo";
import ListComment, { ListCommentSkeleton } from "./ListComment";

export default async function NotePage({
  params,
}: {
  params: Promise<{ noteId: string }>;
}) {
  const { noteId } = await params;
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return null;

  return (
    <div className="flex flex-col h-full">
      <div className="bg-transparent shadow-inner">
        <section className="wm-auto flex justify-between gap-12 items-center py-16">
          <Suspense fallback={<NoteInfoSkeleton />}>
            <NoteInfo noteId={noteId} session={session} />
          </Suspense>
        </section>
      </div>
      <hr />
      <section className="bg-white dark:bg-neutral-800 h-full">
        <div className="wm-auto py-12 flex-1 flex flex-col h-full">
          <div>
            <h4>Reviews</h4>
            <div className="grid grid-cols-2 gap-2 py-4">
              <Suspense fallback={<ListCommentSkeleton />}>
                <ListComment noteId={noteId} session={session} />
              </Suspense>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
