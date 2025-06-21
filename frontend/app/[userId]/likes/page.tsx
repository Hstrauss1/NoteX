import { NoteLinkSkeleton } from "@/components/ui/note-link";
import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";
import ListLikeNotes from "./ListLikedNotes";

export default async function LikesPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const supabase = await createClient();
  const session = await supabase.auth.getSession();
  const token = session.data.session?.access_token;
  if (!token) return null;
  return (
    <section className="w-full h-full">
      <div className="wm-auto flex flex-col gap-6 pt-10">
        <h1>Liked Notes</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Suspense
            fallback={Array(4)
              .fill(0)
              .map((_, index) => (
                <NoteLinkSkeleton key={index} />
              ))}
          >
            <ListLikeNotes userId={userId} token={token} />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
