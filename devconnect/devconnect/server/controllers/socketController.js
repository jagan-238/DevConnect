const Message = require("../models/Message");
const User = require("../models/User");

const onlineUsers = new Map(); // userId -> socketId

const socketHandler = (io) => {
  io.on("connection", async (socket) => {
    const user = socket.user;
    console.log(`✅ ${user.username} connected — socket: ${socket.id}`);

    // Track online status
    onlineUsers.set(user._id.toString(), socket.id);
    await User.findByIdAndUpdate(user._id, { isOnline: true });

    // Broadcast updated online users list
    io.emit("online_users", Array.from(onlineUsers.keys()));

    // ── JOIN ROOM ──────────────────────────────────────────────────────────
    socket.on("join_room", async ({ roomId }) => {
      socket.join(roomId);
      console.log(`${user.username} joined room ${roomId}`);

      // Load last 30 messages
      const messages = await Message.find({ room: roomId, type: "room" })
        .populate("sender", "username avatar")
        .sort({ createdAt: -1 })
        .limit(30);

      socket.emit("room_history", messages.reverse());

      // Notify room members
      socket.to(roomId).emit("user_joined", {
        userId: user._id,
        username: user.username,
        roomId,
      });
    });

    // ── LEAVE ROOM ─────────────────────────────────────────────────────────
    socket.on("leave_room", ({ roomId }) => {
      socket.leave(roomId);
      socket.to(roomId).emit("user_left", {
        userId: user._id,
        username: user.username,
        roomId,
      });
    });

    // ── SEND ROOM MESSAGE ──────────────────────────────────────────────────
    socket.on("send_message", async ({ roomId, content }) => {
      try {
        if (!content?.trim()) return;

        const message = await Message.create({
          content: content.trim(),
          sender: user._id,
          room: roomId,
          type: "room",
        });

        const populated = await message.populate("sender", "username avatar");

        // Broadcast to all in room (including sender)
        io.to(roomId).emit("receive_message", populated);
      } catch (err) {
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // ── SEND DIRECT MESSAGE ────────────────────────────────────────────────
    socket.on("send_direct_message", async ({ recipientId, content }) => {
      try {
        if (!content?.trim()) return;

        const message = await Message.create({
          content: content.trim(),
          sender: user._id,
          recipient: recipientId,
          type: "direct",
        });

        const populated = await message.populate("sender", "username avatar");

        // Send to recipient if online
        const recipientSocketId = onlineUsers.get(recipientId);
        if (recipientSocketId) {
          io.to(recipientSocketId).emit("receive_direct_message", populated);
        }

        // Send back to sender
        socket.emit("receive_direct_message", populated);
      } catch (err) {
        socket.emit("error", { message: "Failed to send DM" });
      }
    });

    // ── TYPING INDICATOR ───────────────────────────────────────────────────
    socket.on("typing_start", ({ roomId }) => {
      socket.to(roomId).emit("user_typing", { userId: user._id, username: user.username });
    });

    socket.on("typing_stop", ({ roomId }) => {
      socket.to(roomId).emit("user_stopped_typing", { userId: user._id });
    });

    // ── DISCONNECT ─────────────────────────────────────────────────────────
    socket.on("disconnect", async () => {
      console.log(`❌ ${user.username} disconnected`);
      onlineUsers.delete(user._id.toString());
      await User.findByIdAndUpdate(user._id, { isOnline: false });
      io.emit("online_users", Array.from(onlineUsers.keys()));
    });
  });
};

module.exports = socketHandler;
