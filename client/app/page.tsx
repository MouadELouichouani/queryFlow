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
import { ArrowUp, Loader2Icon, LoaderIcon, Mic, Mic2 } from "lucide-react";
import { useState, useEffect, useRef, KeyboardEvent, JSX } from "react";
import { useParams } from "next/navigation";
import { ask } from "@/services/ask";
import { getQueriesByHistory } from "@/services/history";
import { User } from "@/types/user";
import { getCurrentUser } from "@/services/auth";
import { Button } from "@/components/ui/button";
import AudioRecorderDialog from "@/components/audio-recording-dialog";

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
  const [loadingRes, setLoadingRes] = useState(false);
  const [loadUser, setLoadUser] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  function formatText(text: string) {
    if (typeof text !== "string") return text;

    let cleaned = text.trim();

    if (
      (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
      (cleaned.startsWith("'") && cleaned.endsWith("'"))
    ) {
      cleaned = cleaned.slice(1, -1).trim();
    }

    const regex = /(\*\*([^\*]+)\*\*)|'([^']+)'/g;

    const parts: (string | JSX.Element)[] = [];
    let last = 0;
    let match;

    while ((match = regex.exec(cleaned)) !== null) {
      const start = match.index;
      const full = match[0];
      const bold = match[2];
      const insideQuotes = match[3];

      if (start > last) {
        parts.push(cleaned.slice(last, start));
      }

      if (bold) {
        parts.push(
          <strong key={start} className="dark:text-white/90 text-black/90">
            {bold.trim()}
          </strong>,
        );
      } else if (insideQuotes) {
        const short = insideQuotes.trim();

        if (short.length >= 5 && short.length <= 30) {
          parts.push(
            <strong key={start} className="text-black dark:text-white">
              {short}
            </strong>,
          );
        } else {
          parts.push(full);
        }
      }

      last = start + full.length;
    }

    if (last < cleaned.length) {
      parts.push(cleaned.slice(last));
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

      setLoadingRes(true);

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

      setLoadingRes(false);

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
      setLoadingRes(false);
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

  useEffect(() => {
    const fetchUser = async () => {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      if (!token) {
        setLoadUser(false);
        return;
      }
      try {
        const response = await getCurrentUser(token);
        setUser(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadUser(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col h-full">
        <header className="flex h-12 shrink-0 items-center gap-2">
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
          className={`flex flex-col w-full md:w-[80%] lg:w-[60%] mx-auto px-4 ${
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

            {!loading && !loadUser && user && messages.length === 0 && (
              <h1
                className="text-center lg:text-3xl text-2xl font-semibold 
                  bg-linear-to-r from-blue-200 via-blue-500 to-blue-200 
                            bg-clip-text text-transparent"
              >
                Hi {user?.name.split(" ")[0]}! ask any question related to tech
              </h1>
            )}

            <div
              ref={chatRef}
              className="flex flex-col gap-4 overflow-y-auto px-3 py-2 rounded-lg flex-1 max-h-[76vh] no-scrollbar"
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

              {loadingRes && (
                <div
                  className={`p-2 flex gap-1 items-center rounded-xl font-sans text-xl text-black/70 dark:text-white/70 animate-pulse`}
                  style={{ animationDuration: "1.3s" }}
                >
                  <Loader2Icon
                    className="animate-spin"
                    style={{ animationDuration: "0.6s" }}
                  />{" "}
                  <span>Wait a sec...</span>
                </div>
              )}

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
                placeholder="Ask anything related to tech..."
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
                <Button className="rounded-full cursor-pointer"
                  size="icon-sm"
                >
                  <Mic />
                </Button>
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
            <AudioRecorderDialog />

            <p className="mt-2 dark:text-white/40 text-sm text-center text-black/40">
              queryFlow-v1
            </p>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
