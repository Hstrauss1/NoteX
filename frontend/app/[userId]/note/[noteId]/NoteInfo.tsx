import React from "react";
import { getNoteData, getNotePdfBlob } from "./getNoteData";
import Tag from "@/components/ui/tag";
import { getUser } from "../../initializeUser";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye, Settings, ThumbsUp } from "lucide-react";
import SettingsForm from "./SettingsForm";
import Link from "next/link";
import PdfThumbnail from "@/components/ui/PdfThumbnail";
import { Skeleton } from "@/components/ui/skeleton";
import UnlockNote from "./UnlockNote";
import { Session } from "@supabase/supabase-js";
import { isNoteUnlocked } from "./action";
import LikeNote from "./LikeNote";

export function NoteInfoSkeleton() {
  return (
    <div className="flex flex-col gap-7 h-fit w-full">
      <div className="flex items-center gap-2">
        <Skeleton className="w-20 h-8" />
      </div>
      <hgroup className="grid gap-3">
        <Skeleton className="h-7 w-1/2 rounded" />
        <Skeleton className="h-4 w-1/3 rounded" />
      </hgroup>
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-24 rounded-full" />
        <Skeleton className="h-8 w-24 rounded-full" />
      </div>
    </div>
  );
}

export default async function NoteInfo({
  noteId,
  session,
}: {
  noteId: string;
  session: Session;
}) {
  const {
    user: { id: userId },
    access_token: token,
  } = session;
  const note = await getNoteData(noteId, token);
  const pdfBlob = await getNotePdfBlob(note.storage_path, token);
  const user = await getUser(note.user_id, token);

  const arrayBuffer = await pdfBlob.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  const pdfUrl = `data:application/pdf;base64,${base64}`;

  const { is_unlocked } = await isNoteUnlocked(note.note_id, userId, token);

  return (
    <>
      <div className="flex flex-col gap-6 h-fit">
        {note.tags.map((tag, index) => (
          <Tag key={index} name={tag} />
        ))}
        <hgroup className="grid gap-2">
          <h1>{note.title}</h1>
          <p className="text-md text-neutral-800 dark:text-neutral-200">
            Uploaded by {user.name}
          </p>
        </hgroup>
        <div className="flex items-center gap-2">
          {userId === note.user_id ? (
            <>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="secondary" size="sm">
                    <Settings />
                    Settings
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Settings</DialogTitle>
                  </DialogHeader>
                  <SettingsForm note={note} token={token} />
                </DialogContent>
              </Dialog>
              <Link href={`/${note.user_id}/note/${note.note_id}/view`}>
                <Button variant="secondary" size="sm">
                  <Eye />
                  View Note
                </Button>
              </Link>
            </>
          ) : is_unlocked ? (
            <>
              <Link href={`/${note.user_id}/note/${note.note_id}/view`}>
                <Button variant="secondary" size="sm">
                  <Eye />
                  View Note
                </Button>
              </Link>
              <LikeNote note={note} session={session} />
            </>
          ) : (
            <>
              <UnlockNote note={note} session={session} />
              <Button variant="secondary" size="sm" disabled>
                <ThumbsUp />
                {note.votes} Likes
              </Button>
            </>
          )}
        </div>
      </div>
      <PdfThumbnail url={pdfUrl} height={150} />
    </>
  );
}
