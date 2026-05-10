import { useState } from "react";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";

export default function ChatPage() {
  const [activeRoom, setActiveRoom] = useState(null);
  const [activeDM, setActiveDM] = useState(null); // { _id, username }

  return (
    <div className="flex h-screen bg-dark overflow-hidden">
      <Sidebar
        activeRoom={activeRoom}
        setActiveRoom={(room) => { setActiveRoom(room); setActiveDM(null); }}
        activeDM={activeDM}
        setActiveDM={(user) => { setActiveDM(user); setActiveRoom(null); }}
      />
      <ChatWindow activeRoom={activeRoom} activeDM={activeDM} />
    </div>
  );
}
