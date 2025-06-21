"use client";
import { Note } from "@/app/types";
import { Button } from "@/components/ui/button";
import { Loader, ThumbsUp } from "lucide-react";
import React, { useEffect } from "react";
import { useActionState } from "react";
import { likeNote } from "./action";
import { Session } from "@supabase/supabase-js";

export default function LikeNote({
  note,
  session,
}: {
  note: Note;
  session: Session;
}) {
  const {
    user: { id: userId },
    access_token: token,
  } = session;
  const [state, unlockNoteAction, loading] = useActionState(
    async (_: unknown, formData: FormData) => {
      try {
        await likeNote(formData, token);
        return { status: "success", data: { note_id: note.note_id } };
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
      console.log("Note unlocked successfully:", state.data);
    } else if (state?.status === "error") {
      console.error("Failed to unlock note:", state.error);
    }
  }, [state]);

  return (
    <form action={unlockNoteAction}>
      <input type="hidden" name="note-id" value={note.note_id} />
      <input type="hidden" name="user-id" value={userId} />
      <Button
        variant="secondary"
        size="sm"
        className="w-fit"
        disabled={loading}
      >
        {loading ? <Loader className="animate-spin" /> : <ThumbsUp />}
        {loading ? "Adding to like..." : `${note.votes} Likes`}
      </Button>
    </form>
  );
}
