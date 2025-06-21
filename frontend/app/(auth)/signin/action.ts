"use server";
import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const signIn = async () => {
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  // 2. Sign in with GitHub
  const { error, data } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback?next=/user`,
    },
  });

  if (error) {
    console.log(error);
  } else {
    return redirect(data.url);
  }
};

export const signOut = async () => {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Sign out error:", error);
  }
  redirect("/signin");
};
