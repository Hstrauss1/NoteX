import { getUser, initializeUser } from "@/app/[userId]/initializeUser";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
// The client you created from the Server-Side Auth instructions

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const {
      data: { session },
      error,
    } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && session) {
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";
      const user = session?.user;
      let redirectTo = next.replace("user", `${user.id}`);
      console.log("User ID:", user.id);
      // Check if the user already exists

      try {
        await getUser(user.id, session?.access_token);
        console.log("User already exists, redirecting...");
      } catch (error) {
        console.log(error);
        console.log(user);

        // If the user does not exist, initialize them
        await initializeUser(
          user.id,
          user.user_metadata.avatar_url,
          user.user_metadata.name,
          session?.access_token
        );
        redirectTo = next.replace(`user`, `/${user.id}/onboarding`);
      }

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${redirectTo}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${redirectTo}`);
      } else {
        return NextResponse.redirect(`${origin}${redirectTo}`);
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
