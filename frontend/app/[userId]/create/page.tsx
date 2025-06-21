"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { redirect, useParams } from "next/navigation";
import { useActionState, useEffect } from "react";
import { createNote } from "./action";
import { Loader, PlusSquare } from "lucide-react";
import { toast } from "sonner";
import Field from "@/components/ui/Field";
import TagInput from "@/components/ui/tag-input";

export default function CreatePage() {
  const { userId } = useParams<{ userId: string }>();

  const [state, action, pending] = useActionState(createNote, null);

  useEffect(() => {
    if (state?.status === "success") {
      toast.success("Note created successfully!");
      redirect(`/${userId}/note/${state.data.note_id}`);
    } else if (state?.status === "error") {
      toast.error("Something went wrong");
    }
  }, [state, userId]);

  return (
    <section className="w-full h-full flex items-center justify-center flex-col gap-10">
      <h1>Create a New Note</h1>
      <form
        className="grid gap-5 min-w-[28rem] p-6 border border-neutral-300/70 dark:border-neutral-700/70 shadow-xs bg-white dark:bg-neutral-800 rounded-3xl"
        action={action}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.preventDefault();
        }}
      >
        <Field label="Title of your note">
          <Input
            type="text"
            placeholder="Fall quarter 2024"
            name="title"
            required
          />
        </Field>
        <Field label="Tags">
          <TagInput />
        </Field>
        <Field label="Upload PDF">
          <Input
            type="file"
            placeholder="Title"
            name="pdf"
            accept="application/pdf"
            required
          />
        </Field>
        <input hidden readOnly name="user_id" value={userId} />
        <Button type="submit" disabled={pending}>
          {pending ? <Loader className="animate-spin" /> : <PlusSquare />}
          {pending ? "Creating..." : "Create Note"}
        </Button>
      </form>
      <p className="text-neutral-400 text-sm text-center">
        All notes uploaded must follow community guidelines.
        <br />
        For details refer to the privacy policy.
      </p>
    </section>
  );
}
