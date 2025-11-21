"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { NavActions } from "@/components/nav-actions";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { DropdownMenu } from "@radix-ui/react-dropdown-menu";
import { ArrowUp, LoaderIcon } from "lucide-react";
import { useState, useEffect, useRef, KeyboardEvent } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function Page() {
  const [loading, setLoading] = useState<boolean>(false);
  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamText, setStreamText] = useState<string>("");
  const chatRef = useRef<HTMLDivElement | null>(null);

  const send = () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { role: "user", content: input }]);
    setInput("");
    setLoading(true);

    const reply =
      "Hello! This is a streaming AI response demo. How can I help? Hello! This is a streaming AI response demo. How can I help?";
    let i = 0;
    const interval = setInterval(() => {
      setStreamText(reply.slice(0, i));
      i++;
      if (i > reply.length) {
        clearInterval(interval);
        setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
        setStreamText("");
        setLoading(false);
      }
    }, 30);
  };

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, streamText]);

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col h-full">
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

        <div
          className={`flex flex-col w-full md:w-[80%] lg:w-[60%] mx-auto px-4 py-6 ${messages.length === 0 ? "mt-[10%]" : ""}`}
        >
          <div
            className={`flex flex-col flex-1 ${messages.length === 0 ? "justify-center" : "justify-start"} gap-4`}
          >
            {messages.length === 0 && (
              <h1 className="text-center lg:text-3xl text-2xl font-semibold">
                Hello, how can I help you?
              </h1>
            )}

            <div
              ref={chatRef}
              className="flex flex-col gap-4 overflow-y-auto px-3 py-2 rounded-lg flex-1 max-h-[70vh] no-scrollbar"
            >
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`p-2 rounded-xl ${
                    msg.role === "user"
                      ? "ml-auto max-w-[80%] bg-gray-100/90 dark:bg-gray-100/5 text-md px-4"
                      : "font-sans dark:text-white/60 text-lg text-black/60"
                  }`}
                >
                  {msg.content}
                </div>
              ))}

              {streamText && (
                <div className="p-2 rounded-xl text-lg font-sans dark:text-white/60 text-black/60">
                  {streamText}
                  <span className="animate-pulse text-lg">▌</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-2">
            <InputGroup>
              <InputGroupTextarea
                placeholder="Ask anything..."
                value={input}
                readOnly={loading}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                rows={Math.min(6, Math.max(1, input.split("\n").length))}
              />
              <InputGroupAddon align="block-end">
                <DropdownMenu />
                <InputGroupText className="ml-auto">52% used</InputGroupText>
                <Separator orientation="vertical" />
                <InputGroupButton
                  variant="default"
                  className="rounded-full cursor-pointer"
                  size="icon-sm"
                  onClick={send}
                  disabled={loading}
                >
                  {loading ? (
                    <LoaderIcon className="animate-spin" />
                  ) : (
                    <ArrowUp />
                  )}
                  <span className="sr-only">Send</span>
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>

            <p className="mt-2 text-white/40 text-sm text-center">
              queryFlow always makes mistakes. Don&apos;t take anything as
              absolute.
            </p>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
