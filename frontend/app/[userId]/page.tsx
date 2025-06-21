import { createClient } from "@/lib/supabase/server";
import SearchBar from "./SearchBar";
import { redirect } from "next/navigation";

export default async function DefaultPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) redirect("/signin");
  const {
    user: { id: userId },
    access_token: token,
  } = session;

  return (
    <div className="p-6 flex flex-col items-center justify-center h-full gap-12">
      <hgroup className="flex flex-col items-center gap-2">
        <h1>Welcome to the Notex</h1>
        <p>Use natural language to search for notes.</p>
      </hgroup>
      <SearchBar userId={userId} token={token} />
    </div>
  );
}
