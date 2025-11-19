"use client";
import { useState, useEffect, useRef } from "react";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import TypingIndicator from "./TypingIndicator";



type Message = {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
};

export default function ChatContainer() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi Mohamed, how can I help you today?" },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;


    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setIsTyping(true);


    setTimeout(() => {
      const reply =
        "This is a simulated streamed reply. We'll hook the real API later.";

      let index = 0;
      const interval = setInterval(() => {
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant" && last.streaming) {
            last.content += reply[index];
            return [...prev.slice(0, -1), last];
          }
          return [
            ...prev,
            { role: "assistant", content: reply[index], streaming: true },
          ];
        });

        index++;
        if (index === reply.length) {
          clearInterval(interval);
          setIsTyping(false);
          setMessages((prev) => {
            const arr = [...prev];
            arr[arr.length - 1].streaming = false;
            return arr;
          });
        }
      }, 20);
    }, 500);
  };


  useEffect(() => {
    containerRef.current?.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isTyping]);

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      <div className="p-4 shadow-md bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
          AI Assistant
        </h1>
      </div>

      <div
        ref={containerRef}
        className="flex-1 mx-auto w-[80%] overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700"
      >
        {messages.map((msg, i) => (
          <ChatMessage key={i} role={msg.role} content={msg.content} />
        ))}

        {isTyping && <TypingIndicator />}
      </div>

      <div className="mx-auto w-[80%]">
        <ChatInput onSend={sendMessage} />
      </div>
    </div>
  );
}
