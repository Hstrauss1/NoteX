"use server";

import { revalidatePath } from "next/cache";

export const deleteNote = async (noteId: string, token: string) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_ENDPOINT}/delete-note/${noteId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!res.ok) throw new Error("Failed to update note");
  return await res.json();
};

export const unlockNote = async (fromData: FormData, token: string) => {
  const note_id = fromData.get("note-id") as string;
  const user_id = fromData.get("user-id") as string;
  if (!user_id || !note_id) {
    throw new Error("User ID and Note ID are required");
  }
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_ENDPOINT}/unlock_note`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        user_id,
        note_id,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to unlock note");
  }

  const result = await response.json();
  console.log("Note unlocked successfully:", result);
  return result;
};

export const isNoteUnlocked = async (
  noteId: string,
  userId: string,
  token: string
) => {
  const params = new URLSearchParams({ note_id: noteId, user_id: userId });

  const response = await fetch(
    `${
      process.env.NEXT_PUBLIC_BACKEND_ENDPOINT
    }/is_note_unlocked?${params.toString()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to check note unlock status");
  }

  return (await response.json()) as {
    note_id: string;
    user_id: string;
    is_unlocked: boolean;
  };
};

export const likeNote = async (formData: FormData, token: string) => {
  const note_id = formData.get("note-id") as string;
  const user_id = formData.get("user-id") as string;
  if (!user_id || !note_id) {
    throw new Error("User ID and Note ID are required");
  }
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_ENDPOINT}/like_note`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        user_id,
        note_id,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to like note");
  }

  const result = await response.json();
  console.log("Note liked successfully:", result);
  revalidatePath(`/note/${note_id}`);
  return result;
};

export const commentOnNote = async (formData: FormData, token: string) => {
  const note_id = formData.get("note-id") as string;
  const user_id = formData.get("user-id") as string;
  const comment_text = formData.get("comment") as string;

  if (!user_id || !note_id || !comment_text) {
    return {
      status: "error",
      error: "User ID, Note ID, and comment text are required",
    };
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_ENDPOINT}/comment`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        user_id,
        note_id,
        comment_text,
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Error commenting on note:", errorText);
    throw new Error(
      `Failed to comment on note: ${errorText || "Unknown error"}`
    );
  }
  revalidatePath(`/note/${note_id}`);
  return await response.json();
};
