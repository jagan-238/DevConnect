import { useEffect, useRef, useState } from "react";
import { useSocket } from "../context/SocketContext";
import { useAuth } from "../context/AuthContext";
import Message from "./Message";

export default function ChatWindow({ activeRoom, activeDM }) {
  const { socket } = useSocket();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typingUsers, setTypingUsers] = useState([]);
  const bottomRef = useRef(null);
  const typingTimer = useRef(null);

  // Reset on room/DM change
  useEffect(() => {
    setMessages([]);
    setTypingUsers([]);
    setInput("");

    if (!socket) return;

    if (activeRoom) {
      socket.emit("join_room", { roomId: activeRoom._id });
    }

    return () => {
      if (activeRoom) {
        socket.emit("leave_room", { roomId: activeRoom._id });
      }
    };
  }, [activeRoom?._id, activeDM?._id, socket]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    const onHistory = (msgs) => setMessages(msgs);
    const onMessage = (msg) => setMessages((prev) => [...prev, msg]);
    const onDM = (msg) => setMessages((prev) => [...prev, msg]);
    const onTyping = ({ username }) => {
      setTypingUsers((prev) => prev.includes(username) ? prev : [...prev, username]);
    };
    const onStopTyping = ({ userId }) => {
      setTypingUsers((prev) => prev.filter((u) => u !== userId));
    };

    socket.on("room_history", onHistory);
    socket.on("receive_message", onMessage);
    socket.on("receive_direct_message", onDM);
    socket.on("user_typing", onTyping);
    socket.on("user_stopped_typing", onStopTyping);

    return () => {
      socket.off("room_history", onHistory);
      socket.off("receive_message", onMessage);
      socket.off("receive_direct_message", onDM);
      socket.off("user_typing", onTyping);
      socket.off("user_stopped_typing", onStopTyping);
    };
  }, [socket]);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || !socket) return;

    if (activeRoom) {
      socket.emit("send_message", { roomId: activeRoom._id, content: input });
    } else if (activeDM) {
      socket.emit("send_direct_message", { recipientId: activeDM._id, content: input });
    }

    setInput("");
    socket.emit("typing_stop", { roomId: activeRoom?._id });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (!socket || !activeRoom) return;

    socket.emit("typing_start", { roomId: activeRoom._id });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket.emit("typing_stop", { roomId: activeRoom._id });
    }, 1500);
  };

  if (!activeRoom && !activeDM) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
        <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-4 text-3xl">💬</div>
        <h2 className="text-xl font-semibold text-white mb-2">Welcome to DevConnect</h2>
        <p className="text-muted text-sm max-w-xs">
          Select a room from the sidebar to start chatting with fellow developers.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-700 flex items-center gap-3 flex-shrink-0">
        <span className="text-muted font-bold text-lg">{activeRoom ? "#" : "✉"}</span>
        <div>
          <h2 className="text-white font-semibold text-sm">
            {activeRoom?.name || activeDM?.username}
          </h2>
          {activeRoom?.description && (
            <p className="text-muted text-xs">{activeRoom.description}</p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-1">
        {messages.length === 0 && (
          <div className="text-center text-muted text-sm py-10">
            No messages yet. Say hello! 👋
          </div>
        )}
        {messages.map((msg) => (
          <Message key={msg._id} message={msg} isOwn={msg.sender?._id === user._id || msg.sender === user._id} />
        ))}
        {typingUsers.length > 0 && (
          <div className="text-xs text-muted italic pl-1">
            {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-slate-700 flex-shrink-0">
        <div className="flex items-center gap-3 bg-slate-700 rounded-xl px-4 py-3">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${activeRoom ? "#" + activeRoom.name : activeDM?.username}...`}
            className="flex-1 bg-transparent text-white text-sm placeholder-muted focus:outline-none"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className="text-primary hover:text-blue-400 disabled:text-muted transition-colors font-bold text-lg"
          >
            ➤
          </button>
        </div>
        <p className="text-muted text-xs mt-1.5 pl-1">Enter to send · Shift+Enter for newline</p>
      </div>
    </div>
  );
}
