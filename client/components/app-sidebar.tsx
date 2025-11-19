"use client";

import * as React from "react";
import {
  Contact,
  Home,
  MessageCirclePlus,
  MessageCircleQuestion,
  MessageSquareShare,
  Search,
} from "lucide-react";

import { NavFavorites } from "@/components/nav-favorites";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { NavUser } from "./nav-user";

const data = {
  user: {
    name: "Soufian poker",
    email: "so006@gmail.com",
    avatar: "/gamboal.jpg",
  },
  navMain: [
    {
      title: "New chat",
      url: "#",
      icon: MessageCirclePlus,
      isActive: true,
    },
    {
      title: "Search chats",
      url: "#",
      icon: Search,
    },
    {
      title: "Home",
      url: "#",
      icon: Home,
    },
    {
      title: "Feedback",
      url: "#",
      icon: MessageSquareShare,
    },
  ],
  navSecondary: [
    {
      title: "Contact",
      url: "#",
      icon: Contact,
    },
    {
      title: "Help",
      url: "#",
      icon: MessageCircleQuestion,
    },
  ],
  favorites: [
    {
      name: "Project Management & Task Tracking",
      url: "#",
    },
    {
      name: "JWT/local storage token handling.",
      url: "#",
    },
    {
      name: "View unanswered questions collected by backend.",
      url: "#",
    },
    {
      name: "View analytics dashboards (charts, counts).",
      url: "#",
    },

    {
      name: "Family Recipe Collection & Meal Planning",
      url: "#",
    },
    {
      name: "Fitness Tracker & Workout Routines",
      url: "#",
    },
    {
      name: "Book Notes & Reading List",
      url: "#",
    },
    {
      name: "Sustainable Gardening Tips & Plant Care",
      url: "#",
    },
    {
      name: "Language Learning Progress & Resources",
      url: "#",
    },
    {
      name: "Home Renovation Ideas & Budget Tracker",
      url: "#",
    },
    {
      name: "Personal Finance & Investment Portfolio",
      url: "#",
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
        <NavMain items={data.navMain} />
      </SidebarHeader>
      <SidebarContent>
        <NavFavorites favorites={data.favorites} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
