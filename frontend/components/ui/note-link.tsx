import { getNotePdfBlob } from "@/app/[userId]/note/[noteId]/getNoteData";
import { Note } from "@/app/types";
import Link from "next/link";
import React from "react";
import Tag from "./tag";
import PdfThumbnail from "./PdfThumbnail";
import { Skeleton } from "./skeleton";

export async function NoteLinkSkeleton() {
  return (
    <Skeleton className="p-4 bg-white dark:bg-neutral-800 border border-neutral-300/50 dark:border-neutral-700/50 rounded-xl shadow-xs flex flex-col gap-2 h-32">
      <Skeleton className="h-4 rounded w-3/4" />
      <Skeleton className="h-3 rounded w-1/2" />
    </Skeleton>
  );
}

export default async function NoteLink({
  note,
  token,
}: {
  note: Note;
  token: string;
}) {
  const pdfBlob = await getNotePdfBlob(note.storage_path, token);
  const arrayBuffer = await pdfBlob.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  const pdfUrl = `data:application/pdf;base64,${base64}`;

  return (
    <Link
      key={note.note_id}
      href={`note/${note.note_id}`}
      className="p-4 border border-neutral-300/50 dark:border-neutral-700/50 rounded-xl bg-white dark:bg-neutral-800 flex flex-row justify-between items-center gap-4 hover:border-neutral-300 dark:hover:border-neutral-700 shadow-xs"
      prefetch
    >
      <div className="flex-1 flex flex-col gap-1 h-full">
        <div className="flex flex-wrap gap-1 pb-2">
          {note.tags &&
            note.tags.map((tag, index) => (
              <Tag key={index} name={tag} className="text-xs" />
            ))}
        </div>
        <hgroup className="grid gap-1 h-fit">
          <h2 className="text-base text-black dark:text-white">{note.title}</h2>
          <div className="text-sm opacity-50">Likes: {note.votes ?? 0}</div>
        </hgroup>
      </div>
      <div className="flex-shrink-0">
        <PdfThumbnail url={pdfUrl} height={100} />
      </div>
    </Link>
  );
}
