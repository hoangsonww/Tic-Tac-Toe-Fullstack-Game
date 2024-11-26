const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  dob: { type: String },
  bio: { type: String },
  gamesPlayed: { type: Number, default: 0 },
  profilePicture: { type: String },
  socialMedia: {
    twitter: { type: String },
    facebook: { type: String },
    instagram: { type: String },
  },
});

module.exports = mongoose.model("User", UserSchema);
