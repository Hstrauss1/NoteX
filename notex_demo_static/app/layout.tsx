import "./globals.css";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/ui/AppSidebar";

/* Dummy user object for sidebar avatar, name, etc. */
const demoUser = {
  name: "Demo User",
  avatarUrl: "https://ui-avatars.com/api/?name=Demo",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex h-screen overflow-hidden">
        <SidebarProvider defaultOpen={true}>
          {/* ← same sidebar component, now fed a dummy user */}
          <AppSidebar user={demoUser} />
          <main className="flex flex-col flex-1 bg-neutral-50 dark:bg-neutral-900">
            {/* Top bar */}
            <header className="border-b bg-white dark:bg-neutral-800 h-11 flex items-center px-2 sticky top-0 z-10">
              <SidebarTrigger />
              <h1 className="ml-4 font-bold">NoteX Demo</h1>
            </header>
            <div className="flex-1 overflow-y-auto">{children}</div>
          </main>
        </SidebarProvider>
      </body>
    </html>
  );
}
