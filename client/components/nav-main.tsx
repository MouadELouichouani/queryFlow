"use client";

import { Home, Newspaper, SquarePlay, SquarePlus, type LucideIcon } from "lucide-react";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { FeedbackDialog } from "./feedback-dialog";
import Link from "next/link";

export function NavMain() {
  return (
    <SidebarMenu className="flex flex-col gap-3 ml-2">
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <FeedbackDialog />
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
          <Link href={'/'} className="flex gap-2 items-center">
            <SquarePlus size={15}/>
            <span>New chat</span>
          </Link>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
