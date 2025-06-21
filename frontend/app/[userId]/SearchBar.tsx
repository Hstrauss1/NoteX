"use client";
import React, { useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { File, Loader, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { extractCourseInfo, searchCourse } from "./action";
import { Note } from "../types";
import Link from "next/link";
import Tag from "@/components/ui/tag";

export default function SearchBar({
  userId,
  token,
  className,
}: {
  userId: string;
  token: string;
  className?: string;
}) {
  const [state, action, loading] = useActionState(
    async (_: unknown, formData: FormData) => {
      try {
        const query = formData.get("query") as string;
        if (!query || query.trim() === "") {
          throw new Error("Search query cannot be empty");
        }
        console.log("Search query:", query);
        const { course, number } = await extractCourseInfo(query);
        const r = await searchCourse(course, number, token);

        console.log("Search results:", r);

        return { status: "success", data: r.data ?? [] };
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
      console.log("Search completed successfully:", state.data);
    } else if (state?.status === "error") {
      console.error("Search failed:", state.error);
    }
  }, [state]);

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto gap-3">
      <form
        className={cn("flex items-center gap-2 w-full", className)}
        action={action}
      >
        <Input
          placeholder="Search notes..."
          name="query"
          className="dark:bg-neutral-800 focus-visible:bg-transparent"
        />
        <Button type="submit" disabled={loading}>
          {loading ? <Loader className="animate-spin" /> : <Search />}
          Search
        </Button>
      </form>
      <div className="flex flex-col w-full gap-2 mx-auto">
        {state?.status === "success" &&
        state.data &&
        Array.isArray(state.data) &&
        state.data.length > 0 ? (
          state.data.map((note: Note, index: number) => (
            <Link
              key={index}
              href={`/${userId}/note/${note.note_id}`}
              className="w-full p-4 border border-neutral-300/50 dark:border-neutral-700/50 rounded-xl bg-white dark:bg-neutral-800 flex flex-row justify-between items-start gap-4 hover:border-neutral-300 dark:hover:border-neutral-700 shadow-xs max-w-md"
            >
              <div className="flex items-start gap-3">
                <div className="bg-neutral-100 border border-neutral-300 dark:bg-neutral-700 dark:border-neutral-600 rounded-full p-3 flex items-center justify-center *:size-5">
                  <File />
                </div>
                <div>
                  <h4>{note.title}</h4>
                  <p className="opacity-50">{note.votes} Likes</p>
                </div>
              </div>
              <div>
                {note.tags && note.tags.length > 0
                  ? note.tags.map((tag, tagIndex) => (
                      <Tag key={tagIndex} name={tag} />
                    ))
                  : note.tags === null
                  ? "No tags"
                  : "No tags"}
              </div>
            </Link>
          ))
        ) : (
          <p></p>
        )}
      </div>
    </div>
  );
}
