const mongoose = require("mongoose");

const FriendshipSchema = new mongoose.Schema(
  {
    requester: { type: String, required: true },
    addressee: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "blocked"],
      default: "pending",
    },
  },
  { timestamps: true },
);

FriendshipSchema.index({ requester: 1, addressee: 1 }, { unique: true });

module.exports = mongoose.model("Friendship", FriendshipSchema);
