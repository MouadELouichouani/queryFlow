"use client";

import * as React from "react";
import { Flag, MoreHorizontal, Share, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ModeToggle } from "./toggle-mode";

const data = [
  [
    {
      label: "Report",
      icon: Flag,
    },
    {
      label: "Delete",
      icon: Trash2,
    },
  ],
];

export function NavActions() {
  const [isOpen, setIsOpen] = React.useState(false);


  return (
    <div className="flex items-center gap-2 text-sm">
      <div className="text-muted-foreground hidden font-medium md:inline-block">
        Developed to assist you!
      </div>
      <Button variant="ghost" className="rounded-full cursor-pointer">
        Share
        <Share />
      </Button>
      <ModeToggle />
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
            <MoreHorizontal className="ml-2"/>
        </PopoverTrigger>
        <PopoverContent
          className="w-40 overflow-hidden rounded-lg p-0"
          align="end"
        >
          <Sidebar collapsible="none" className="bg-transparent">
            <SidebarContent>
              {data.map((group, index) => (
                <SidebarGroup key={index} className="border-b last:border-none">
                  <SidebarGroupContent className="gap-0">
                    <SidebarMenu>
                      {group.map((item, index) => (
                        <SidebarMenuItem key={index}>
                          <SidebarMenuButton
                            className={
                              item.label === "Delete"
                                ? "text-red-500 hover:text-red-500"
                                : ""
                            }
                          >
                            <item.icon /> <span>{item.label}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              ))}
            </SidebarContent>
          </Sidebar>
        </PopoverContent>
      </Popover>
    </div>
  );
}
