"use client";

import ChatPage from "@/app/page";


export default function HistoryChat({ params }: { params: { url: string } }) {
  return <ChatPage historyUrl={params.url} />;
}
