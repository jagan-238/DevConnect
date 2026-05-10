import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem("accessToken");
    const newSocket = io(import.meta.env.VITE_SERVER_URL || "http://localhost:5000", {
      auth: { token },
      reconnectionAttempts: 5,
    });

    newSocket.on("online_users", (users) => setOnlineUsers(users));
    newSocket.on("connect_error", (err) => console.error("Socket error:", err.message));

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
