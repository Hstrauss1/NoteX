"use server";

import { createClient } from "@/lib/supabase/server";

export const createNote = async (
  _: unknown,
  formData: FormData
): Promise<
  | {
      status: "success";
      data: { note_id: string; pdf_path: string; tags: string[] };
    }
  | {
      status: "error";
      error: string;
    }
> => {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_ENDPOINT}/upload-note`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    if (!response.ok) throw new Error("Upload failed");
    return {
      status: "success",
      data: await response.json(),
    };
  } catch (err) {
    console.error("Error uploading note:", err);
    return {
      status: "error",
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
};
