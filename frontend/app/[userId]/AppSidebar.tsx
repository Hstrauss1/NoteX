"use client";
import {
  AppWindow,
  File,
  Heart,
  Home,
  LogOut,
  MoonIcon,
  MoreHorizontal,
  PlusIcon,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import Image from "next/image";
import Link from "next/link";
import { Account } from "../types";
import { useTheme } from "next-themes";
import { useCommandMenu } from "../store";
import { signOut } from "../(auth)/signin/action";

// Menu items.
const items = [
  {
    title: "Create",
    url: "create",
    icon: PlusIcon,
  },
  {
    title: "Dashboard",
    url: "",
    icon: Home,
  },
  {
    title: "Notes",
    url: "note",
    icon: File,
  },
  {
    title: "Likes",
    url: "likes",
    icon: Heart,
  },
];

export function AppSidebar({ user }: { user: Account }) {
  const { theme, setTheme } = useTheme();
  const setOpen = useCommandMenu((state) => state.setOpen);

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link prefetch href={`/${user.user_id}/${item.url}`}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <Image
                    src={user.avatar}
                    className="rounded-full"
                    alt="Avatar image"
                    width={18}
                    height={18}
                  />
                  {user.name}
                  <MoreHorizontal className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                sideOffset={6}
                className="w-[15rem]"
              >
                <DropdownMenuItem
                  className="relative group/newnote"
                  onSelect={() => setOpen(true)}
                >
                  <AppWindow />
                  Command Menu
                  <kbd className="*:bg-neutral-200 *:dark:bg-neutral-500/50 *:size-5 *:rounded-sm *:flex *:items-center *:justify-center *:leading-3 flex items-center gap-0.5 h-fit font-normal absolute right-2 top-1.5 transition-opacity opacity-100 group-hover/newnote:opacity-0">
                    <span className="text-base mt-[0.5px]">⌘</span>
                    <span className="text-xs">K</span>
                  </kbd>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                  <MoonIcon />
                  <span>Theme</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <form action={signOut}>
                    <button type="submit" className="flex items-center gap-2">
                      <LogOut />
                      <span>Sign Out</span>
                    </button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
