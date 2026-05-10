const express = require("express");
const Room = require("../models/Room");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// GET /api/rooms — get all public rooms
router.get("/", protect, async (req, res) => {
  try {
    const rooms = await Room.find({ isPrivate: false })
      .populate("createdBy", "username avatar")
      .sort({ createdAt: -1 });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/rooms — create a room
router.post("/", protect, async (req, res) => {
  try {
    const { name, description, isPrivate } = req.body;
    if (!name) return res.status(400).json({ message: "Room name is required" });

    const existing = await Room.findOne({ name });
    if (existing) return res.status(400).json({ message: "Room name already taken" });

    const room = await Room.create({
      name,
      description,
      isPrivate: isPrivate || false,
      createdBy: req.user._id,
      members: [req.user._id],
    });

    const populated = await room.populate("createdBy", "username avatar");
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// POST /api/rooms/:id/join
router.post("/:id/join", protect, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });

    if (!room.members.includes(req.user._id)) {
      room.members.push(req.user._id);
      await room.save();
    }

    res.json({ message: "Joined room", room });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/rooms/:id
router.delete("/:id", protect, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });

    if (room.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await room.deleteOne();
    res.json({ message: "Room deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
