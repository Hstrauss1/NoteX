"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Loader, Send } from "lucide-react";
import { useActionState, useEffect } from "react";
import { commentOnNote } from "./action";
import { Session } from "@supabase/supabase-js";
import { Note } from "@/app/types";

export const CommentForm = ({
  noteId,
  session,
  className,
}: {
  noteId: Note["note_id"];
  session: Session;
  className?: string;
}) => {
  const {
    user: { id: userId },
    access_token: token,
  } = session;

  const [state, commentAction, loading] = useActionState(
    async (_: unknown, formData: FormData) => {
      try {
        const comment = formData.get("comment") as string;
        if (!formData.has("comment") || formData.get("comment") === "") {
          throw new Error("Comment cannot be empty");
        }

        await commentOnNote(formData, token);
        console.log("Comment submitted:", comment);
        return { status: "success", data: { comment } };
      } catch (error) {
        return {
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
    null
  );

  useEffect(() => {
    if (state?.status === "success") {
      console.log("Comment submitted successfully");
    } else if (state?.status === "error") {
      console.error("Failed to submit comment");
    }
  }, [state]);

  return (
    <form
      className={cn("w-full flex items-center gap-1.5", className)}
      action={commentAction}
    >
      <input type="hidden" name="note-id" value={noteId} />
      <input type="hidden" name="user-id" value={userId} />
      <Input placeholder="Add a review..." className="flex-1" name="comment" />
      <Button type="submit" disabled={loading}>
        {loading ? <Loader className="animate-spin" /> : <Send />}
        {loading ? "Sending..." : "Send"}
      </Button>
    </form>
  );
};
