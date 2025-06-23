import React from "react";

export default function AppSidebar({ user }: { user: { name: string; avatarUrl: string } }) {
  return (
    <aside className="w-56 bg-white dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-700 h-full flex flex-col">
      <div className="p-4 flex items-center gap-3 border-b">
        <img src={user.avatarUrl} className="size-8 rounded-full" />
        <span className="font-medium">{user.name}</span>
      </div>
      {/* static nav */}
      <nav className="p-4 space-y-2 text-sm">
        <a className="block hover:underline" href="#">All Notes</a>
        <a className="block hover:underline" href="#">Favorites</a>
        <a className="block hover:underline" href="#">About Demo</a>
      </nav>
    </aside>
  );
}
