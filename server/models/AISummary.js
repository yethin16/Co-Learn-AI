const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  group: { type: mongoose.Schema.Types.ObjectId, ref: "Group" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  summary: String,
  messageIds: [mongoose.Schema.Types.ObjectId]
},{ timestamps:true });

module.exports = mongoose.model("AISummary", schema);
