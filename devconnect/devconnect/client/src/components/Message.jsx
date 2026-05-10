function formatTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function Message({ message, isOwn }) {
  const sender = message.sender;
  const initial = (typeof sender === "object" ? sender?.username : sender)?.[0]?.toUpperCase() || "?";
  const username = typeof sender === "object" ? sender?.username : "You";

  return (
    <div className={`message-bubble flex items-start gap-3 px-1 py-1 rounded-lg hover:bg-slate-800/50 group ${isOwn ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white"
        style={{ background: stringToColor(username) }}
      >
        {initial}
      </div>

      {/* Bubble */}
      <div className={`max-w-[70%] ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
        <div className="flex items-baseline gap-2 mb-0.5">
          {!isOwn && <span className="text-xs font-semibold text-slate-300">{username}</span>}
          <span className="text-xs text-muted opacity-0 group-hover:opacity-100 transition-opacity">
            {formatTime(message.createdAt)}
          </span>
        </div>
        <div
          className={`px-3 py-2 rounded-2xl text-sm leading-relaxed break-words ${
            isOwn
              ? "bg-primary text-white rounded-tr-sm"
              : "bg-slate-700 text-slate-100 rounded-tl-sm"
          }`}
        >
          {message.content}
        </div>
      </div>
    </div>
  );
}

// Deterministic color from username string
function stringToColor(str = "") {
  const colors = [
    "#3b82f6", "#8b5cf6", "#10b981", "#f59e0b",
    "#ef4444", "#06b6d4", "#ec4899", "#84cc16",
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}
