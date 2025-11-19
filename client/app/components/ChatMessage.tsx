export default function ChatMessage({
  role,
  content,
}: {
  role: string;
  content: string;
}) {
  const isUser = role === "user";

  return (
    <div
      className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : ""}`}
    >
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${
          isUser ? "bg-blue-600" : "bg-green-600"
        }`}
      >
        {isUser ? "You" : "AI"}
      </div>

      <p
        className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
          isUser
            ? "bg-blue-600 text-white"
            : "bg-white dark:bg-gray-800 dark:text-gray-200 text-gray-900"
        }`}
      >
        {content}
      </p>
    </div>
  );
}
