import { Note } from "@/app/types";
import NoteLink from "@/components/ui/note-link";
import React from "react";

export default async function ListMyUnlockedNotes({
  userId,
  token,
}: {
  userId: string;
  token: string;
}) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_ENDPOINT}/user/${userId}/unlocked-notes`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!res.ok) {
    return (
      <section className="w-full h-full">
        <h1>Error fetching liked notes</h1>
      </section>
    );
  }

  const { notes } = (await res.json()) as {
    user_id: string;
    notes: Note[];
  };
  return (
    <>
      {Array.isArray(notes) && notes.length > 0 ? (
        notes.map((n: Note) => (
          <NoteLink key={n.note_id} note={n} token={token} />
        ))
      ) : (
        <div className="border border-dashed border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 col-span-2 p-4 rounded-xl min-h-34 flex items-center justify-center">
          No notes found.
        </div>
      )}
    </>
  );
}
