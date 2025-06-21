import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (data.user) redirect(`/${data.user.id}`);

  return (
    <div className="min-h-screen flex items-center justify-center">
      {children}
    </div>
  );
}
