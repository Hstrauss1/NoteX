"use client";
import React from "react";
import Link from "next/link";
import { Note } from "../../lib/demoData";    // ← adjust path if needed
import Tag from "./tag";

/* ---------- Optional loading skeleton ---------- */
export function NoteLinkSkeleton() {
  return (
    <div className="p-4 bg-white dark:bg-neutral-800 border border-neutral-300/50 dark:border-neutral-700/50 rounded-xl shadow-xs flex flex-col gap-2 h-32 animate-pulse">
      <div className="h-4 w-3/4 bg-neutral-200 dark:bg-neutral-700 rounded" />
      <div className="h-3 w-1/2 bg-neutral-200 dark:bg-neutral-700 rounded" />
    </div>
  );
}

/* ---------- Demo-mode NoteLink (no token, no PDF blob fetch) ---------- */
interface NoteLinkProps {
  note: Note;
}

export default function NoteLink({ note }: NoteLinkProps) {
  return (
    <Link
      href={note.file}                  /* opens bundled PDF */
      target="_blank"
      rel="noopener noreferrer"
      className="p-4 border border-neutral-300/50 dark:border-neutral-700/50 rounded-xl bg-white dark:bg-neutral-800 flex flex-row justify-between items-center gap-4 hover:border-neutral-300 dark:hover:border-neutral-700 shadow-xs"
    >
      <div className="flex-1 flex flex-col gap-1">
        {/* tags */}
        {note.tags && (
          <div className="flex flex-wrap gap-1 pb-2">
            {note.tags.map((tag, idx) => (
              <Tag key={idx} name={tag} className="text-xs" />
            ))}
          </div>
        )}

        {/* title & votes */}
        <hgroup className="grid gap-1">
          <h2 className="text-base text-black dark:text-white">
            {note.title}
          </h2>
          <div className="text-sm opacity-50">Likes: {note.votes ?? 0}</div>
        </hgroup>
      </div>

      {/* simple thumbnail placeholder */}
      <div className="flex-shrink-0 w-16 h-20 bg-neutral-100 dark:bg-neutral-700 rounded-md flex items-center justify-center text-xs text-neutral-500">
        PDF
      </div>
    </Link>
  );
}
