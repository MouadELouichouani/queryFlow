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
import { useState, useEffect, useRef, KeyboardEvent, JSX } from "react";
import { useParams } from "next/navigation";
import { ask } from "@/services/ask";
import { getQueriesByHistory } from "@/services/history";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function Page() {
  const params = useParams();

  const routeHistoryUrl = params?.url as string | null;

  const [chatUrl, setChatUrl] = useState<string | null>(routeHistoryUrl);

  const [loading, setLoading] = useState<boolean>(false);
  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamText, setStreamText] = useState<string>("");
  const chatRef = useRef<HTMLDivElement | null>(null);
  const [historyId, setHistoryId] = useState<string | null>(null);

  function formatText(text: string) {
    const regex = /(\*\*([^\*]+)\*\*)|'([^']+)'/g;
    const parts: (string | JSX.Element)[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      const start = match.index;
      const fullMatch = match[0];
      const insideStars = match[2];
      const insideQuotes = match[3];

      if (start > lastIndex) {
        parts.push(text.slice(lastIndex, start));
      }

      if (insideStars) {
        parts.push(
          <strong key={start} className="dark:text-white/90 text-black/90">
            {insideStars.trim()}
          </strong>,
        );
      } else if (insideQuotes) {
        const cleaned = insideQuotes.trim().replace(/^[^\w]+|[^\w]+$/g, "");
        if (cleaned.length >= 5 && cleaned.length <= 30) {
          parts.push(
            <strong key={start} className="text-black dark:text-white">
              {cleaned}
            </strong>,
          );
        } else {
          parts.push(fullMatch);
        }
      }

      lastIndex = start + fullMatch.length;
    }

    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts;
  }

  const send = async () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { role: "user", content: input }]);

    const userMessage = input;
    setInput("");
    setLoading(true);

    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      if (!token) {
        setLoading(false);
        return;
      }

      const queryParams = new URLSearchParams({
        question: userMessage,
      });

      const activeUrl = chatUrl || routeHistoryUrl;

      if (activeUrl) {
        queryParams.append("history_url", activeUrl);
      }

      const response = await ask(token, queryParams);

      const data = response.data;
      const assistantResponse = data.response || "";

      if (data.history_id) {
        if (!historyId) setHistoryId(data.history_id);

        if (data.url && data.url !== chatUrl) {
          setChatUrl(data.url);
          window.history.replaceState(null, "", `/chat/${data.url}`);
        }
      }

      setStreamText("");
      let fullText = "";
      let i = 0;

      const interval = setInterval(() => {
        if (i < assistantResponse.length) {
          fullText += assistantResponse.charAt(i);
          setStreamText(fullText);
          i++;
        } else {
          clearInterval(interval);
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: assistantResponse },
          ]);
          setStreamText("");
          setLoading(false);
        }
      }, 20);
    } catch (err) {
      console.error("Error:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!routeHistoryUrl) return;

    setChatUrl(routeHistoryUrl);

    const loadHistory = async () => {
      setLoading(true);
      try {
        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("token="))
          ?.split("=")[1];

        if (!token) {
          setLoading(false);
          return;
        }

        const response = await getQueriesByHistory(token, routeHistoryUrl);

        if (response.status === 404) {
          setLoading(false);
          return;
        }

        if (response.status !== 200) {
          console.error("Failed to load history with status");
          setLoading(false);
          return;
        }

        const data = await response.data;

        if (data.history_id) {
          setHistoryId(data.history_id);
          setChatUrl(data.url);

          if (Array.isArray(data.messages)) {
            setMessages(data.messages);
          }
        }
      } catch (error) {
        console.error("Error loading history:", error);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [routeHistoryUrl]);

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
                    Chat with queryFlow.ai
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
          className={`flex flex-col w-full md:w-[80%] lg:w-[60%] mx-auto px-4 py-6 ${
            messages.length === 0 ? "mt-[10%]" : ""
          }`}
        >
          <div
            className={`flex flex-col flex-1 ${
              messages.length === 0 ? "justify-center" : "justify-start"
            } gap-4`}
          >
            {loading && messages.length === 0 && (
              <div className="text-center text-lg text-white/50">
                <LoaderIcon className="animate-spin inline-block mr-2" />
                Loading conversation...
              </div>
            )}

            {!loading && messages.length === 0 && (
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
                      ? "ml-auto max-w-[80%] bg-gray-100/90 dark:bg-gray-100/5 text-lg px-4"
                      : "font-sans dark:text-white/70 text-xl text-black/70"
                  }`}
                >
                  {formatText(msg.content)}
                </div>
              ))}

              {streamText && (
                <div className="p-2 rounded-xl text-xl font-sans dark:text-white/70 text-black/70">
                  {formatText(streamText)}
                  <span className="animate-pulse text-lg">▌</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-2">
            <InputGroup>
              <InputGroupTextarea
                className="text-xl font-semibold"
                placeholder="Ask anything..."
                value={input}
                readOnly={loading || !!streamText}
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
                  disabled={loading || !!streamText}
                >
                  {loading || streamText ? (
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
