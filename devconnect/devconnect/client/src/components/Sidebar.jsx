import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import api from "../utils/api";

export default function Sidebar({ activeRoom, setActiveRoom, activeDM, setActiveDM }) {
  const { user, logout } = useAuth();
  const { onlineUsers } = useSocket();
  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);
  const [newRoomName, setNewRoomName] = useState("");
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [tab, setTab] = useState("rooms"); // "rooms" | "dms"

  useEffect(() => {
    api.get("/rooms").then((r) => setRooms(r.data)).catch(console.error);
  }, []);

  const createRoom = async () => {
    if (!newRoomName.trim()) return;
    try {
      const res = await api.post("/rooms", { name: newRoomName.trim() });
      setRooms((prev) => [res.data, ...prev]);
      setNewRoomName("");
      setShowCreateRoom(false);
      setActiveRoom(res.data);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create room");
    }
  };

  // Fetch all users for DM list
  useEffect(() => {
    if (tab === "dms") {
      api.get("/auth/users").then((r) => setUsers(r.data)).catch(console.error);
    }
  }, [tab]);

  const isOnline = (userId) => onlineUsers.includes(userId);

  return (
    <aside className="w-64 bg-sidebar border-r border-slate-700 flex flex-col h-full flex-shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-sm">D</div>
          <span className="font-bold text-white">DevConnect</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-700">
        {["rooms", "dms"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
              tab === t ? "text-primary border-b-2 border-primary" : "text-muted hover:text-white"
            }`}
          >
            {t === "rooms" ? "Rooms" : "Direct"}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-2">
        {tab === "rooms" && (
          <>
            <div className="flex items-center justify-between px-2 py-2">
              <span className="text-xs text-muted uppercase tracking-wider font-semibold">Rooms</span>
              <button
                onClick={() => setShowCreateRoom(!showCreateRoom)}
                className="text-muted hover:text-white text-lg leading-none"
                title="Create room"
              >
                +
              </button>
            </div>

            {showCreateRoom && (
              <div className="px-2 mb-2 flex gap-1">
                <input
                  type="text"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && createRoom()}
                  placeholder="room-name"
                  className="flex-1 bg-dark border border-slate-600 rounded px-2 py-1 text-white text-xs focus:outline-none focus:border-primary"
                />
                <button onClick={createRoom} className="text-xs bg-primary text-white px-2 py-1 rounded hover:bg-blue-600">
                  Add
                </button>
              </div>
            )}

            {rooms.map((room) => (
              <button
                key={room._id}
                onClick={() => setActiveRoom(room)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                  activeRoom?._id === room._id
                    ? "bg-primary/20 text-primary"
                    : "text-slate-300 hover:bg-slate-700 hover:text-white"
                }`}
              >
                <span className="text-muted">#</span>
                <span className="truncate">{room.name}</span>
              </button>
            ))}
          </>
        )}

        {tab === "dms" && (
          <>
            <div className="px-2 py-2">
              <span className="text-xs text-muted uppercase tracking-wider font-semibold">Online Users</span>
            </div>
            {onlineUsers
              .filter((id) => id !== user._id)
              .map((userId) => (
                <button
                  key={userId}
                  onClick={() => setActiveDM({ _id: userId, username: userId })}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                    activeDM?._id === userId
                      ? "bg-primary/20 text-primary"
                      : "text-slate-300 hover:bg-slate-700 hover:text-white"
                  }`}
                >
                  <div className="relative">
                    <div className="w-6 h-6 bg-slate-600 rounded-full flex items-center justify-center text-xs text-white">
                      {userId[0]?.toUpperCase()}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-sidebar" />
                  </div>
                  <span className="truncate">{userId}</span>
                </button>
              ))}
            {onlineUsers.filter((id) => id !== user._id).length === 0 && (
              <p className="text-muted text-xs px-3 py-2">No other users online</p>
            )}
          </>
        )}
      </div>

      {/* User footer */}
      <div className="p-3 border-t border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <div className="relative flex-shrink-0">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-sidebar" />
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.username}</p>
            <p className="text-muted text-xs">Online</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="text-muted hover:text-red-400 transition-colors text-xs ml-2 flex-shrink-0"
          title="Logout"
        >
          ⏻
        </button>
      </div>
    </aside>
  );
}
