export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
      <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce"></div>
      <div
        className="w-3 h-3 bg-gray-400 rounded-full animate-bounce"
        style={{ animationDelay: "0.15s" }}
      ></div>
      <div
        className="w-3 h-3 bg-gray-400 rounded-full animate-bounce"
        style={{ animationDelay: "0.3s" }}
      ></div>
    </div>
  );
}
