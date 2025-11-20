"use client"

import { AppSidebar } from "@/components/app-sidebar";
import { NavActions } from "@/components/nav-actions";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupText, InputGroupTextarea } from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { DropdownMenu } from "@radix-ui/react-dropdown-menu";
import { ArrowUp, LoaderIcon, PlusIcon } from "lucide-react";
import { useState } from "react";

export default function Page() {
  const [loading,setLoading] = useState(false)

  const send = () =>{
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
    }, 3000);
  }
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2">
          <div className="flex flex-1 items-center gap-2 px-3">
            <SidebarTrigger />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage className="line-clamp-1">
                    Chat with nexus.ai
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="ml-auto px-3">
            <NavActions />
          </div>
        </header>
        <div className="flex flex-col gap-4 md:w-[80%] w-[90%] lg:w-[50%] px-4 py-10 mx-auto items-center mt-[40%] md:mt-[10%]">
          <h1 className="lg:text-3xl text-2xl font-semibold text-center ">Hello, how can I help you?</h1>
          <div className="w-full">
            <InputGroup>
              <InputGroupTextarea placeholder="Ask anything..." className=""/>
                <InputGroupAddon align="block-end">
                  <DropdownMenu>
                  </DropdownMenu>
                  <InputGroupText className="ml-auto">52% used</InputGroupText>
                  <Separator orientation="vertical" />
                  <InputGroupButton
                    variant="default"
                    className="rounded-full cursor-pointer"
                    size="icon-sm"
                    onClick={send}
                    disabled={loading}
                  >
                    {
                      loading ?
                        <LoaderIcon className="animate-spin"/>
                      : 
                        <ArrowUp />
                    }
                    <span className="sr-only">Send</span>
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
