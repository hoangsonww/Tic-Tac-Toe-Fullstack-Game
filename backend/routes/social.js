const express = require("express");
const authenticate = require("../middleware/authMiddleware");
const Friendship = require("../models/Friendship");
const { getPresenceSnapshot } = require("../realtime/websocket");

const router = express.Router();

router.post("/friend-request", authenticate, async (req, res) => {
  const { requester, addressee } = req.body;
  if (!requester || !addressee) {
    return res
      .status(400)
      .json({ error: "requester and addressee are required" });
  }

  try {
    const friendship = await Friendship.findOneAndUpdate(
      { requester, addressee },
      { requester, addressee, status: "pending" },
      { new: true, upsert: true },
    );
    res.status(201).json({ friendship });
  } catch (error) {
    console.error("Error creating friend request", error);
    res.status(500).json({ error: "Failed to create friend request" });
  }
});

router.post("/friend-accept", authenticate, async (req, res) => {
  const { requestId } = req.body;
  if (!requestId) {
    return res.status(400).json({ error: "requestId is required" });
  }
  try {
    const friendship = await Friendship.findByIdAndUpdate(
      requestId,
      { status: "accepted" },
      { new: true },
    );
    if (!friendship) {
      return res.status(404).json({ error: "Request not found" });
    }
    res.json({ friendship });
  } catch (error) {
    console.error("Error accepting friend request", error);
    res.status(500).json({ error: "Failed to accept friend request" });
  }
});

router.get("/friends", authenticate, async (req, res) => {
  const { username } = req.query;
  if (!username) {
    return res.status(400).json({ error: "username is required" });
  }
  try {
    const friendships = await Friendship.find({
      status: "accepted",
      $or: [{ requester: username }, { addressee: username }],
    }).sort({ updatedAt: -1 });

    const friends = friendships.map((f) =>
      f.requester === username ? f.addressee : f.requester,
    );

    res.json({ friends, friendships });
  } catch (error) {
    console.error("Error fetching friends", error);
    res.status(500).json({ error: "Failed to fetch friends" });
  }
});

router.get("/presence", authenticate, async (req, res) => {
  const { usernames } = req.query;
  const list = usernames ? usernames.split(",").map((u) => u.trim()) : [];
  try {
    const snapshot = getPresenceSnapshot(list);
    res.json({ presence: snapshot });
  } catch (error) {
    console.error("Error fetching presence", error);
    res.status(500).json({ error: "Failed to fetch presence" });
  }
});

module.exports = router;
