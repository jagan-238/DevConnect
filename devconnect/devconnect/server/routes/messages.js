const express = require("express");
const Message = require("../models/Message");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// GET /api/messages/room/:roomId — get messages for a room (paginated)
router.get("/room/:roomId", protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const skip = (page - 1) * limit;

    const messages = await Message.find({ room: req.params.roomId, type: "room" })
      .populate("sender", "username avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json(messages.reverse());
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/messages/direct/:userId — get DMs between two users
router.get("/direct/:userId", protect, async (req, res) => {
  try {
    const messages = await Message.find({
      type: "direct",
      $or: [
        { sender: req.user._id, recipient: req.params.userId },
        { sender: req.params.userId, recipient: req.user._id },
      ],
    })
      .populate("sender", "username avatar")
      .sort({ createdAt: 1 })
      .limit(50);

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
