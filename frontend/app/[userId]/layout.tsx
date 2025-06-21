import { CommandMenu } from "@/app/[userId]/CommandMenu";
import { cookies } from "next/headers";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getUser } from "./initializeUser";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  const supabase = await createClient();
  const currentUser = (await supabase.auth.getUser()).data.user;
  const session = await supabase.auth.getSession();
  const token = session.data.session?.access_token;

  if (!currentUser || !token) redirect("/signin");

  const userId = currentUser.id;
  const user = await getUser(userId, token);

  if (!user) redirect("/error");

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar user={user} />
      <main className="flex flex-col flex-1 bg-neutral-50 dark:bg-neutral-900">
        <div className="border-b border-neutral-300/70 dark:border-neutral-700/70 bg-white dark:bg-neutral-800 sticky top-0 h-11 flex items-center px-2 z-10">
          <SidebarTrigger />
        </div>
        <div className="flex-1">{children}</div>
        <CommandMenu />
      </main>
    </SidebarProvider>
  );
}
